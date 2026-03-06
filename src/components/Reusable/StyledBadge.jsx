import React from 'react';
import { Badge } from '@mui/material';


export const StyledBadge = ({
  color = 'default',
  variant = 'standard',
  badgeContent,
  children,
  ...props 
}) => {
  return (
    <Badge
      color={color}
      variant={variant}
      badgeContent={badgeContent}
      {...props}
    >
      {children}
    </Badge>
  );
};