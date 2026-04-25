// login component updated
import React, { useState } from 'react';
import {
    Container, Box, Button, Typography, Paper,
    TextField, Divider, Alert, InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // redirect to google oauth
    const handleGoogleLogin = () => {
        window.location.href =
            'http://localhost:8081/oauth2/authorization/google';
    };

    // handle email based login
    const handleEmailLogin = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await userAPI.getAll();

            const foundUser = response.data.find(
                (u) => u.email.toLowerCase() === email.toLowerCase()
            );

            if (foundUser) {
                localStorage.setItem('userId', foundUser.id);
                localStorage.setItem('userName', foundUser.name);
                localStorage.setItem('userRole', foundUser.role);

                navigate(
                    `/dashboard?userId=${foundUser.id}&name=${foundUser.name}`
                );
            } else {
                setError('User not found. Try Google login first.');
            }
        } catch (err) {
            setError('Unable to login. Please try again later.');
        }

        setLoading(false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background:
                'linear-gradient(135deg, #1976d2 0%, #0d47a1 50%, #1565c0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container maxWidth="sm">

                {/* header */}
                <Box textAlign="center" mb={3}>
                    <SchoolIcon sx={{
                        fontSize: 70,
                        color: 'white',
                        mb: 1
                    }} />

                    <Typography variant="h3"
                        color="white"
                        fontWeight="bold">
                        Smart Campus
                    </Typography>

                    <Typography variant="h6"
                        sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Operations Hub
                    </Typography>
                </Box>

                {/* login card */}
                <Paper elevation={10} sx={{
                    p: 4,
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)'
                }}>
                    <Typography variant="h5"
                        fontWeight="bold"
                        textAlign="center"
                        mb={1}
                        color="#1976d2">
                        Welcome Back!
                    </Typography>

                    <Typography variant="body2"
                        textAlign="center"
                        color="textSecondary"
                        mb={3}>
                        Sign in to continue
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* email form */}
                    <Box component="form" onSubmit={handleEmailLogin}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="primary" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            defaultValue="••••••••"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="primary" />
                                    </InputAdornment>
                                )
                            }}
                            helperText="Enter your registered email"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                background:
                                    'linear-gradient(45deg, #1976d2, #42a5f5)',
                                mt: 1,
                                mb: 2
                            }}>
                            {loading ? 'Signing in...' : 'Login'}
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                            OR
                        </Typography>
                    </Divider>

                    {/* google login */}
                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            borderColor: '#DB4437',
                            color: '#DB4437',
                            '&:hover': {
                                backgroundColor: '#fff5f5'
                            }
                        }}>
                        Sign in with Google
                    </Button>

                    <Typography variant="caption"
                        display="block"
                        textAlign="center"
                        mt={2}
                        color="textSecondary">
                        SLIIT - Faculty of Computing | IT3030 PAF 2026
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

export default Login;//done