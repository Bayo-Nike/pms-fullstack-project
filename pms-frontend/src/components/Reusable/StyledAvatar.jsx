import React from 'react';
import { Avatar, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700', 
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));


export const StyledAvatar = ({
  size = 'medium',
  variant = 'circular',
  badge = false,
  src,
  children,
  ...props 
}) => {

  const sizeMap = {
    '40px': { width: 40, height: 40 },
    '32px': { width: 32, height: 32 },
    '24px': { width: 24, height: 24, fontSize: '0.875rem' },
    '18px': { width: 18, height: 18, fontSize: '0.625rem' },
  };

  const avatarStyles = sizeMap[size] || sizeMap['32px']; 

  const avatarElement = (
    <Avatar
      src={src}
      variant={variant}
      sx={{ ...avatarStyles, bgcolor: 'action.disabled' }} 
      {...props}
    >
      {children}
    </Avatar>
  );

  if (badge) {
    return (
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        {avatarElement}
      </StyledBadge>
    );
  }

 
  return avatarElement;
};