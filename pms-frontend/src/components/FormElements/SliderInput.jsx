import React from 'react';
import { Slider, Typography, Box } from '@mui/material';

export const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 1, ...props }) => {
  return (
    <Box>
      <Typography gutterBottom>{label}</Typography>
      <Slider
        value={value}
        onChange={onChange}
        valueLabelDisplay="auto"
        min={min}
        max={max}
        step={step}
        {...props}
      />
    </Box>
  );
};