import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';

const baseInputStyles = `...`;

export const AutocompleteInput = ({ icon, label, size = 'medium', ...props }) => (
  <Autocomplete
    fullWidth
    size={size} // Pass size
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        className={baseInputStyles}
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <>
              {icon ? <InputAdornment position="start">{icon}</InputAdornment> : null}
              {params.InputProps.startAdornment}
            </>
          ),
        }}
      />
    )}
    {...props}
  />
);