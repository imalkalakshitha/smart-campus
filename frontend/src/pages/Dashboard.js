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
 
const COLORS = {
    blue: '#1976d2', green: '#388e3c', orange: '#f57c00',
    red: '#d32f2f', grey: '#9e9e9e', cyan: '#0288d1',
    lightBlue: '#E3F2FD', lightGreen: '#E8F5E9',
    lightOrange: '#FFF3E0', lightRed: '#FFEBEE'
};
 
function StatCard({ title, value, icon, color, bg, sub }) {
    return (
        <Card elevation={3} sx={{
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
            },
            overflow: 'hidden',
            position: 'relative',
            height: '100%'
        }}>
            <Box sx={{
                position: 'absolute', top: 0, left: 0,
                right: 0, height: 6,
                backgroundColor: color
            }} />
            <CardContent sx={{ pt: 3 }}>
                <Box display="flex"
                     justifyContent="space-between"
                     alignItems="flex-start">
                    <Box>
                        <Typography variant="body2"
                            color="textSecondary"
                            fontWeight={500} mb={0.5}>
                            {title}
                        </Typography>
                        <Typography variant="h4"
                            fontWeight="bold"
                            color={color}
                            sx={{ lineHeight: 1 }}>
                            {value}
                        </Typography>
                        {sub && (
                            <Typography variant="caption"
                                color="textSecondary" mt={0.5}
                                display="block">
                                {sub}
                            </Typography>
                        )}
                    </Box>
                    <Avatar sx={{
                        bgcolor: bg, width: 56, height: 56,
                        boxShadow: `0 6px 18px ${color}33`
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
        <Card elevation={3} sx={{
            borderRadius: 3,
            height: '100%',
            '&:hover': {
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
            }
        }}>
            <CardContent sx={{ px: 2, py: 2 }}>
                <Typography variant="h6"
                    fontWeight="bold" mb={2}
                    color="text.primary">
                    {title}
                </Typography>
                <Box height={height}>
                    {children}
                </Box>
            </CardContent>
        </Card>
    );
}
 
const CustomDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pct = Math.round((percent || 0) * 100);
    if (pct === 0) return null;
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
            {pct}%
        </text>
    );
};
 
