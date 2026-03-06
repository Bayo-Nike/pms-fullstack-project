import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const baseInputStyles = `...`;

export const TextArea = ({ icon, rows = 4, size = 'medium', ...props }) => (
  <TextField
    fullWidth
    multiline
    rows={rows}
    size={size} // Pass size
    className={baseInputStyles}
    InputLabelProps={{ className: "!text-gray-600" }}
    InputProps={{
      startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : null,
    }}
    {...props}
  />
);