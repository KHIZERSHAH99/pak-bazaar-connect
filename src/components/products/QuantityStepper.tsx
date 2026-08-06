import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number | null;
  step?: number;
  onChange: (value: number) => void;
  id?: string;
}

/**
 * Touch-friendly quantity control.
 * Typing is never interrupted: the raw text stays in local state and is only
 * clamped to min/max on blur (or when using the stepper buttons).
 */
const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max,
  step,
  onChange,
  id = 'quantity',
}) => {
  const [text, setText] = useState(String(value));
  const increment = step && step > 0 ? step : 1;

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const clamp = (n: number) => {
    let next = n;
    if (Number.isNaN(next)) next = min;
    if (next < min) next = min;
    if (max && next > max) next = max;
    return next;
  };

  const commit = (raw: string) => {
    const next = clamp(parseInt(raw, 10));
    setText(String(next));
    onChange(next);
  };

  return (
    <div className="flex items-stretch gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Decrease quantity"
        className="h-12 w-12 shrink-0"
        disabled={value <= min}
        onClick={() => onChange(clamp(value - increment))}
      >
        <Minus className="h-5 w-5" />
      </Button>

      <Input
        id={id}
        inputMode="numeric"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
        }}
        className="h-12 text-center text-base font-semibold"
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Increase quantity"
        className="h-12 w-12 shrink-0"
        disabled={!!max && value >= max}
        onClick={() => onChange(clamp(value + increment))}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default QuantityStepper;
