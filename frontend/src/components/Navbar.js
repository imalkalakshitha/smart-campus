// ...existing code...
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box,
    IconButton, Badge, Menu, Avatar, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { notificationAPI } from '../services/api';

function Navbar() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchor, setNotifAnchor] = useState(null);
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlUserId = params.get('userId');
        const urlName = params.get('name');

        if (urlUserId) {
            localStorage.setItem('userId', urlUserId);
            localStorage.setItem('userName', urlName);
            setUserId(urlUserId);
            setUserName(urlName);
        }

        const id = urlUserId || localStorage.getItem('userId');
        if (id) {
            fetchNotifications(id);
            const interval = setInterval(() => fetchNotifications(id), 30000);
            return () => clearInterval(interval);
        }
        return undefined;
    }, []);

    const fetchNotifications = async (id) => {
        try {
            const res = await notificationAPI.getUserNotifications(id);
            setNotifications(res.data);
            const unread = res.data.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Notification error:', error);
        }
    };

    const handleNotifOpen = (event) => {
        setNotifAnchor(event.currentTarget);
        if (userId && unreadCount > 0) {
            notificationAPI.markAllAsRead(userId).then(() => {
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }).catch(err => {
                console.error('markAllAsRead error:', err);
            });
        }
    };

    const handleNotifClose = () => setNotifAnchor(null);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        window.location.href = 'http://localhost:8081/logout';
    };

    const handleDeleteNotification = async (e, notif) => {
        e.stopPropagation();
        try {
            await notificationAPI.deleteNotification(notif.id);
            setNotifications(prev => prev.filter(x => x.id !== notif.id));
            if (!notif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleClearAll = async () => {
        try {
            await notificationAPI.deleteAll(userId);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Clear error:', err);
        }
    };

    return (
        <AppBar position="static" elevation={2}>
            <Toolbar>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Smart Campus
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button color="inherit" component={Link} to="/">
                        Dashboard
                    </Button>
                    <Button color="inherit" component={Link} to="/resources">
                        Resources
                    </Button>
                    <Button color="inherit" component={Link} to="/bookings">
                        Bookings
                    </Button>
                    <Button color="inherit" component={Link} to="/tickets">
                        Tickets
                    </Button>
                    <Button color="inherit" component={Link} to="/alerts">
                        Alerts
                    </Button>

                    <IconButton color="inherit" onClick={handleNotifOpen}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <Menu
                        anchorEl={notifAnchor}
                        open={Boolean(notifAnchor)}
                        onClose={handleNotifClose}
                        PaperProps={{ sx: { width: 350, maxHeight: 450, overflow: 'hidden' } }}
                    >
                        <Box sx={{
                            px: 2, py: 1.5, display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: '2px solid #1976d2', backgroundColor: '#f5f5f5'
                        }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="#1976d2">
                                🔔 Notifications
                            </Typography>
                            {notifications.length > 0 && (
                                <Button size="small" color="error" variant="outlined" sx={{ py: 0, fontSize: '11px' }} onClick={handleClearAll}>
                                    Clear All
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ overflowY: 'auto', maxHeight: 350 }}>
                            {notifications.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">
                                        🎉 No notifications!
                                    </Typography>
                                </Box>
                            ) : (
                                notifications.slice(0, 10).map(n => (
                                    <Box key={n.id} sx={{
                                        px: 2, py: 1.5,
                                        backgroundColor: n.isRead ? 'white' : '#E3F2FD',
                                        borderBottom: '1px solid #f0f0f0',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                        '&:hover': { backgroundColor: '#f9f9f9' }
                                    }}>
                                        <Box sx={{ flex: 1, mr: 1 }}>
                                            <Typography variant="body2" fontWeight="bold" color={n.isRead ? 'textPrimary' : '#1976d2'}>
                                                {n.title}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.3 }}>
                                                {n.message}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleDeleteNotification(e, n)}
                                            sx={{ width: 24, height: 24, color: '#ccc', '&:hover': { color: 'red', backgroundColor: '#ffebee' } }}
                                        >
                                            ✕
                                        </IconButton>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Menu>

                    <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
                        <Avatar sx={{
                            width: 34, height: 34, bgcolor: 'white', color: '#1976d2',
                            fontSize: '15px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.5)'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{ sx: { minWidth: 180 } }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="body2" fontWeight="bold">
                                {userName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                User ID: {userId}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box
                            sx={{
                                px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1,
                                cursor: 'pointer', color: 'red', '&:hover': { backgroundColor: '#ffebee' }
                            }}
                            onClick={handleLogout}
                        >
                            <LogoutIcon fontSize="small" />
                            <Typography variant="body2">Logout</Typography>
                        </Box>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;