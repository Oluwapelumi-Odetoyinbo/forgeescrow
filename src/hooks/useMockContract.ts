/**
 * Mock contract hook — simulates the ForgeEscrow contract using local state.
 * Activates automatically when VITE_CONTRACT_ADDRESS is not set.
 * Allows full UI testing without a deployed contract.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Escrow, Milestone, EscrowStatus } from '../types';

interface StoredEscrow {
  id: number;
  client: string;
  freelancer: string;
  totalAmount: string;
  depositedAmount: string;
  releasedAmount: string;
  title: string;
  description: string;
  milestones: Milestone[];
  status: EscrowStatus;
  createdAt: number;
  deadline: number;
  disputed: boolean;
}

// Persist mock data across re-renders using a module-level store
let mockEscrows: StoredEscrow[] = [];
let nextId = 1;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getConnectedAddress = async (): Promise<string> => {
  if (!window.ethereum) return '0x0000000000000000000000000000000000000000';
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts?.[0] ?? '0x0000000000000000000000000000000000000000';
  } catch {
    return '0x0000000000000000000000000000000000000000';
  }
};

export const useMockContract = () => {
  const [loading, setLoading] = useState(false);

  const createEscrow = async (
    freelancer: string,
    title: string,
    description: string,
    milestones: { description: string; amount: string }[],
    deadline: number
  ) => {
    setLoading(true);
    try {
      toast.loading('Creating escrow (mock)...', { id: 'create' });
      await delay(1500); // simulate tx time

      const client = await getConnectedAddress();
      const totalAmount = milestones
        .reduce((sum, m) => sum + parseFloat(m.amount), 0)
        .toString();

      const escrow: StoredEscrow = {
        id: nextId++,
        client,
        freelancer: freelancer.toLowerCase(),
        totalAmount,
        depositedAmount: '0',
        releasedAmount: '0',
        title,
        description,
        milestones: milestones.map((m) => ({
          description: m.description,
          amount: m.amount,
          completed: false,
          approved: false,
          completedAt: 0,
        })),
        status: EscrowStatus.Created,
        createdAt: Math.floor(Date.now() / 1000),
        deadline,
        disputed: false,
      };

      mockEscrows.push(escrow);
      toast.success('Escrow created successfully! (mock)', { id: 'create' });
      return true;
    } catch (error: any) {
      toast.error('Failed to create escrow', { id: 'create' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fundEscrow = async (escrowId: number, amount: string) => {
    setLoading(true);
    try {
      toast.loading('Funding escrow (mock)...', { id: 'fund' });
      await delay(1500);

      const escrow = mockEscrows.find((e) => e.id === escrowId);
      if (!escrow) throw new Error('Escrow not found');

      const newDeposited = parseFloat(escrow.depositedAmount) + parseFloat(amount);
      escrow.depositedAmount = newDeposited.toString();

      if (newDeposited >= parseFloat(escrow.totalAmount)) {
        escrow.status = EscrowStatus.Funded;
      }

      toast.success('Escrow funded successfully! (mock)', { id: 'fund' });
      return true;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fund escrow', { id: 'fund' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeMilestone = async (escrowId: number, milestoneIndex: number) => {
    setLoading(true);
    try {
      toast.loading('Marking milestone as complete (mock)...', { id: 'complete' });
      await delay(1200);

      const escrow = mockEscrows.find((e) => e.id === escrowId);
      if (!escrow) throw new Error('Escrow not found');

      escrow.milestones[milestoneIndex].completed = true;
      escrow.milestones[milestoneIndex].completedAt = Math.floor(Date.now() / 1000);

      if (escrow.status === EscrowStatus.Funded) {
        escrow.status = EscrowStatus.InProgress;
      }

      toast.success('Milestone marked as complete! (mock)', { id: 'complete' });
      return true;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to complete milestone', { id: 'complete' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approveMilestone = async (escrowId: number, milestoneIndex: number) => {
    setLoading(true);
    try {
      toast.loading('Approving milestone (mock)...', { id: 'approve' });
      await delay(1500);

      const escrow = mockEscrows.find((e) => e.id === escrowId);
      if (!escrow) throw new Error('Escrow not found');

      escrow.milestones[milestoneIndex].approved = true;
      const amount = parseFloat(escrow.milestones[milestoneIndex].amount);
      escrow.releasedAmount = (parseFloat(escrow.releasedAmount) + amount).toString();

      const allApproved = escrow.milestones.every((m) => m.approved);
      if (allApproved) {
        escrow.status = EscrowStatus.Completed;
      }

      toast.success('Milestone approved and payment released! (mock)', { id: 'approve' });
      return true;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve milestone', { id: 'approve' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelEscrow = async (escrowId: number) => {
    setLoading(true);
    try {
      toast.loading('Cancelling escrow (mock)...', { id: 'cancel' });
      await delay(1200);

      const escrow = mockEscrows.find((e) => e.id === escrowId);
      if (!escrow) throw new Error('Escrow not found');

      escrow.status = EscrowStatus.Cancelled;
      escrow.depositedAmount = '0';

      toast.success('Escrow cancelled and funds refunded! (mock)', { id: 'cancel' });
      return true;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel escrow', { id: 'cancel' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const raiseDispute = async (escrowId: number) => {
    setLoading(true);
    try {
      toast.loading('Raising dispute (mock)...', { id: 'dispute' });
      await delay(1200);

      const escrow = mockEscrows.find((e) => e.id === escrowId);
      if (!escrow) throw new Error('Escrow not found');

      escrow.disputed = true;
      escrow.status = EscrowStatus.Disputed;

      toast.success('Dispute raised successfully (mock)', { id: 'dispute' });
      return true;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to raise dispute', { id: 'dispute' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getEscrowDetails = async (escrowId: number): Promise<Escrow | null> => {
    const escrow = mockEscrows.find((e) => e.id === escrowId);
    if (!escrow) return null;
    return { ...escrow };
  };

  const getUserEscrows = async (address: string, isClient: boolean): Promise<number[]> => {
    const addr = address.toLowerCase();
    return mockEscrows
      .filter((e) =>
        isClient ? e.client.toLowerCase() === addr : e.freelancer.toLowerCase() === addr
      )
      .map((e) => e.id);
  };

  return {
    loading,
    createEscrow,
    fundEscrow,
    completeMilestone,
    approveMilestone,
    cancelEscrow,
    raiseDispute,
    getEscrowDetails,
    getUserEscrows,
  };
};
