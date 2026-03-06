import React from 'react';
import { FormControlLabel } from '@mui/material';
import { StyledSwitch } from '../Reusable/StyledSwitch';


export const SwitchInput = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  required = false,
  labelPlacement = 'end',
  ...props
}) => {
  const displayLabel = required ? `${label}*` : label;

  return (
    <FormControlLabel
      control={
        <StyledSwitch
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
      }
      label={displayLabel}
      labelPlacement={labelPlacement}
      disabled={disabled}
    />
  );
};