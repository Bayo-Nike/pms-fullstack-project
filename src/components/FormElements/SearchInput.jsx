import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

const baseInputStyles = `!rounded-md !bg-white [&_.MuiOutlinedInput-notchedOutline]:!border-gray-300 hover:[&_.MuiOutlinedInput-notchedOutline]:!border-gray-500 [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-600`;

export const SearchInput = ({ value, onClear, size = 'medium', ...props }) => {
  return (
    <TextField
      fullWidth
      size={size}
      value={value}
      className={baseInputStyles}
      InputLabelProps={{ className: "!text-gray-600" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        endAdornment: value ? ( 
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={onClear}
              edge="end"
              size="small"
            >
              <Clear />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      {...props}
    />
  );
};