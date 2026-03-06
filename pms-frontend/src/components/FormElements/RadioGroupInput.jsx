import React from 'react';
import { RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { StyledRadio } from '../Reusable/StyledRadio';

export const RadioGroupInput = ({
  legend,
  name,
  value,
  onChange,
  options = [],
  size = 'medium',
  color = 'primary',
  disabled = false,
  ...props
}) => {
  return (
    <FormControl disabled={disabled} {...props}>
      <FormLabel>{legend}</FormLabel>
      <RadioGroup row name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<StyledRadio size={size} color={color} />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};