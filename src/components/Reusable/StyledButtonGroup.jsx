import { ButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';

// This is the styled component that applies our custom theme styles.
const CustomButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  // As per the design, the button group itself should not have a shadow.
  boxShadow: 'none', 
  
  // This targets the border of outlined buttons inside the group to ensure consistency.
  // It specifically targets buttons that are NOT the last one to merge the inner borders.
  '& .MuiButton-outlined:not(:last-of-type)': {
    borderColor: theme.border.default, // Uses the custom border color from your theme.
  },
}));

/**
 * A styled ButtonGroup container based on the design system.
 * Use this to group StyledButton components together.
 */
export const StyledButtonGroup = (props) => {
  // We pass all props (like size, children, etc.) to our custom styled component.
  return <CustomButtonGroup {...props} />;
};

/**
 * An alias for StyledButtonGroup. This is included so that your existing imports
 * in Dashboard.jsx, which use this name, continue to work without any changes.
 */
export const ReusableButtonGroup = StyledButtonGroup;