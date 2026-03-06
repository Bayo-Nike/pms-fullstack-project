import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const baseInputStyles = `...`;

export const SelectInput = ({ label, name, value, onChange, options = [], size = 'medium', ...props }) => (
  <FormControl fullWidth size={size} className={baseInputStyles} {...props}>
    <InputLabel className="!text-gray-600">{label}</InputLabel>
    <Select label={label} name={name} value={value} onChange={onChange}>
      <MenuItem value=""><em>None</em></MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </Select>
    {}
  </FormControl>
);