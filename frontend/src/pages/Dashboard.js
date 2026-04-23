import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, CardContent, Typography,
    Box, Chip, LinearProgress, Avatar, Paper, Fade
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import BugReportIcon from '@mui/icons-material/BugReport';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { resourceAPI, bookingAPI, ticketAPI } from '../services/api';

function Dashboard() {
    const [stats, setStats] = useState({
        resources: 0, bookings: 0,
        tickets: 0, pendingBookings: 0,
        approvedBookings: 0, openTickets: 0
    });
    const [loading, setLoading] = useState(true);

    const userName = localStorage.getItem('userName') || 'User';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [res, book, tick] = await Promise.all([
                    resourceAPI.getAll(),
                    bookingAPI.getAll(),
                    ticketAPI.getAll(),
                ]);
                const bookings = book.data;
                const tickets = tick.data;
                setStats({
                    resources: res.data.length,
                    bookings: bookings.length,
                    tickets: tickets.length,
                    pendingBookings: bookings.filter(
                        b => b.status === 'PENDING').length,
                    approvedBookings: bookings.filter(
                        b => b.status === 'APPROVED').length,
                    openTickets: tickets.filter(
                        t => t.status === 'OPEN').length,
                });
            } catch (error) {
                console.error('Error:', error);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Resources',
            value: stats.resources,
            icon: <MeetingRoomIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2',
            bg: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
            shadow: '0 4px 20px rgba(25, 118, 210, 0.15)'
        },
        {
            title: 'Total Bookings',
            value: stats.bookings,
            icon: <BookOnlineIcon sx={{ fontSize: 40 }} />,
            color: '#388e3c',
            bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
            shadow: '0 4px 20px rgba(56, 142, 60, 0.15)'
        },
        {
            title: 'Pending Bookings',
            value: stats.pendingBookings,
            icon: <PendingIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00',
            bg: 'linear-gradient(135deg, #FFF3E0, #FFCC80)',
            shadow: '0 4px 20px rgba(245, 124, 0, 0.15)'
        },
        {
            title: 'Open Tickets',
            value: stats.openTickets,
            icon: <BugReportIcon sx={{ fontSize: 40 }} />,
            color: '#d32f2f',
            bg: 'linear-gradient(135deg, #FFEBEE, #EF9A9A)',
            shadow: '0 4px 20px rgba(211, 47, 47, 0.15)'
        },
    ];

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
            minHeight: '100vh',
            py: 4
        }}>
            <Container maxWidth="lg">

                {/* Welcome Banner */}
                <Fade in={true} timeout={1000}>
                    <Paper elevation={4} sx={{
                        p: 4, mb: 5, borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            opacity: 0.1
                        }
                    }}>
                        <Box display="flex" 
                             alignItems="center" gap={3}>
                            <Avatar sx={{ 
                                width: 64, height: 64,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                fontSize: '28px', fontWeight: 'bold',
                                border: '3px solid rgba(255,255,255,0.3)'
                            }}>
                                {userName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" 
                                            fontWeight="bold"
                                            sx={{ mb: 1 }}>
                                    Welcome back, {userName}! 🌟
                                </Typography>
                                <Typography variant="h6" 
                                    sx={{ opacity: 0.9 }}>
                                    Smart Campus Operations Hub
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>

                {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

                {/* Stat Cards */}
                <Grid container spacing={4} mb={5}>
                    {statCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Fade in={true} timeout={1000 + index * 200}>
                                <Card elevation={6} sx={{ 
                                    borderRadius: 4,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': { 
                                        transform: 'translateY(-8px) scale(1.02)',
                                        boxShadow: card.shadow
                                    },
                                    background: card.bg,
                                    border: `1px solid ${card.color}20`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" 
                                             justifyContent="space-between"
                                             alignItems="center">
                                            <Box>
                                                <Typography 
                                                    color="textSecondary"
                                                    variant="body2"
                                                    gutterBottom
                                                    sx={{ fontWeight: 600 }}>
                                                    {card.title}
                                                </Typography>
                                                <Typography 
                                                    variant="h3"
                                                    fontWeight="bold"
                                                    color={card.color}
                                                    sx={{ mb: 1 }}>
                                                    {card.value}
                                                </Typography>
                                            </Box>
                                            <Avatar sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                width: 64, height: 64,
                                                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                                            }}>
                                                <Box sx={{ color: card.color, fontSize: 32 }}>
                                                    {card.icon}
                                                </Box>
                                            </Avatar>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>

                {/* Quick Stats */}
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Fade in={true} timeout={2000}>
                            <Card elevation={4} sx={{ 
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '1px solid #e9ecef'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" 
                                                fontWeight="bold" mb={3}
                                                color="primary">
                                        📊 Booking Status Overview
                                    </Typography>
                                    <Box mb={3}>
                                        <Box display="flex" 
                                             justifyContent="space-between"
                                             mb={2}>
                                            <Typography variant="body1" fontWeight={500}>
                                                ✅ Approved
                                            </Typography>
                                            <Chip label={stats.approvedBookings}
                                                color="success" size="small" 
                                                sx={{ fontWeight: 'bold' }} />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats.bookings > 0 ?
                                                (stats.approvedBookings / 
                                                 stats.bookings) * 100 : 0}
                                            color="success"
                                            sx={{ borderRadius: 3, height: 10 }}
                                        />
                                    </Box>
                                    <Box>
                                        <Box display="flex"
                                             justifyContent="space-between"
                                             mb={2}>
                                            <Typography variant="body1" fontWeight={500}>
                                                ⏳ Pending
                                            </Typography>
                                            <Chip label={stats.pendingBookings}
                                                color="warning" size="small"
                                                sx={{ fontWeight: 'bold' }} />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats.bookings > 0 ?
                                                (stats.pendingBookings / 
                                                 stats.bookings) * 100 : 0}
                                            color="warning"
                                            sx={{ borderRadius: 3, height: 10 }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Fade in={true} timeout={2200}>
                            <Card elevation={4} sx={{ 
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '1px solid #e9ecef'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" 
                                                fontWeight="bold" mb={3}
                                                color="primary">
                                        🎫 Ticket Status Overview
                                    </Typography>
                                    <Box mb={3}>
                                        <Box display="flex" 
                                             justifyContent="space-between"
                                             mb={2}>
                                            <Typography variant="body1" fontWeight={500}>
                                                🔓 Open
                                            </Typography>
                                            <Chip label={stats.openTickets}
                                                color="error" size="small"
                                                sx={{ fontWeight: 'bold' }} />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats.tickets > 0 ?
                                                (stats.openTickets / 
                                                 stats.tickets) * 100 : 0}
                                            color="error"
                                            sx={{ borderRadius: 3, height: 10 }}
                                        />
                                    </Box>
                                    <Box>
                                        <Box display="flex"
                                             justifyContent="space-between"
                                             mb={2}>
                                            <Typography variant="body1" fontWeight={500}>
                                                ✅ Closed
                                            </Typography>
                                            <Chip label={stats.tickets - stats.openTickets}
                                                color="success" size="small"
                                                sx={{ fontWeight: 'bold' }} />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats.tickets > 0 ?
                                                ((stats.tickets - stats.openTickets) / 
                                                 stats.tickets) * 100 : 0}
                                            color="success"
                                            sx={{ borderRadius: 3, height: 10 }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Dashboard;//new