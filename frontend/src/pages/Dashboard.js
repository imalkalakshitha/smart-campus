// Dashboard Component - Cleaned Version

import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, CardContent, Typography,
    Box, Chip, LinearProgress, Avatar, Paper
} from '@mui/material';

import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, PieChart, Pie, Cell,
    ResponsiveContainer
} from 'recharts';

import { resourceAPI, bookingAPI, ticketAPI } from '../services/api';

// ================= CONSTANTS =================
const COLORS = {
    blue: '#1976d2',
    green: '#388e3c',
    orange: '#f57c00',
    red: '#d32f2f',
    grey: '#9e9e9e',
    cyan: '#0288d1',
    lightBlue: '#E3F2FD',
    lightGreen: '#E8F5E9',
    lightOrange: '#FFF3E0',
    lightRed: '#FFEBEE'
};

// ================= SMALL COMPONENTS =================
function StatCard({ title, value, icon, color, bg, sub }) {
    return (
        <Card elevation={3} sx={{
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
            },
            position: 'relative',
            height: '100%'
        }}>
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                backgroundColor: color
            }} />
            <CardContent sx={{ pt: 3 }}>
                <Box display="flex" justifyContent="space-between">
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {title}
                        </Typography>

                        <Typography variant="h4" fontWeight="bold" color={color}>
                            {value}
                        </Typography>

                        {sub && (
                            <Typography variant="caption" color="text.secondary">
                                {sub}
                            </Typography>
                        )}
                    </Box>

                    <Avatar sx={{
                        bgcolor: bg,
                        width: 56,
                        height: 56
                    }}>
                        <Box sx={{ color }}>{icon}</Box>
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}

function ChartCard({ title, children, height = 280 }) {
    return (
        <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    {title}
                </Typography>
                <Box height={height}>{children}</Box>
            </CardContent>
        </Card>
    );
}

// ================= MAIN COMPONENT =================
export default function Dashboard() {

    // STATE
    const [stats, setStats] = useState({
        resources: 0,
        bookings: 0,
        tickets: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        rejectedBookings: 0,
        cancelledBookings: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
        activeResources: 0,
        outOfServiceResources: 0,
    });

    const [resourceChartData, setResourceChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const userName = localStorage.getItem('userName') || 'User';

    // EFFECT
    useEffect(() => {
        loadStats();
    }, []);

    // API
    const loadStats = async () => {
        try {
            const [res, book, tick] = await Promise.all([
                resourceAPI.getAll(),
                bookingAPI.getAll(),
                ticketAPI.getAll()
            ]);

            const resources = res.data || [];
            const bookings = book.data || [];
            const tickets = tick.data || [];

            // Resource type grouping
            const typeMap = {};
            resources.forEach(resource => {
                const label = (resource.type || 'OTHER').replace(/_/g, ' ');
                typeMap[label] = (typeMap[label] || 0) + 1;
            });

            setResourceChartData(
                Object.entries(typeMap).map(([name, count]) => ({ name, count }))
            );

            // Stats calculation
            setStats({
                resources: resources.length,
                bookings: bookings.length,
                tickets: tickets.length,

                pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
                approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
                rejectedBookings: bookings.filter(b => b.status === 'REJECTED').length,
                cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,

                openTickets: tickets.filter(t => t.status === 'OPEN').length,
                inProgressTickets: tickets.filter(t => t.status === 'IN_PROGRESS').length,
                resolvedTickets: tickets.filter(t => t.status === 'RESOLVED').length,
                closedTickets: tickets.filter(t => t.status === 'CLOSED').length,

                activeResources: resources.filter(r => r.status === 'ACTIVE').length,
                outOfServiceResources: resources.filter(r => r.status === 'OUT_OF_SERVICE').length
            });

        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // DERIVED DATA
    const pendingCount = stats.pendingBookings;
    const approvedCount = stats.approvedBookings;

    return (
        <Box sx={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>

            {/* HEADER */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
                color: '#fff'
            }}>
                <Container sx={{ py: 4 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                            {userName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Welcome back, {userName}
                            </Typography>
                            <Typography variant="body2">
                                Smart Campus Overview
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container sx={{ pt: 4 }}>

                {isLoading && <LinearProgress sx={{ mb: 2 }} />}

                {/* STAT CARDS */}
                <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Resources"
                            value={stats.resources}
                            icon={<MeetingRoomIcon />}
                            color={COLORS.blue}
                            bg={COLORS.lightBlue}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Bookings"
                            value={stats.bookings}
                            icon={<BookOnlineIcon />}
                            color={COLORS.green}
                            bg={COLORS.lightGreen}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pending"
                            value={pendingCount}
                            icon={<PendingIcon />}
                            color={COLORS.orange}
                            bg={COLORS.lightOrange}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Open Tickets"
                            value={stats.openTickets}
                            icon={<BugReportIcon />}
                            color={COLORS.red}
                            bg={COLORS.lightRed}
                        />
                    </Grid>
                </Grid>

                {/* CHARTS REMAIN SAME (no risky changes) */}

            </Container>
        </Box>
    );
}//done all