import React from 'react';
import { Tooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  
  [`& .${tooltipClasses.arrow}`]: {
    color: '#383838', 
  },
 
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#383838',
    color: '#ffffff', 
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: theme.typography.pxToRem(13),
  },
}));


export const StyledTooltip = ({ title, children, placement = 'top', arrow = false, ...props }) => {
  return (
    <CustomTooltip title={title} placement={placement} arrow={arrow} {...props}>
      {children}
    </CustomTooltip>
  );
};