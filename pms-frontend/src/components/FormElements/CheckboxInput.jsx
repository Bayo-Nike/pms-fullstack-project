import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

export const CheckboxInput = ({ label, name, checked, onChange, size = 'medium', ...props }) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          size={size}
          {...props}
        />
      }
      label={label}
    />
  );
};