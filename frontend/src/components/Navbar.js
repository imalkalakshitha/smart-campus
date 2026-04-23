// Navbar Component - Improved Readability Version

import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Box,
    IconButton, Badge, Menu, Avatar, Divider
} from '@mui/material';

import SchoolIcon from '@mui/icons-material/School';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';

import { notificationAPI } from '../services/api';

function Navbar() {

    // ================= STATE =================
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);

    const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'User');

    // ================= EFFECT =================
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const urlUserId = params.get('userId');
        const urlName = params.get('name');

        // Save user data from URL if available
        if (urlUserId) {
            localStorage.setItem('userId', urlUserId);
            localStorage.setItem('userName', urlName);

            setUserId(urlUserId);
            setUserName(urlName);
        }

        const currentUserId = urlUserId || localStorage.getItem('userId');

        if (currentUserId) {
            fetchNotifications(currentUserId);

            const intervalId = setInterval(() => {
                fetchNotifications(currentUserId);
            }, 30000);

            return () => clearInterval(intervalId);
        }

        return undefined;
    }, []);

    // ================= API =================
    const fetchNotifications = async (id) => {
        try {
            const response = await notificationAPI.getUserNotifications(id);

            setNotifications(response.data);

            const unread = response.data.filter(item => !item.isRead).length;
            setUnreadCount(unread);

        } catch (error) {
            console.error('Notification error:', error); // fixed typo
        }
    };

    // ================= HANDLERS =================
    const handleNotifOpen = (event) => {
        setNotifAnchorEl(event.currentTarget);

        if (userId && unreadCount > 0) {
            notificationAPI.markAllAsRead(userId)
                .then(() => {
                    setUnreadCount(0);
                    setNotifications(prev =>
                        prev.map(item => ({ ...item, isRead: true }))
                    );
                })
                .catch(err => console.error('markAllAsRead error:', err));
        }
    };

    const handleNotifClose = () => setNotifAnchorEl(null);

    const handleAvatarClick = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => setMenuAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');

        window.location.href = 'http://localhost:8081/logout';
    };

    const handleDeleteNotification = async (event, notif) => {
        event.stopPropagation();

        try {
            await notificationAPI.deleteNotification(notif.id);

            setNotifications(prev =>
                prev.filter(item => item.id !== notif.id)
            );

            if (!notif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await notificationAPI.deleteAll(userId);
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Clear error:', error);
        }
    };

    // ================= UI =================
    return (
        <AppBar position="static" elevation={2}>
            <Toolbar>

                {/* Logo */}
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Smart Campus
                </Typography>

                {/* Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                    <Button color="inherit" component={Link} to="/">Dashboard</Button>
                    <Button color="inherit" component={Link} to="/resources">Resources</Button>
                    <Button color="inherit" component={Link} to="/bookings">Bookings</Button>
                    <Button color="inherit" component={Link} to="/tickets">Tickets</Button>
                    <Button color="inherit" component={Link} to="/alerts">Alerts</Button>

                    {/* Notifications */}
                    <IconButton color="inherit" onClick={handleNotifOpen}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <Menu
                        anchorEl={notifAnchorEl}
                        open={Boolean(notifAnchorEl)}
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
                                <Button
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{ py: 0, fontSize: '11px' }}
                                    onClick={handleClearAll}
                                >
                                    Clear All
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ overflowY: 'auto', maxHeight: 350 }}>
                            {notifications.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        🎉 No notifications!
                                    </Typography>
                                </Box>
                            ) : (
                                notifications.slice(0, 10).map(item => (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            px: 2, py: 1.5,
                                            backgroundColor: item.isRead ? 'white' : '#E3F2FD',
                                            borderBottom: '1px solid #f0f0f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            '&:hover': { backgroundColor: '#f9f9f9' }
                                        }}
                                    >
                                        <Box sx={{ flex: 1, mr: 1 }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                color={item.isRead ? 'text.primary' : '#1976d2'}
                                            >
                                                {item.title}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: 'block', mt: 0.3 }}
                                            >
                                                {item.message}
                                            </Typography>
                                        </Box>

                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleDeleteNotification(e, item)}
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                color: '#ccc',
                                                '&:hover': {
                                                    color: 'red',
                                                    backgroundColor: '#ffebee'
                                                }
                                            }}
                                        >
                                            ✕
                                        </IconButton>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Menu>

                    {/* Avatar */}
                    <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
                        <Avatar sx={{
                            width: 34,
                            height: 34,
                            bgcolor: 'white',
                            color: '#1976d2',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.5)'
                        }}>
                            {userName?.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>

                    {/* User Menu */}
                    <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{ sx: { minWidth: 180 } }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="body2" fontWeight="bold">
                                {userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                User ID: {userId}
                            </Typography>
                        </Box>

                        <Divider />

                        <Box
                            onClick={handleLogout}
                            sx={{
                                px: 2, py: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                color: 'red',
                                '&:hover': { backgroundColor: '#ffebee' }
                            }}
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