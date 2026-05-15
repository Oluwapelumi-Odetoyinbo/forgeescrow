import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DatePicker = ({ value, onChange, placeholder = 'Pick a date' }: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (day: Date | undefined) => {
    onChange(day);
    if (day) setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:border-white/20"
        >
          <span className={value ? 'text-text' : 'text-textSecondary'}>
            {value ? format(value, 'PPP') : placeholder}
          </span>
          <CalendarIcon className="w-4 h-4 text-textSecondary" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-[100] rounded-xl border border-white/10 bg-[#1a1a1a] p-3 shadow-xl shadow-black/50 animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="start"
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={{ before: new Date() }}
            showOutsideDays
            className="rdp-forge"
          />
          <Popover.Arrow className="fill-[#1a1a1a]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
