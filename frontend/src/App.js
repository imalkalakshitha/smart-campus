import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import Tickets from './pages/Tickets';
import EmergencyAlerts from './pages/EmergencyAlerts';
import Login from './pages/Login';
import Navbar from './components/Navbar';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <>
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" 
                                       element={<Dashboard />} />
                                <Route path="/resources" 
                                       element={<Resources />} />
                                <Route path="/bookings" 
                                       element={<Bookings />} />
                                <Route path="/tickets" 
                                       element={<Tickets />} />
                                <Route path="/alerts"
                                       element={<EmergencyAlerts />} />
                            </Routes>
                        </>
                    } />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;