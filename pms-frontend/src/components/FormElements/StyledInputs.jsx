import React from 'react';
import { TextField, Autocomplete } from '@mui/material';

const cn = (...classes) => classes.filter(Boolean).join(' ');
const baseInputStyles = `!rounded-md !bg-white [&_.MuiOutlinedInput-notchedOutline]:!border-gray-300 hover:[&_.MuiOutlinedInput-notchedOutline]:!border-gray-500 [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-600`;


export const StyledTextField = ({ size = 'medium', ...props }) => {
  return (
    <TextField
      fullWidth
      size={size}
      className={cn(baseInputStyles)}
      InputLabelProps={{ className: "!text-gray-600", ...(props.InputLabelProps || {}) }}
      {...props}
    />
  );
};


export const StyledAutocomplete = ({ size = 'medium', label, ...props }) => {
  return (
    <Autocomplete
      fullWidth
      size={size}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          className={cn(baseInputStyles)}
          InputLabelProps={{ ...params.InputLabelProps, className: "!text-gray-600" }}
        />
      )}
      {...props}
    />
  );
};