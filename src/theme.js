import { createTheme } from '@mui/material/styles';

const siingeeYellow = {
  light: '#FFDDB2',
  main: '#FBAF1E',
  dark: '#F79120',
  contrastText: '#ffffff',
};

// Updated from Green to Light Blue
const customBlue = {
  light: '#E0F2FE', // Very light blue for hovers
  main: '#0284C7',  // Primary brand blue
  dark: '#0369A1',  // Darker blue for active states/text
  contrastText: '#ffffff',
};

const grey = {
  100: '#F5F5F5', 200: '#EEEEEE', 300: '#E0E0E0', 400: '#BDBDBD',
  500: '#9E9E9E', 600: '#757575', 700: '#616161', 800: '#424242', 900: '#212121',
};

export const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: { fontSize: '1.5rem', fontWeight: 700 }, // 24px
    h2: { fontSize: '1.25rem', fontWeight: 700 }, // 20px
    h3: { fontSize: '1.125rem', fontWeight: 600 }, // 18px
    body1: { fontSize: '0.875rem' }, // 14px
    body2: { fontSize: '0.75rem' }, // 12px
  },
  palette: {
    primary: customBlue, // Set Blue as Primary
    secondary: siingeeYellow, // Set Yellow as Secondary
    error: { main: '#F44336' },
    warning: { main: '#FFA726' },
    info: { main: '#0284C7' },
    success: { main: '#10B981' },
    grey: grey,
    text: {
      primary: grey[800],
      secondary: grey[600],
    },
    background: {
      default: '#F8FAFC', // Slightly bluish grey background
      paper: '#ffffff',
    },
  },
  customBlue: customBlue, // Exported for manual use
  shape: {
    borderRadius: 10, // Slightly more rounded for a modern look
  },
  components: {
    MuiButtonBase: { styleOverrides: { root: { textTransform: 'none' } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: '8px' },
      },
    },
  },
});