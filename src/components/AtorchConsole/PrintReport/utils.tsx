import React from 'react';

interface Props {
  value: number;
  unit: string;
}

export const FormattedUnit: React.FC<Props> = ({ value, unit }) => {
  if (value === 0 || Number.isNaN(value)) {
    return <span className='text-monospace'>0 {unit}</span>;
  }
  const prefixes = ['m', '', 'k', 'M', 'T'];
  const n = Math.min(
    Math.floor(Math.log(value) / Math.log(1000)),
    prefixes.length - 1,
  );
  value /= Math.pow(1000, n);
  const printed = `${+value.toFixed(5)} ${prefixes[n]}${unit}`;
  return <span className='text-monospace'>{printed}</span>;
};
