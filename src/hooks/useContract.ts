import { useState } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';
import toast from 'react-hot-toast';
import { Escrow, Milestone } from '../types';
import { FORGE_ESCROW_ABI } from '../abi/ForgeEscrow';

// Updated by deploy script — see deployments/liteforge.json for details
const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

export const useContract = () => {
  const [loading, setLoading] = useState(false);

  const getContract = async () => {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, FORGE_ESCROW_ABI, signer);
  };

  const createEscrow = async (
    freelancer: string,
    title: string,
    description: string,
    milestones: { description: string; amount: string }[],
    deadline: number
  ) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const milestoneDescriptions = milestones.map(m => m.description);
      const milestoneAmounts = milestones.map(m => parseEther(m.amount));

      const tx = await contract.createEscrow(
        freelancer,
        title,
        description,
        milestoneDescriptions,
        milestoneAmounts,
        deadline
      );

      toast.loading('Creating escrow...', { id: 'create' });
      await tx.wait();
      toast.success('Escrow created successfully!', { id: 'create' });

      return true;
    } catch (error: any) {
      console.error('Error creating escrow:', error);
      toast.error(error.message || 'Failed to create escrow', { id: 'create' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fundEscrow = async (escrowId: number, amount: string) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.fundEscrow(escrowId, {
        value: parseEther(amount),
      });

      toast.loading('Funding escrow...', { id: 'fund' });
      await tx.wait();
      toast.success('Escrow funded successfully!', { id: 'fund' });

      return true;
    } catch (error: any) {
      console.error('Error funding escrow:', error);
      toast.error(error.message || 'Failed to fund escrow', { id: 'fund' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeMilestone = async (escrowId: number, milestoneIndex: number) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.completeMilestone(escrowId, milestoneIndex);

      toast.loading('Marking milestone as complete...', { id: 'complete' });
      await tx.wait();
      toast.success('Milestone marked as complete!', { id: 'complete' });

      return true;
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      toast.error(error.message || 'Failed to complete milestone', { id: 'complete' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approveMilestone = async (escrowId: number, milestoneIndex: number) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.approveMilestone(escrowId, milestoneIndex);

      toast.loading('Approving milestone...', { id: 'approve' });
      await tx.wait();
      toast.success('Milestone approved and payment released!', { id: 'approve' });

      return true;
    } catch (error: any) {
      console.error('Error approving milestone:', error);
      toast.error(error.message || 'Failed to approve milestone', { id: 'approve' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const raiseDispute = async (escrowId: number) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.raiseDispute(escrowId);

      toast.loading('Raising dispute...', { id: 'dispute' });
      await tx.wait();
      toast.success('Dispute raised successfully', { id: 'dispute' });

      return true;
    } catch (error: any) {
      console.error('Error raising dispute:', error);
      toast.error(error.message || 'Failed to raise dispute', { id: 'dispute' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getEscrowDetails = async (escrowId: number): Promise<Escrow | null> => {
    try {
      const contract = await getContract();
      const escrowData = await contract.getEscrow(escrowId);
      const milestoneCount = await contract.getMilestoneCount(escrowId);

      const milestones: Milestone[] = [];
      for (let i = 0; i < Number(milestoneCount); i++) {
        const milestoneData = await contract.getMilestone(escrowId, i);
        milestones.push({
          description: milestoneData[0],
          amount: formatEther(milestoneData[1]),
          completed: milestoneData[2],
          approved: milestoneData[3],
          completedAt: Number(milestoneData[4]),
        });
      }

      return {
        id: Number(escrowData[0]),
        client: escrowData[1],
        freelancer: escrowData[2],
        totalAmount: formatEther(escrowData[3]),
        depositedAmount: formatEther(escrowData[4]),
        releasedAmount: formatEther(escrowData[5]),
        title: escrowData[6],
        description: escrowData[7],
        status: escrowData[8],
        createdAt: Number(escrowData[9]),
        deadline: Number(escrowData[10]),
        disputed: escrowData[11],
        milestones,
      };
    } catch (error) {
      console.error('Error fetching escrow details:', error);
      return null;
    }
  };

  const getUserEscrows = async (address: string, isClient: boolean): Promise<number[]> => {
    try {
      const contract = await getContract();
      const escrowIds = isClient
        ? await contract.getClientEscrows(address)
        : await contract.getFreelancerEscrows(address);

      return escrowIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Error fetching user escrows:', error);
      return [];
    }
  };

  return {
    loading,
    createEscrow,
    fundEscrow,
    completeMilestone,
    approveMilestone,
    raiseDispute,
    getEscrowDetails,
    getUserEscrows,
  };
};
