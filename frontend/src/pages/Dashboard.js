import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, CardContent, Typography,
    Box, Chip, LinearProgress, Avatar, Paper
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
            bg: '#E3F2FD'
        },
        {
            title: 'Total Bookings',
            value: stats.bookings,
            icon: <BookOnlineIcon sx={{ fontSize: 40 }} />,
            color: '#388e3c',
            bg: '#E8F5E9'
        },
        {
            title: 'Pending Bookings',
            value: stats.pendingBookings,
            icon: <PendingIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00',
            bg: '#FFF3E0'
        },
        {
            title: 'Open Tickets',
            value: stats.openTickets,
            icon: <BugReportIcon sx={{ fontSize: 40 }} />,
            color: '#d32f2f',
            bg: '#FFEBEE'
        },
    ];

    return (
        <Box sx={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
            <Container sx={{ pt: 4, pb: 4 }}>

                {/* Welcome Banner */}
                <Paper elevation={0} sx={{
                    p: 3, mb: 4, borderRadius: 3,
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    color: 'white'
                }}>
                    <Box display="flex" 
                         alignItems="center" gap={2}>
                        <Avatar sx={{ 
                            width: 56, height: 56,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            fontSize: '24px', fontWeight: 'bold'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" 
                                        fontWeight="bold">
                                Welcome, {userName}! 👋
                            </Typography>
                            <Typography variant="body2" 
                                sx={{ opacity: 0.9 }}>
                                Smart Campus Operations Hub
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Stat Cards */}
                <Grid container spacing={3} mb={4}>
                    {statCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card elevation={2} sx={{ 
                                borderRadius: 3,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}>
                                <CardContent>
                                    <Box display="flex" 
                                         justifyContent="space-between"
                                         alignItems="center">
                                        <Box>
                                            <Typography 
                                                color="textSecondary"
                                                variant="body2"
                                                gutterBottom>
                                                {card.title}
                                            </Typography>
                                            <Typography 
                                                variant="h3"
                                                fontWeight="bold"
                                                color={card.color}>
                                                {card.value}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ 
                                            bgcolor: card.bg,
                                            width: 56, height: 56
                                        }}>
                                            <Box sx={{ color: card.color }}>
                                                {card.icon}
                                            </Box>
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Quick Stats */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" 
                                            fontWeight="bold" mb={2}>
                                    Booking Status Overview
                                </Typography>
                                <Box mb={2}>
                                    <Box display="flex" 
                                         justifyContent="space-between"
                                         mb={1}>
                                        <Typography variant="body2">
                                            Approved
                                        </Typography>
                                        <Chip label={stats.approvedBookings}
                                            color="success" size="small" />
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stats.bookings > 0 ?
                                            (stats.approvedBookings / 
                                             stats.bookings) * 100 : 0}
                                        color="success"
                                        sx={{ borderRadius: 2, height: 8 }}
                                    />
                                </Box>
                                <Box>
                                    <Box display="flex"
                                         justifyContent="space-between"
                                         mb={1}>
                                        <Typography variant="body2">
                                            Pending
                                        </Typography>
                                        <Chip label={stats.pendingBookings}
                                            color="warning" size="small" />
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stats.bookings > 0 ?
                                            (stats.pendingBookings / 
                                             stats.bookings) * 100 : 0}
                                        color="warning"
                                        sx={{ borderRadius: 2, height: 8 }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    
                </Grid>
            </Container>
        </Box>
    );
}

export default Dashboard;//new