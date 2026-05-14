import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n=== ForgeEscrow Deployment ===");
  console.log(`Network:   ${network.name} (chainId: ${network.config.chainId})`);
  console.log(`Deployer:  ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${ethers.formatEther(balance)} zkLTC`);

  if (balance === 0n) {
    throw new Error(
      "Deployer has no balance. Get testnet tokens from https://liteforge.hub.caldera.xyz"
    );
  }

  console.log("\nDeploying ForgeEscrow...");
  const ForgeEscrow = await ethers.getContractFactory("ForgeEscrow");
  const contract = await ForgeEscrow.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log("\n=== Deployment Successful ===");
  console.log(`Contract Address:  ${contractAddress}`);
  console.log(`Transaction Hash:  ${deployTx?.hash}`);
  console.log(
    `Explorer:          https://liteforge.explorer.caldera.xyz/address/${contractAddress}`
  );
  console.log(
    `Tx Explorer:       https://liteforge.explorer.caldera.xyz/tx/${deployTx?.hash}`
  );

  // Verify owner
  const owner = await contract.owner();
  console.log(`\nContract Owner: ${owner}`);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress,
    deployerAddress: deployer.address,
    transactionHash: deployTx?.hash,
    explorerUrl: `https://liteforge.explorer.caldera.xyz/address/${contractAddress}`,
    txExplorerUrl: `https://liteforge.explorer.caldera.xyz/tx/${deployTx?.hash}`,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const outPath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: deployments/${network.name}.json`);

  // Update contract address in frontend
  const hookPath = path.join(
    __dirname,
    "..",
    "src",
    "hooks",
    "useContract.ts"
  );
  if (fs.existsSync(hookPath)) {
    let hookContent = fs.readFileSync(hookPath, "utf8");
    hookContent = hookContent.replace(
      /const CONTRACT_ADDRESS = '0x[0-9a-fA-F]*';.*$/m,
      `const CONTRACT_ADDRESS = '${contractAddress}'; // Deployed on ${network.name}`
    );
    fs.writeFileSync(hookPath, hookContent);
    console.log("Updated CONTRACT_ADDRESS in src/hooks/useContract.ts");
  }

  return deploymentInfo;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
