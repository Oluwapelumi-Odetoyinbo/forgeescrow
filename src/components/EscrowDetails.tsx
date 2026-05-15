import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, User, Calendar, XCircle } from 'lucide-react';
import { Escrow, EscrowStatus } from '../types';
import { useContract } from '../hooks/useContract';

interface EscrowDetailsProps {
  escrow: Escrow;
  walletAddress: string;
  onBack: () => void;
  onUpdate: () => void;
}

export const EscrowDetails = ({ escrow, walletAddress, onBack, onUpdate }: EscrowDetailsProps) => {
  const { fundEscrow, completeMilestone, approveMilestone, cancelEscrow, raiseDispute, loading } =
    useContract();
  const [fundAmount, setFundAmount] = useState('');

  const isClient = escrow.client.toLowerCase() === walletAddress.toLowerCase();
  const isFreelancer = escrow.freelancer.toLowerCase() === walletAddress.toLowerCase();

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;
    const success = await fundEscrow(escrow.id, fundAmount);
    if (success) {
      setFundAmount('');
      onUpdate();
    }
  };

  const handleCompleteMilestone = async (index: number) => {
    const success = await completeMilestone(escrow.id, index);
    if (success) onUpdate();
  };

  const handleApproveMilestone = async (index: number) => {
    const success = await approveMilestone(escrow.id, index);
    if (success) onUpdate();
  };

  const handleCancelEscrow = async () => {
    const success = await cancelEscrow(escrow.id);
    if (success) onUpdate();
  };

  const handleRaiseDispute = async () => {
    const success = await raiseDispute(escrow.id);
    if (success) onUpdate();
  };

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.Created:
        return 'text-warning';
      case EscrowStatus.Funded:
      case EscrowStatus.InProgress:
        return 'text-secondary';
      case EscrowStatus.Completed:
        return 'text-success';
      case EscrowStatus.Cancelled:
      case EscrowStatus.Disputed:
        return 'text-error';
      default:
        return 'text-textSecondary';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const completedMilestones = escrow.milestones.filter((m) => m.approved).length;
  const progressPercent = (completedMilestones / escrow.milestones.length) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-textSecondary hover:text-text transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to list</span>
      </button>

      {/* Header */}
      <div className="p-8 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-sm rounded-2xl border border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">{escrow.title}</h1>
            <p className="text-textSecondary">{escrow.description}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full bg-surface border border-border ${getStatusColor(escrow.status)} font-semibold`}
          >
            {EscrowStatus[escrow.status]}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-textSecondary mb-1">Total Value</p>
            <p className="text-2xl font-bold text-primary">
              {parseFloat(escrow.totalAmount).toFixed(4)} zkLTC
            </p>
          </div>
          <div>
            <p className="text-sm text-textSecondary mb-1">Deposited</p>
            <p className="text-2xl font-bold text-text">
              {parseFloat(escrow.depositedAmount).toFixed(4)} zkLTC
            </p>
          </div>
          <div>
            <p className="text-sm text-textSecondary mb-1">Released</p>
            <p className="text-2xl font-bold text-success">
              {parseFloat(escrow.releasedAmount).toFixed(4)} zkLTC
            </p>
          </div>
          <div>
            <p className="text-sm text-textSecondary mb-1">Progress</p>
            <p className="text-2xl font-bold text-text">
              {completedMilestones}/{escrow.milestones.length}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-textSecondary mb-2">
            <span>Milestone Progress</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Parties Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-surface/50 backdrop-blur-sm rounded-xl border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Client</p>
              <p className="font-mono text-sm text-text">
                {escrow.client.slice(0, 10)}...{escrow.client.slice(-8)}
              </p>
            </div>
          </div>
          {isClient && (
            <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full inline-block">
              You
            </div>
          )}
        </div>

        <div className="p-6 bg-surface/50 backdrop-blur-sm rounded-xl border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Freelancer</p>
              <p className="font-mono text-sm text-text">
                {escrow.freelancer.slice(0, 10)}...{escrow.freelancer.slice(-8)}
              </p>
            </div>
          </div>
          {isFreelancer && (
            <div className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full inline-block">
              You
            </div>
          )}
        </div>
      </div>

      {/* Funding Section */}
      {isClient && escrow.status === EscrowStatus.Created && (
        <div className="p-6 bg-warning/10 border border-warning/20 rounded-xl">
          <h3 className="text-lg font-bold text-text mb-4">Fund Escrow</h3>
          <p className="text-sm text-textSecondary mb-4">
            Remaining to fund:{' '}
            {(parseFloat(escrow.totalAmount) - parseFloat(escrow.depositedAmount)).toFixed(4)} zkLTC
          </p>
          <div className="flex space-x-4">
            <input
              type="number"
              step="0.001"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="Amount in zkLTC"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleFund}
              disabled={loading || !fundAmount}
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Funding...' : 'Fund'}
            </button>
          </div>
        </div>
      )}

      {/* Cancel Section - only for client when escrow is Created (unfunded or partially funded) */}
      {isClient && escrow.status === EscrowStatus.Created && (
        <div className="p-6 bg-zinc-800/50 border border-white/10 rounded-xl">
          <div className="flex items-start space-x-4">
            <XCircle className="w-6 h-6 text-zinc-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text mb-2">Cancel Escrow</h3>
              <p className="text-sm text-textSecondary mb-4">
                Cancel this escrow before work begins. Any deposited funds will be refunded to your
                wallet.
              </p>
              <button
                onClick={handleCancelEscrow}
                disabled={loading}
                className="px-6 py-3 bg-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-600 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Cancelling...' : 'Cancel Escrow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-text">Milestones</h3>
        {escrow.milestones.map((milestone, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border ${
              milestone.approved
                ? 'bg-success/10 border-success/20'
                : milestone.completed
                  ? 'bg-secondary/10 border-secondary/20'
                  : 'bg-surface/50 border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-bold text-text">Milestone {index + 1}</span>
                  {milestone.approved ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : milestone.completed ? (
                    <Clock className="w-5 h-5 text-secondary" />
                  ) : null}
                </div>
                <p className="text-textSecondary">{milestone.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {parseFloat(milestone.amount).toFixed(4)} zkLTC
                </p>
              </div>
            </div>

            {milestone.completedAt > 0 && (
              <div className="flex items-center space-x-2 text-sm text-textSecondary mb-4">
                <Calendar className="w-4 h-4" />
                <span>Completed: {formatDate(milestone.completedAt)}</span>
              </div>
            )}

            <div className="flex space-x-3">
              {/* Freelancer can mark complete when escrow is Funded or InProgress */}
              {isFreelancer &&
                !milestone.completed &&
                !milestone.approved &&
                (escrow.status === EscrowStatus.Funded ||
                  escrow.status === EscrowStatus.InProgress) && (
                  <button
                    onClick={() => handleCompleteMilestone(index)}
                    disabled={loading}
                    className="flex-1 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Mark Complete'}
                  </button>
                )}

              {isClient && milestone.completed && !milestone.approved && (
                <button
                  onClick={() => handleApproveMilestone(index)}
                  disabled={loading}
                  className="flex-1 py-3 bg-success text-white font-semibold rounded-lg hover:bg-success/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Approving...' : 'Approve & Release Payment'}
                </button>
              )}

              {milestone.approved && (
                <div className="flex-1 py-3 bg-success/20 text-success font-semibold rounded-lg text-center">
                  Payment Released ✓
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dispute Section */}
      {(escrow.status === EscrowStatus.Funded || escrow.status === EscrowStatus.InProgress) &&
        !escrow.disputed && (
          <div className="p-6 bg-error/10 border border-error/20 rounded-xl">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text mb-2">Dispute Resolution</h3>
                <p className="text-sm text-textSecondary mb-4">
                  If there's a disagreement about the work or payment, you can raise a dispute. The
                  platform owner will review and resolve the issue fairly.
                </p>
                <button
                  onClick={handleRaiseDispute}
                  disabled={loading}
                  className="px-6 py-3 bg-error text-white font-semibold rounded-lg hover:bg-error/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Raising...' : 'Raise Dispute'}
                </button>
              </div>
            </div>
          </div>
        )}

      {escrow.disputed && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-error" />
            <div>
              <h3 className="text-lg font-bold text-error">Dispute Active</h3>
              <p className="text-sm text-textSecondary">
                This escrow is under dispute resolution. Please wait for the platform owner to
                resolve.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
