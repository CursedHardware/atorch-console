import React from "react";

interface FormattedUnitProps {
  value: number;
  unit: string;
}

export const FormattedUnit: React.FC<FormattedUnitProps> = ({
  value,
  unit,
}) => {
  const prefixes = ["m", "", "k"];
  for (const prefix of prefixes) {
    if (value > 1000) {
      value /= 1000;
      continue;
    }
    return (
      <span>
        {value} {prefix}
        {unit}
      </span>
    );
  }
  return null;
};