export default function Dashboard() {
    const [stats, setStats] = useState({
        resources: 0, bookings: 0, tickets: 0,
        pendingBookings: 0, approvedBookings: 0,
        rejectedBookings: 0, cancelledBookings: 0,
        openTickets: 0, inProgressTickets: 0,
        resolvedTickets: 0, closedTickets: 0,
        activeResources: 0, outOfServiceResources: 0,
    });
    const [resourceChartData, setResourceChartData] = useState([]);
    const [loading, setLoading] = useState(true);
 
    const userName = localStorage.getItem('userName') || 'User';
 
    useEffect(() => { fetchStats(); }, []);
 
    const fetchStats = async () => {
        try {
            const [res, book, tick] = await Promise.all([
                resourceAPI.getAll(),
                bookingAPI.getAll(),
                ticketAPI.getAll(),
            ]);
            const resources = res.data || [];
            const bookings = book.data || [];
            const tickets = tick.data || [];
 
            const typeCount = {};
            resources.forEach(r => {
                const label = (r.type || 'OTHER').replace(/_/g, ' ');
                typeCount[label] = (typeCount[label] || 0) + 1;
            });
            setResourceChartData(
                Object.entries(typeCount).map(([name, count]) => ({ name, count }))
            );
 
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
                outOfServiceResources: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
            });
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };
 
    const bookingPieData = [
        { name: 'Pending', value: stats.pendingBookings, color: COLORS.orange },
        { name: 'Approved', value: stats.approvedBookings, color: COLORS.green },
        { name: 'Rejected', value: stats.rejectedBookings, color: COLORS.red },
        { name: 'Cancelled', value: stats.cancelledBookings, color: COLORS.grey },
    ].filter(d => d.value > 0);
 
    const ticketPieData = [
        { name: 'Open', value: stats.openTickets, color: COLORS.orange },
        { name: 'In Progress', value: stats.inProgressTickets, color: COLORS.cyan },
        { name: 'Resolved', value: stats.resolvedTickets, color: COLORS.green },
        { name: 'Closed', value: stats.closedTickets, color: COLORS.grey },
    ].filter(d => d.value > 0);
 
    const overviewData = [
        {
            name: 'Resources',
            Active: stats.activeResources,
            'Out of Service': stats.outOfServiceResources,
        },
        {
            name: 'Bookings',
            Pending: stats.pendingBookings,
            Approved: stats.approvedBookings,
            Rejected: stats.rejectedBookings,
        },
        {
            name: 'Tickets',
            Open: stats.openTickets,
            'In Progress': stats.inProgressTickets,
            Resolved: stats.resolvedTickets,
        },
    ];
 
    const EmptyChart = ({ msg }) => (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography color="textSecondary" variant="body2">{msg}</Typography>
        </Box>
    );
 
    return (
        <Box sx={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
            {/* Hero Banner */}
            <Box sx={{
                width: '100%',
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
                color: '#fff'
            }}>
                <Container maxWidth="xl" disableGutters sx={{ py: 5, px: { xs: 2, md: 4 } }}>
                    <Paper elevation={0} sx={{
                        p: { xs: 2, md: 4 },
                        borderRadius: 3,
                        background: 'transparent',
                        position: 'relative',
                        overflow: 'visible',
                    }}>
                        <Box sx={{
                            position: 'absolute', right: -60, top: -60,
                            width: { xs: 120, md: 220 }, height: { xs: 120, md: 220 },
                            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)'
                        }} />
                        <Box sx={{
                            position: 'absolute', right: { xs: 10, md: 60 }, bottom: -60,
                            width: { xs: 80, md: 150 }, height: { xs: 80, md: 150 },
                            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)'
                        }} />
                        <Box display="flex" alignItems="center" gap={3} sx={{ position: 'relative', zIndex: 2 }}>
                            <Avatar sx={{
                                width: { xs: 56, md: 72 }, height: { xs: 56, md: 72 },
                                bgcolor: 'rgba(255,255,255,0.25)', fontSize: { xs: 20, md: 28 },
                                fontWeight: 'bold', border: '3px solid rgba(255,255,255,0.35)'
                            }}>
                                {userName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 0.4 }}>
                                    Welcome back, {userName}! 👋
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
                                    Smart Campus Operations Hub — Here's your overview
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>
 
            {/* Main Content */}
            <Container maxWidth="xl" disableGutters sx={{ pt: 4, pb: 6, px: { xs: 2, md: 4 } }}>
                {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}
 
                {/* Stat Cards Row */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Resources"
                            value={stats.resources}
                            icon={<MeetingRoomIcon sx={{ fontSize: 28 }} />}
                            color={COLORS.blue}
                            bg={COLORS.lightBlue}
                            sub={`${stats.activeResources} active`} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Bookings"
                            value={stats.bookings}
                            icon={<BookOnlineIcon sx={{ fontSize: 28 }} />}
                            color={COLORS.green}
                            bg={COLORS.lightGreen}
                            sub={`${stats.approvedBookings} approved`} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pending Bookings"
                            value={stats.pendingBookings}
                            icon={<PendingIcon sx={{ fontSize: 28 }} />}
                            color={COLORS.orange}
                            bg={COLORS.lightOrange}
                            sub="Awaiting approval" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Open Tickets"
                            value={stats.openTickets}
                            icon={<BugReportIcon sx={{ fontSize: 28 }} />}
                            color={COLORS.red}
                            bg={COLORS.lightRed}
                            sub={`${stats.inProgressTickets} in progress`} />
                    </Grid>
                </Grid>
 
                {/* Charts Row */}
                <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} md={4}>
                        <ChartCard title="📊 Booking Status" height={300}>
                            {bookingPieData.length === 0 ? (
                                <EmptyChart msg="No bookings yet" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingPieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="52%"
                                            outerRadius="88%"
                                            paddingAngle={4}
                                            stroke="none"
                                            labelLine={false}
                                            label={CustomDonutLabel}
                                        >
                                            {bookingPieData.map((entry, i) => (
                                                <Cell key={`c-${i}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v, name) => [`${v}`, name]} />
                                        <Legend verticalAlign="bottom" iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </Grid>
 
                    <Grid item xs={12} md={4}>
                        <ChartCard title="🎫 Ticket Status" height={300}>
                            {ticketPieData.length === 0 ? (
                                <EmptyChart msg="No tickets yet" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ticketPieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="52%"
                                            outerRadius="88%"
                                            paddingAngle={4}
                                            stroke="none"
                                            labelLine={false}
                                            label={CustomDonutLabel}
                                        >
                                            {ticketPieData.map((entry, i) => (
                                                <Cell key={`t-${i}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v, name) => [`${v}`, name]} />
                                        <Legend verticalAlign="bottom" iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </Grid>
 
                    <Grid item xs={12} md={4}>
                        <ChartCard title="🏢 Resource Types" height={300}>
                            {resourceChartData.length === 0 ? (
                                <EmptyChart msg="No resources yet" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={resourceChartData} margin={{ top: 8, right: 10, left: -10, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: 'rgba(25,118,210,0.06)' }} />
                                        <Bar dataKey="count" fill={COLORS.blue} radius={[6, 6, 0, 0]} maxBarSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </Grid>
                </Grid>
 
                {/* System Overview + Status Row */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <ChartCard title="📈 System Overview" height={320}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={overviewData} margin={{ top: 8, right: 20, left: -10, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                                    <Legend iconType="circle" iconSize={10} />
                                    <Bar dataKey="Active" fill={COLORS.green} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="Out of Service" fill={COLORS.red} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="Pending" fill={COLORS.orange} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="Approved" fill={COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="Rejected" fill="#e53935" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="Open" fill="#ef5350" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="In Progress" fill={COLORS.cyan} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="Resolved" fill="#66bb6a" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Grid>
 
                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" mb={2}>⚙️ System Status</Typography>
                                {[
                                    'Backend API (8081)',
                                    'MySQL Database',
                                    'Google OAuth',
                                    'Notifications',
                                    'File Uploads',
                                    'GitHub CI/CD',
                                ].map((label, i, arr) => (
                                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center" py={1}
                                         borderBottom={i < arr.length - 1 ? '1px solid #f5f5f5' : 'none'}>
                                        <Typography variant="body2" fontWeight={500}>{label}</Typography>
                                        <Chip
                                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                            label="Online"
                                            color="success"
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: 11 }}
                                        />
                                    </Box>
                                ))}
 
                                <Box mt={2.5} p={2} bgcolor="#F8FAFC" borderRadius={2} border="1px solid #E8EEF5">
                                    <Typography variant="body2" fontWeight="bold" mb={1.5} color="text.primary">
                                        Resource Health
                                    </Typography>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="caption" color="success.main" fontWeight={600}>Active</Typography>
                                        <Typography variant="caption" fontWeight="bold">{stats.activeResources}</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stats.resources > 0 ? (stats.activeResources / stats.resources) * 100 : 0}
                                        color="success"
                                        sx={{ borderRadius: 2, height: 8, mb: 1.5 }} />
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="caption" color="error.main" fontWeight={600}>Out of Service</Typography>
                                        <Typography variant="caption" fontWeight="bold">{stats.outOfServiceResources}</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stats.resources > 0 ? (stats.outOfServiceResources / stats.resources) * 100 : 0}
                                        color="error"
                                        sx={{ borderRadius: 2, height: 8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}