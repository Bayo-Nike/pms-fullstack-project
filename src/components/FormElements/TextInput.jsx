import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const baseInputStyles = `...`; 

export const TextInput = ({ icon, size = 'medium', ...props }) => (
  <TextField
    fullWidth
    size={size} 
    className={baseInputStyles}
    InputLabelProps={{ className: "!text-gray-600" }}
    InputProps={{
      startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : null,
    }}
    {...props}
  />
);