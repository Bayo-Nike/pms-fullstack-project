import React from 'react';
import { Rating, Typography, Box } from '@mui/material';

export const RatingInput = ({ label, name, value, onChange, size = 'medium', ...props }) => {
  return (
    <Box>
      <Typography component="legend">{label}</Typography>
      <Rating
        name={name}
        value={Number(value)}
        onChange={onChange}
        size={size}
        {...props}
      />
    </Box>
  );
};