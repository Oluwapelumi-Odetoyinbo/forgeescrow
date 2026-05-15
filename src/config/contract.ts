/**
 * ForgeEscrow contract configuration
 *
 * The contract address and target chain are sourced from Vite environment
 * variables so the same build can target the LitVM LiteForge testnet without
 * code changes. See `.env.example` at the project root for the supported keys.
 */

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const rawAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;
const rawChainId = import.meta.env.VITE_LITVM_CHAIN_ID as string | undefined;

export const CONTRACT_ADDRESS: string =
  rawAddress && rawAddress.trim().length > 0 ? rawAddress.trim() : ZERO_ADDRESS;

const parsedChainId = rawChainId ? Number(rawChainId) : NaN;
export const LITVM_CHAIN_ID: number = Number.isFinite(parsedChainId)
  ? parsedChainId
  : 8888; // sensible fallback for the LitVM LiteForge testnet

export const LITVM_RPC_URL: string =
  (import.meta.env.VITE_LITVM_RPC_URL as string | undefined) ??
  'https://rpc.testnet.litvm.org';

export const LITVM_EXPLORER_URL: string =
  (import.meta.env.VITE_LITVM_EXPLORER_URL as string | undefined) ??
  'https://explorer.testnet.litvm.org';

export const LITVM_NETWORK_NAME: string =
  (import.meta.env.VITE_LITVM_NETWORK_NAME as string | undefined) ??
  'LitVM LiteForge Testnet';

export const isContractConfigured = (): boolean =>
  CONTRACT_ADDRESS !== ZERO_ADDRESS && /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);

/**
 * ABI for the ForgeEscrow contract. Mirrors the public surface defined in
 * `contracts/ForgeEscrow.sol`.
 */
export const CONTRACT_ABI = [
  // Writes
  'function createEscrow(address _freelancer, string _title, string _description, string[] _milestoneDescriptions, uint256[] _milestoneAmounts, uint256 _deadline) external returns (uint256)',
  'function fundEscrow(uint256 _escrowId) external payable',
  'function completeMilestone(uint256 _escrowId, uint256 _milestoneIndex) external',
  'function approveMilestone(uint256 _escrowId, uint256 _milestoneIndex) external',
  'function cancelEscrow(uint256 _escrowId) external',
  'function raiseDispute(uint256 _escrowId) external',

  // Reads
  'function getEscrow(uint256 _escrowId) external view returns (uint256, address, address, uint256, uint256, uint256, string, string, uint8, uint256, uint256, bool)',
  'function getMilestone(uint256 _escrowId, uint256 _milestoneIndex) external view returns (string, uint256, bool, bool, uint256)',
  'function getMilestoneCount(uint256 _escrowId) external view returns (uint256)',
  'function getClientEscrows(address _client) external view returns (uint256[])',
  'function getFreelancerEscrows(address _freelancer) external view returns (uint256[])',
  'function escrowCounter() external view returns (uint256)',

  // Events
  'event EscrowCreated(uint256 indexed escrowId, address indexed client, address indexed freelancer, uint256 totalAmount)',
  'event EscrowFunded(uint256 indexed escrowId, uint256 amount)',
  'event MilestoneCompleted(uint256 indexed escrowId, uint256 milestoneIndex)',
  'event MilestoneApproved(uint256 indexed escrowId, uint256 milestoneIndex, uint256 amount)',
  'event PaymentReleased(uint256 indexed escrowId, address indexed freelancer, uint256 amount)',
  'event EscrowCancelled(uint256 indexed escrowId)',
  'event DisputeRaised(uint256 indexed escrowId, address indexed raiser)',
] as const;
