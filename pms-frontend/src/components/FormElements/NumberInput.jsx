import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const baseInputStyles = `...`;

export const NumberInput = ({ icon, size = 'medium', ...props }) => (
  <TextField
    fullWidth
    type="number"
    size={size} // Pass size
    className={baseInputStyles}
    InputLabelProps={{ className: "!text-gray-600" }}
    InputProps={{
      startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : null,
    }}
    {...props}
  />
);