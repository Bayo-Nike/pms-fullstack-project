import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, IconButton, Collapse } from '@mui/material';
import {
  CheckCircleOutline, ErrorOutline, InfoOutlined, WarningAmberOutlined, Close
} from '@mui/icons-material';

const alertStyles = {
  success: { backgroundColor: '#66bb6a', icon: <CheckCircleOutline sx={{ color: '#fff' }} /> },
  error: { backgroundColor: '#f44336', icon: <ErrorOutline sx={{ color: '#fff' }} /> },
  info: { backgroundColor: '#29b6f6', icon: <InfoOutlined sx={{ color: '#fff' }} /> },
  warning: { backgroundColor: '#ffa726', icon: <WarningAmberOutlined sx={{ color: '#fff' }} /> },
};

export const StyledAlert = ({
  severity = 'info',
  title,
  children,
  duration = 6000, 
  onClose, 
  open, 
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(open);
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      if (duration !== null && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) {
            onClose();
          }
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [open, duration, onClose]);
  
  const handleManualClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const customStyle = alertStyles[severity] || alertStyles.info;

  return (
    <Collapse in={isVisible}>
      <Alert
        icon={customStyle.icon}
        sx={{
          borderRadius: '8px',
          color: '#fff',
          backgroundColor: customStyle.backgroundColor,
        }}
        action={
          <IconButton color="inherit" size="small" onClick={handleManualClose}>
            <Close fontSize="inherit" />
          </IconButton>
        }
        {...props}
      >
        <AlertTitle sx={{ fontWeight: 'bold' }}>{title}</AlertTitle>
        {children}
      </Alert>
    </Collapse>
  );
};