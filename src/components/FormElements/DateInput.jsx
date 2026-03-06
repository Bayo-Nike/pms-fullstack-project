import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const baseInputStyles = `...`;

export const DateInput = ({ icon, size = 'medium', ...props }) => (
  <TextField
    fullWidth
    type="date"
    size={size} // Pass size
    className={baseInputStyles}
    InputLabelProps={{ shrink: true, className: "!text-gray-600" }}
    InputProps={{
      startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : null,
    }}
    {...props}
  />
);