import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

const CustomButton = styled(Button)(({ theme, ownerState }) => {
  const variantStyles = {
    primary: {
  
    },
    secondary: {
      color: theme.palette.text.primary,
      borderColor: theme.border.default,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderColor: theme.palette.text.primary,
      },
    },
    text: {
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    },
  };
  
  return {
    ...(ownerState.variant !== 'primary' && variantStyles[ownerState.variant]),
  };
});

export const StyledButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  ...props
}) => {
  const muiVariant = variant === 'primary' ? 'contained' : (variant === 'secondary' ? 'outlined' : 'text');

  return (
    <CustomButton
      ownerState={{ variant }}
      variant={muiVariant}
      color={variant === 'primary' ? 'primary' : 'inherit'}
      size={size}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />}
      {children}
    </CustomButton>
  );
};