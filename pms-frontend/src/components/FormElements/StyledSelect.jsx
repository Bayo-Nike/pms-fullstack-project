import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const baseInputStyles = `!rounded-md !bg-white [&_.MuiOutlinedInput-notchedOutline]:!border-gray-300 hover:[&_.MuiOutlinedInput-notchedOutline]:!border-gray-500 [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-600`;

/**
 * A styled, simple dropdown select field.
 * @param {array} options - Array of objects with `value` and `label` keys. e.g., [{ value: 'ft', label: 'Full-Time' }]
 */
export const StyledSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  size = 'medium',
  error = false,
  helperText = '',
  ...props
}) => {
  return (
    <FormControl fullWidth size={size} error={error} className={baseInputStyles}>
      <InputLabel className="!text-gray-600">{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        {...props}
      >
        {}
        <MenuItem value=""><em>None</em></MenuItem>
        
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};