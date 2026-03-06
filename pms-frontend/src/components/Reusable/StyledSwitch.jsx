import { Switch } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

/**
 * A styled Switch component that uses the brand's primary color.
 */
export const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    // Styles for the CHECKED state
    '&.Mui-checked': {
      // --- CORRECTED: Using the primary theme color ---
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
      },
    },
    '&.Mui-checked + .MuiSwitch-track': {
      // --- CORRECTED: Using the primary theme color ---
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

// Re-exporting for API consistency
export const ReusableSwitch = (props) => <StyledSwitch {...props} />;