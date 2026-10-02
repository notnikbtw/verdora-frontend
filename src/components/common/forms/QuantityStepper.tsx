import React from 'react';
import { Button } from '@components/ui/button';
import { cn } from '@/lib/utils';

export type QuantityStepperProps = {
  value: number;
  onChange?: (value: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
};

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  onIncrement,
  onDecrement,
  min = 1,
  max,
  step = 1,
  disabled = false,
  size = 'default',
  className,
}) => {
  const isMinDisabled = disabled || value <= min;
  const isMaxDisabled = disabled || (max !== undefined && value >= max);

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMinDisabled) return;
    const nextVal = Math.max(min, value - step);
    if (onChange) {
      onChange(nextVal);
    } else {
      onDecrement?.();
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaxDisabled) return;
    const nextVal =
      max !== undefined ? Math.min(max, value + step) : value + step;
    if (onChange) {
      onChange(nextVal);
    } else {
      onIncrement?.();
    }
  };

  const sizeStyles = {
    sm: {
      container: 'rounded-[12px] p-0.5 gap-0.5',
      button: 'size-7 rounded-[8px] text-base',
      text: 'min-w-6 text-sm',
    },
    default: {
      container: 'rounded-[16px] p-1 gap-1',
      button: 'size-10 rounded-[12px] text-xl',
      text: 'min-w-9 text-base',
    },
    lg: {
      container: 'rounded-[18px] p-1.5 gap-1.5',
      button: 'size-12 rounded-[14px] text-2xl',
      text: 'min-w-10 text-lg',
    },
  }[size];

  return (
    <div
      role="group"
      aria-label="Quantity selector"
      className={cn(
        'inline-flex items-center border border-[#D9DEDB] bg-white shrink-0 select-none',
        sizeStyles.container,
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={isMinDisabled}
        aria-label="Decrease quantity"
        className={cn(
          'font-medium text-[#0C0C0C] hover:bg-[#fcfdfb] disabled:opacity-40 cursor-pointer active:scale-95 transition-all',
          sizeStyles.button
        )}
      >
        −
      </Button>

      <span
        aria-live="polite"
        className={cn(
          'text-center font-heading font-semibold text-[#0C0C0C]',
          sizeStyles.text
        )}
      >
        {value}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={isMaxDisabled}
        aria-label="Increase quantity"
        className={cn(
          'font-medium text-[#0C0C0C] hover:bg-[#fcfdfb] disabled:opacity-40 cursor-pointer active:scale-95 transition-all',
          sizeStyles.button
        )}
      >
        +
      </Button>
    </div>
  );
};

export default QuantityStepper;
