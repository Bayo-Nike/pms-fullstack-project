import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import 'leaflet/dist/leaflet.css';

const theme = createTheme({
  typography: { fontFamily: '"Poppins", sans-serif' },
  palette: {
    primary: { main: '#FBAF1E', contrastText: '#ffffff' },
    secondary: { main: '#0284C7' },
    background: { default: '#F8FAFC', paper: '#ffffff' },
    text: { primary: '#0F172A', secondary: '#475569' },
  },
  shape: { borderRadius: 12 },
});

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}