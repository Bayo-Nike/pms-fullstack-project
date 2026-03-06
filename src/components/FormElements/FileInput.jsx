import React, { useRef } from 'react';
import { TextField, InputAdornment, IconButton, FormHelperText } from '@mui/material';
import { FileUploadOutlined, Clear } from '@mui/icons-material';

const cn = (...classes) => classes.filter(Boolean).join(' ');
const baseInputStyles = `!rounded-md !bg-white [&_.MuiOutlinedInput-notchedOutline]:!border-gray-300 hover:[&_.MuiOutlinedInput-notchedOutline]:!border-gray-500 [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-600`;
const errorInputStyles = `[&_.MuiOutlinedInput-notchedOutline]:!border-red-500 [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-red-600`;
const errorHelperTextStyles = "!text-red-600 !text-xs !ml-0";

export const FileInput = ({
  label,
  name,
  fileName,
  onChange,
  onClear,
  size = 'medium',
  error = false,
  helperText = '',
  placeholder = 'Click to upload a file',
  ...props 
}) => {
  const fileInputRef = useRef(null);

  const handleClear = (event) => {
    event.stopPropagation();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onClear();
  };

  return (
    <div>
      <TextField
        fullWidth
        label={label}
        size={size}
        variant="outlined"
        value={fileName || ""}
        placeholder={!fileName ? placeholder : ""}
        onClick={() => fileInputRef.current?.click()} 
        error={error}
        InputProps={{
          readOnly: true,
          className: cn(baseInputStyles, error && errorInputStyles),
          startAdornment: (
            <InputAdornment position="start">
              <FileUploadOutlined color="action" />
            </InputAdornment>
          ),
          endAdornment: fileName && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true, className: "!text-gray-600" }}
      />
      
      {/* The actual, hidden file input */}
      <input
        type="file"
        hidden
        name={name}
        ref={fileInputRef}
        onChange={onChange}
        {...props}
      />
      
      {/* Display validation errors */}
      {helperText && (
        <FormHelperText component="span" className={errorHelperTextStyles}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};