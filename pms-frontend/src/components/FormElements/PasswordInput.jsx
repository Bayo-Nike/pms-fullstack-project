import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const baseInputStyles = `!rounded-md !bg-white [&_.MuiOutlinedInput-notchedOutline]:!border-gray-300 hover:[&_.MuiOutlinedInput-notchedOutline]:!border-gray-500 [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-600`;

export const PasswordInput = ({ size = 'medium', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <TextField
      fullWidth
      size={size}
      type={showPassword ? 'text' : 'password'}
      className={baseInputStyles}
      InputLabelProps={{ className: "!text-gray-600" }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};