import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertTriangle, DollarSign, User } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { Escrow, EscrowStatus } from '../types';

interface EscrowListProps {
  walletAddress: string;
  onSelectEscrow: (escrow: Escrow) => void;
}

export const EscrowList = ({ walletAddress, onSelectEscrow }: EscrowListProps) => {
  const { getUserEscrows, getEscrowDetails } = useContract();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'client' | 'freelancer'>('all');

  useEffect(() => {
    loadEscrows();
  }, [walletAddress, filter]);

  const loadEscrows = async () => {
    setLoading(true);
    try {
      let escrowIds: number[] = [];

      if (filter === 'all' || filter === 'client') {
        const clientIds = await getUserEscrows(walletAddress, true);
        escrowIds = [...escrowIds, ...clientIds];
      }

      if (filter === 'all' || filter === 'freelancer') {
        const freelancerIds = await getUserEscrows(walletAddress, false);
        escrowIds = [...escrowIds, ...freelancerIds];
      }

      const uniqueIds = [...new Set(escrowIds)];
      const escrowDetails = await Promise.all(
        uniqueIds.map(id => getEscrowDetails(id))
      );

      setEscrows(escrowDetails.filter(e => e !== null) as Escrow[]);
    } catch (error) {
      console.error('Error loading escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.Created:
        return <Clock className="w-5 h-5 text-warning" />;
      case EscrowStatus.Funded:
      case EscrowStatus.InProgress:
        return <Clock className="w-5 h-5 text-secondary" />;
      case EscrowStatus.Completed:
        return <CheckCircle className="w-5 h-5 text-success" />;
      case EscrowStatus.Cancelled:
        return <XCircle className="w-5 h-5 text-error" />;
      case EscrowStatus.Disputed:
        return <AlertTriangle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 text-textSecondary" />;
    }
  };

  const getStatusText = (status: EscrowStatus) => {
    const statusMap = {
      [EscrowStatus.Created]: 'Created',
      [EscrowStatus.Funded]: 'Funded',
      [EscrowStatus.InProgress]: 'In Progress',
      [EscrowStatus.Completed]: 'Completed',
      [EscrowStatus.Cancelled]: 'Cancelled',
      [EscrowStatus.Disputed]: 'Disputed',
    };
    return statusMap[status] || 'Unknown';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-text">Your Escrows</h2>
        <div className="flex space-x-2">
          {['all', 'client', 'freelancer'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface text-textSecondary hover:bg-surface/80'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {escrows.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <DollarSign className="w-10 h-10 text-textSecondary" />
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">No escrows yet</h3>
          <p className="text-textSecondary">Create your first escrow to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {escrows.map((escrow, index) => (
            <motion.div
              key={escrow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectEscrow(escrow)}
              className="p-6 bg-surface/50 backdrop-blur-sm rounded-2xl border border-border hover:border-primary/50 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text mb-1 line-clamp-1">{escrow.title}</h3>
                  <p className="text-sm text-textSecondary line-clamp-2">{escrow.description}</p>
                </div>
                {getStatusIcon(escrow.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-textSecondary">Status</span>
                  <span className="font-medium text-text">{getStatusText(escrow.status)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-textSecondary">Total Value</span>
                  <span className="font-bold text-primary">{parseFloat(escrow.totalAmount).toFixed(4)} zkLTC</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-textSecondary">Progress</span>
                  <span className="font-medium text-text">
                    {escrow.milestones.filter(m => m.approved).length}/{escrow.milestones.length}
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center space-x-2 text-xs text-textSecondary">
                    <User className="w-3 h-3" />
                    <span>
                      {escrow.client.toLowerCase() === walletAddress.toLowerCase() ? 'You are client' : 'You are freelancer'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-textSecondary mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Deadline: {formatDate(escrow.deadline)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
