import React from 'react';
import { ButtonGroup, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';


export const FilterButtonGroup = ({
  options,
  activeFilter,
  onFilterChange,
  size = 'medium',
  ...props
}) => {
  const theme = useTheme();

  const activeStyles = {
    backgroundColor: theme.customGreen.main,
    borderColor: theme.customGreen.main,
    '&:hover': {
      backgroundColor: theme.customGreen.dark,
    }
  };

  const inactiveStyles = {
    color: theme.palette.text.primary,
    borderColor: theme.border.default, 
  };

  return (
    <ButtonGroup fullWidth size={size} {...props}>
      {options.map(filter => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? 'contained' : 'outlined'}
          onClick={() => onFilterChange(filter.key)}
          sx={activeFilter === filter.key ? activeStyles : inactiveStyles}
        >
          {filter.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};