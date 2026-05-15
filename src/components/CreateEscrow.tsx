import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, DollarSign, User, FileText, Target, Calendar } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { DatePicker } from './DatePicker';
import toast from 'react-hot-toast';

interface CreateEscrowProps {
  onSuccess: () => void;
}

interface MilestoneInput {
  description: string;
  amount: string;
}

export const CreateEscrow = ({ onSuccess }: CreateEscrowProps) => {
  const { createEscrow, loading } = useContract();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    freelancer: '',
    title: '',
    description: '',
  });
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { description: '', amount: '' }
  ]);

  const addMilestone = () => {
    if (milestones.length < 20) {
      setMilestones([...milestones, { description: '', amount: '' }]);
    } else {
      toast.error('Maximum 20 milestones allowed');
    }
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    } else {
      toast.error('At least one milestone required');
    }
  };

  const updateMilestone = (index: number, field: 'description' | 'amount', value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!formData.freelancer || !formData.title || !formData.description || !deadline) {
        toast.error('Please fill in all fields');
        return;
      }
      setStep(2);
      return;
    }

    const hasEmptyMilestones = milestones.some(m => !m.description || !m.amount);
    if (hasEmptyMilestones) {
      toast.error('Please fill in all milestone details');
      return;
    }

    const deadlineTimestamp = Math.floor(deadline!.getTime() / 1000);
    const success = await createEscrow(
      formData.freelancer,
      formData.title,
      formData.description,
      milestones,
      deadlineTimestamp
    );

    if (success) {
      setFormData({ freelancer: '', title: '', description: '' });
      setDeadline(undefined);
      setMilestones([{ description: '', amount: '' }]);
      setStep(1);
      onSuccess();
    }
  };

  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface/50 backdrop-blur-sm rounded-2xl border border-border p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-2">Create New Escrow</h2>
        <p className="text-textSecondary">Set up a milestone-based payment contract</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-surface border border-border text-textSecondary'} font-semibold transition-colors duration-200`}>
            1
          </div>
          <div className={`w-20 h-1 ${step >= 2 ? 'bg-primary' : 'bg-border'} transition-colors duration-200`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-surface border border-border text-textSecondary'} font-semibold transition-colors duration-200`}>
            2
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-text mb-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>Freelancer Address</span>
                </label>
                <input
                  type="text"
                  value={formData.freelancer}
                  onChange={(e) => setFormData({ ...formData, freelancer: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-text mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Project Title</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., Website Redesign"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-text mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Project Description</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the project scope and deliverables..."
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-text mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Project Deadline</span>
                </label>
                <DatePicker
                  value={deadline}
                  onChange={setDeadline}
                  placeholder="Select a deadline date"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform duration-200 shadow-lg shadow-primary/25"
              >
                Continue to Milestones
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center space-x-2 text-sm font-medium text-text">
                  <Target className="w-4 h-4 text-primary" />
                  <span>Project Milestones</span>
                </label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Milestone</span>
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-background/50 rounded-xl border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text">Milestone {index + 1}</span>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      placeholder="Milestone description"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    />

                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input
                        type="number"
                        step="0.001"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                        placeholder="Amount in zkLTC"
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">Total Contract Value</span>
                  <span className="text-2xl font-bold text-primary">{totalAmount.toFixed(4)} zkLTC</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-surface/80 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform duration-200 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Escrow'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};
