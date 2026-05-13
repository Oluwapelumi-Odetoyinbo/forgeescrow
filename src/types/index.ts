export interface Milestone {
  description: string;
  amount: string;
  completed: boolean;
  approved: boolean;
  completedAt: number;
}

export interface Escrow {
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

export enum EscrowStatus {
  Created = 0,
  Funded = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
  Disputed = 5
}

export interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
}
