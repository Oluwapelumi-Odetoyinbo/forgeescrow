import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ForgeEscrow } from "../typechain-types";

describe("ForgeEscrow", function () {
  let contract: ForgeEscrow;
  let owner: SignerWithAddress;
  let client: SignerWithAddress;
  let freelancer: SignerWithAddress;
  let thirdParty: SignerWithAddress;

  const ONE_ETH = ethers.parseEther("1");
  const HALF_ETH = ethers.parseEther("0.5");
  const PLATFORM_FEE = 2n; // 2%

  const FUTURE_DEADLINE = () => Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days

  function calcFee(amount: bigint): bigint {
    return (amount * PLATFORM_FEE) / 100n;
  }

  async function deployContract() {
    const ForgeEscrow = await ethers.getContractFactory("ForgeEscrow");
    return ForgeEscrow.deploy() as Promise<ForgeEscrow>;
  }

  async function createBasicEscrow(
    overrides: {
      milestoneAmounts?: bigint[];
      deadline?: number;
      freelancerAddr?: string;
    } = {}
  ) {
    const amounts = overrides.milestoneAmounts ?? [HALF_ETH, HALF_ETH];
    const deadline = overrides.deadline ?? FUTURE_DEADLINE();
    const freelancerAddr = overrides.freelancerAddr ?? freelancer.address;

    const tx = await contract
      .connect(client)
      .createEscrow(
        freelancerAddr,
        "Test Project",
        "A test project",
        amounts.map((_, i) => `Milestone ${i + 1}`),
        amounts,
        deadline
      );
    const receipt = await tx.wait();
    const event = receipt?.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e?.name === "EscrowCreated");

    return Number(event?.args?.escrowId ?? 1);
  }

  beforeEach(async function () {
    [owner, client, freelancer, thirdParty] = await ethers.getSigners();
    contract = await deployContract();
  });

  // ─── Deployment ────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("initialises platform fee at 2%", async function () {
      expect(await contract.platformFeePercent()).to.equal(2n);
    });

    it("starts escrow counter at 0", async function () {
      expect(await contract.escrowCounter()).to.equal(0n);
    });
  });

  // ─── Create Escrow ─────────────────────────────────────────────────────────

  describe("createEscrow", function () {
    it("creates an escrow and emits EscrowCreated", async function () {
      const deadline = FUTURE_DEADLINE();
      await expect(
        contract
          .connect(client)
          .createEscrow(
            freelancer.address,
            "Logo Design",
            "Create a logo",
            ["Draft", "Final"],
            [HALF_ETH, HALF_ETH],
            deadline
          )
      )
        .to.emit(contract, "EscrowCreated")
        .withArgs(1n, client.address, freelancer.address, ONE_ETH);
    });

    it("stores escrow details correctly", async function () {
      const id = await createBasicEscrow();
      const escrow = await contract.getEscrow(id);
      expect(escrow.client).to.equal(client.address);
      expect(escrow.freelancer).to.equal(freelancer.address);
      expect(escrow.totalAmount).to.equal(ONE_ETH);
      expect(escrow.status).to.equal(0n); // Created
    });

    it("increments escrow counter", async function () {
      await createBasicEscrow();
      await createBasicEscrow();
      expect(await contract.escrowCounter()).to.equal(2n);
    });

    it("rejects zero address freelancer", async function () {
      await expect(
        contract
          .connect(client)
          .createEscrow(
            ethers.ZeroAddress,
            "T",
            "D",
            ["M1"],
            [ONE_ETH],
            FUTURE_DEADLINE()
          )
      ).to.be.revertedWith("Invalid freelancer address");
    });

    it("rejects client == freelancer", async function () {
      await expect(
        contract
          .connect(client)
          .createEscrow(
            client.address,
            "T",
            "D",
            ["M1"],
            [ONE_ETH],
            FUTURE_DEADLINE()
          )
      ).to.be.revertedWith("Client and freelancer cannot be the same");
    });

    it("rejects past deadline", async function () {
      const past = Math.floor(Date.now() / 1000) - 1;
      await expect(
        contract
          .connect(client)
          .createEscrow(
            freelancer.address,
            "T",
            "D",
            ["M1"],
            [ONE_ETH],
            past
          )
      ).to.be.revertedWith("Deadline must be in the future");
    });

    it("rejects mismatched milestone arrays", async function () {
      await expect(
        contract
          .connect(client)
          .createEscrow(
            freelancer.address,
            "T",
            "D",
            ["M1", "M2"],
            [ONE_ETH],
            FUTURE_DEADLINE()
          )
      ).to.be.revertedWith("Milestone arrays length mismatch");
    });

    it("rejects empty title", async function () {
      await expect(
        contract
          .connect(client)
          .createEscrow(
            freelancer.address,
            "",
            "D",
            ["M1"],
            [ONE_ETH],
            FUTURE_DEADLINE()
          )
      ).to.be.revertedWith("Title cannot be empty");
    });
  });

  // ─── Fund Escrow ───────────────────────────────────────────────────────────

  describe("fundEscrow", function () {
    it("client can fund an escrow and status becomes Funded", async function () {
      const id = await createBasicEscrow();
      await expect(
        contract.connect(client).fundEscrow(id, { value: ONE_ETH })
      )
        .to.emit(contract, "EscrowFunded")
        .withArgs(id, ONE_ETH);

      const escrow = await contract.getEscrow(id);
      expect(escrow.status).to.equal(1n); // Funded
      expect(escrow.depositedAmount).to.equal(ONE_ETH);
    });

    it("non-client cannot fund", async function () {
      const id = await createBasicEscrow();
      await expect(
        contract.connect(thirdParty).fundEscrow(id, { value: ONE_ETH })
      ).to.be.revertedWith("Only client can call this function");
    });

    it("cannot overfund escrow", async function () {
      const id = await createBasicEscrow();
      const twoEth = ethers.parseEther("2");
      await expect(
        contract.connect(client).fundEscrow(id, { value: twoEth })
      ).to.be.revertedWith("Exceeds total amount");
    });

    it("rejects zero value", async function () {
      const id = await createBasicEscrow();
      await expect(
        contract.connect(client).fundEscrow(id, { value: 0n })
      ).to.be.revertedWith("Must send funds");
    });
  });

  // ─── Complete Milestone ────────────────────────────────────────────────────

  describe("completeMilestone", function () {
    let escrowId: number;

    beforeEach(async function () {
      escrowId = await createBasicEscrow();
      await contract.connect(client).fundEscrow(escrowId, { value: ONE_ETH });
    });

    it("freelancer marks milestone complete and status moves to InProgress", async function () {
      await expect(
        contract.connect(freelancer).completeMilestone(escrowId, 0)
      )
        .to.emit(contract, "MilestoneCompleted")
        .withArgs(escrowId, 0);

      const milestone = await contract.getMilestone(escrowId, 0);
      expect(milestone.completed).to.equal(true);

      const escrow = await contract.getEscrow(escrowId);
      expect(escrow.status).to.equal(2n); // InProgress
    });

    it("non-freelancer cannot complete milestone", async function () {
      await expect(
        contract.connect(client).completeMilestone(escrowId, 0)
      ).to.be.revertedWith("Only freelancer can call this function");
    });

    it("cannot complete already-completed milestone", async function () {
      await contract.connect(freelancer).completeMilestone(escrowId, 0);
      await expect(
        contract.connect(freelancer).completeMilestone(escrowId, 0)
      ).to.be.revertedWith("Milestone already completed");
    });
  });

  // ─── Approve Milestone & Release Payment ──────────────────────────────────

  describe("approveMilestone", function () {
    let escrowId: number;

    beforeEach(async function () {
      escrowId = await createBasicEscrow();
      await contract.connect(client).fundEscrow(escrowId, { value: ONE_ETH });
      await contract.connect(freelancer).completeMilestone(escrowId, 0);
    });

    it("client approves milestone and payment is released", async function () {
      const freelancerBefore = await ethers.provider.getBalance(
        freelancer.address
      );
      const ownerBefore = await ethers.provider.getBalance(owner.address);

      await expect(
        contract.connect(client).approveMilestone(escrowId, 0)
      )
        .to.emit(contract, "MilestoneApproved")
        .withArgs(escrowId, 0, HALF_ETH)
        .and.to.emit(contract, "PaymentReleased");

      const fee = calcFee(HALF_ETH);
      const freelancerPayment = HALF_ETH - fee;

      const freelancerAfter = await ethers.provider.getBalance(
        freelancer.address
      );
      const ownerAfter = await ethers.provider.getBalance(owner.address);

      expect(freelancerAfter - freelancerBefore).to.equal(freelancerPayment);
      expect(ownerAfter - ownerBefore).to.equal(fee);
    });

    it("approving all milestones marks escrow Completed", async function () {
      await contract.connect(freelancer).completeMilestone(escrowId, 1);
      await contract.connect(client).approveMilestone(escrowId, 0);
      await contract.connect(client).approveMilestone(escrowId, 1);

      const escrow = await contract.getEscrow(escrowId);
      expect(escrow.status).to.equal(3n); // Completed
    });

    it("non-client cannot approve", async function () {
      await expect(
        contract.connect(freelancer).approveMilestone(escrowId, 0)
      ).to.be.revertedWith("Only client can call this function");
    });

    it("cannot approve uncompleted milestone", async function () {
      await expect(
        contract.connect(client).approveMilestone(escrowId, 1)
      ).to.be.revertedWith("Milestone not completed");
    });
  });

  // ─── Cancel Escrow ─────────────────────────────────────────────────────────

  describe("cancelEscrow", function () {
    it("client cancels unfunded escrow", async function () {
      const id = await createBasicEscrow();
      await expect(contract.connect(client).cancelEscrow(id))
        .to.emit(contract, "EscrowCancelled")
        .withArgs(id);

      const escrow = await contract.getEscrow(id);
      expect(escrow.status).to.equal(4n); // Cancelled
    });

    it("cannot cancel a funded escrow", async function () {
      const id = await createBasicEscrow();
      await contract.connect(client).fundEscrow(id, { value: ONE_ETH });
      await expect(
        contract.connect(client).cancelEscrow(id)
      ).to.be.revertedWith("Can only cancel unfunded escrow");
    });

    it("non-client cannot cancel", async function () {
      const id = await createBasicEscrow();
      await expect(
        contract.connect(thirdParty).cancelEscrow(id)
      ).to.be.revertedWith("Only client can call this function");
    });
  });

  // ─── Dispute ───────────────────────────────────────────────────────────────

  describe("raiseDispute", function () {
    let escrowId: number;

    beforeEach(async function () {
      escrowId = await createBasicEscrow();
      await contract.connect(client).fundEscrow(escrowId, { value: ONE_ETH });
    });

    it("client can raise dispute on funded escrow", async function () {
      await expect(contract.connect(client).raiseDispute(escrowId))
        .to.emit(contract, "DisputeRaised")
        .withArgs(escrowId, client.address);

      const escrow = await contract.getEscrow(escrowId);
      expect(escrow.disputed).to.equal(true);
      expect(escrow.status).to.equal(5n); // Disputed
    });

    it("freelancer can raise dispute", async function () {
      await contract.connect(freelancer).completeMilestone(escrowId, 0);
      await expect(contract.connect(freelancer).raiseDispute(escrowId))
        .to.emit(contract, "DisputeRaised")
        .withArgs(escrowId, freelancer.address);
    });

    it("third party cannot raise dispute", async function () {
      await expect(
        contract.connect(thirdParty).raiseDispute(escrowId)
      ).to.be.revertedWith("Only client or freelancer can call this function");
    });

    it("cannot raise dispute twice", async function () {
      await contract.connect(client).raiseDispute(escrowId);
      // Status becomes Disputed after first raise, so status check fires before duplicate check
      await expect(
        contract.connect(client).raiseDispute(escrowId)
      ).to.be.revertedWith("Cannot dispute in current state");
    });
  });

  // ─── Resolve Dispute ───────────────────────────────────────────────────────

  describe("resolveDispute", function () {
    let escrowId: number;

    beforeEach(async function () {
      escrowId = await createBasicEscrow();
      await contract.connect(client).fundEscrow(escrowId, { value: ONE_ETH });
      await contract.connect(client).raiseDispute(escrowId);
    });

    it("owner resolves dispute with 50/50 split", async function () {
      const clientBefore = await ethers.provider.getBalance(client.address);
      const freelancerBefore = await ethers.provider.getBalance(
        freelancer.address
      );

      await expect(
        contract.connect(owner).resolveDispute(escrowId, 50)
      )
        .to.emit(contract, "DisputeResolved")
        .withArgs(escrowId, owner.address);

      const clientAfter = await ethers.provider.getBalance(client.address);
      const freelancerAfter = await ethers.provider.getBalance(
        freelancer.address
      );

      expect(clientAfter - clientBefore).to.equal(HALF_ETH);
      expect(freelancerAfter - freelancerBefore).to.equal(HALF_ETH);
    });

    it("owner resolves dispute awarding 100% to client", async function () {
      const clientBefore = await ethers.provider.getBalance(client.address);
      await contract.connect(owner).resolveDispute(escrowId, 100);
      const clientAfter = await ethers.provider.getBalance(client.address);
      expect(clientAfter - clientBefore).to.equal(ONE_ETH);
    });

    it("owner resolves dispute awarding 100% to freelancer", async function () {
      const freelancerBefore = await ethers.provider.getBalance(
        freelancer.address
      );
      await contract.connect(owner).resolveDispute(escrowId, 0);
      const freelancerAfter = await ethers.provider.getBalance(
        freelancer.address
      );
      expect(freelancerAfter - freelancerBefore).to.equal(ONE_ETH);
    });

    it("non-owner cannot resolve dispute", async function () {
      await expect(
        contract.connect(client).resolveDispute(escrowId, 50)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("marks escrow as Completed after resolution", async function () {
      await contract.connect(owner).resolveDispute(escrowId, 50);
      const escrow = await contract.getEscrow(escrowId);
      expect(escrow.status).to.equal(3n); // Completed
      expect(escrow.disputed).to.equal(false);
    });
  });

  // ─── Full Escrow Flow ──────────────────────────────────────────────────────

  describe("Full happy-path flow", function () {
    it("complete lifecycle: create → fund → complete milestones → approve all → Completed", async function () {
      // Create
      const id = await createBasicEscrow({
        milestoneAmounts: [HALF_ETH, HALF_ETH],
      });

      // Fund
      await contract.connect(client).fundEscrow(id, { value: ONE_ETH });
      expect((await contract.getEscrow(id)).status).to.equal(1n);

      // Complete milestone 0
      await contract.connect(freelancer).completeMilestone(id, 0);
      expect((await contract.getEscrow(id)).status).to.equal(2n);

      // Approve milestone 0
      await contract.connect(client).approveMilestone(id, 0);

      // Complete milestone 1
      await contract.connect(freelancer).completeMilestone(id, 1);

      // Approve milestone 1 → escrow Completed
      await contract.connect(client).approveMilestone(id, 1);
      expect((await contract.getEscrow(id)).status).to.equal(3n);
    });
  });

  // ─── Admin Functions ───────────────────────────────────────────────────────

  describe("Admin", function () {
    it("owner can update platform fee", async function () {
      await expect(contract.connect(owner).updatePlatformFee(5))
        .to.emit(contract, "PlatformFeeUpdated")
        .withArgs(5);
      expect(await contract.platformFeePercent()).to.equal(5n);
    });

    it("platform fee cannot exceed 10%", async function () {
      await expect(
        contract.connect(owner).updatePlatformFee(11)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("owner can transfer ownership", async function () {
      await expect(
        contract.connect(owner).transferOwnership(thirdParty.address)
      )
        .to.emit(contract, "OwnershipTransferred")
        .withArgs(owner.address, thirdParty.address);
      expect(await contract.owner()).to.equal(thirdParty.address);
    });
  });

  // ─── View Functions ────────────────────────────────────────────────────────

  describe("View functions", function () {
    it("getClientEscrows returns correct IDs", async function () {
      const id1 = await createBasicEscrow();
      const id2 = await createBasicEscrow();
      const ids = await contract.getClientEscrows(client.address);
      expect(ids.map(Number)).to.deep.equal([id1, id2]);
    });

    it("getFreelancerEscrows returns correct IDs", async function () {
      const id = await createBasicEscrow();
      const ids = await contract.getFreelancerEscrows(freelancer.address);
      expect(ids.map(Number)).to.include(id);
    });

    it("getMilestoneCount returns correct count", async function () {
      const id = await createBasicEscrow({
        milestoneAmounts: [HALF_ETH, HALF_ETH],
      });
      expect(await contract.getMilestoneCount(id)).to.equal(2n);
    });

    it("getContractBalance reflects funded amount", async function () {
      const id = await createBasicEscrow();
      await contract.connect(client).fundEscrow(id, { value: ONE_ETH });
      expect(await contract.getContractBalance()).to.equal(ONE_ETH);
    });
  });
});
