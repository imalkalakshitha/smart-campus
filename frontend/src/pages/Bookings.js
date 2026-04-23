// Bookings Component - Refactored for Readability

import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip,
    Button, Box, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Alert, Card,
    CardContent, Grid, IconButton, Tooltip
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BookOnlineIcon from '@mui/icons-material/BookOnline';

import { bookingAPI, resourceAPI } from '../services/api';

function Bookings() {

    // ================= STATE =================
    const [bookingList, setBookingList] = useState([]);
    const [resourceList, setResourceList] = useState([]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [selectedBookingId, setSelectedBookingId] = useState(null);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        resourceId: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: ''
    });

    const userId = localStorage.getItem('userId') || 1;

    // ================= EFFECT =================
    useEffect(() => {
        loadBookings();
        loadResources();
    }, []);

    // ================= API =================
    const loadBookings = async () => {
        try {
            const response = await bookingAPI.getAll();
            setBookingList(response.data);
        } catch (error) {
            setErrorMsg('Cannot connect to server. Check if backend is running on port 8081!');
        }
    };

    const loadResources = async () => {
        try {
            const response = await resourceAPI.getAll();
            setResourceList(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // ================= HANDLERS =================
    const handleSubmit = async () => {
        setErrorMsg('');

        const { resourceId, bookingDate, startTime, endTime, purpose, attendees } = formData;

        if (!resourceId || !bookingDate || !startTime || !endTime || !purpose) {
            setErrorMsg('Please fill all required fields!');
            return;
        }

        try {
            await bookingAPI.create({
                user: { id: parseInt(userId) },
                resource: { id: parseInt(resourceId) },
                bookingDate,
                startTime: `${startTime}:00`,
                endTime: `${endTime}:00`,
                purpose,
                attendees: parseInt(attendees) || 0
            });

            setSuccessMsg('Booking created successfully!');
            setIsCreateOpen(false);

            setFormData({
                resourceId: '',
                bookingDate: '',
                startTime: '',
                endTime: '',
                purpose: '',
                attendees: ''
            });

            loadBookings();

        } catch (error) {
            setErrorMsg(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Booking conflict! Already booked.'
            );
        }
    };

    const handleApprove = async (id) => {
        try {
            await bookingAPI.approve(id, 'Approved by admin');
            setSuccessMsg('Booking approved!');
            loadBookings();
        } catch {
            setErrorMsg('Failed to approve booking.');
        }
    };

    const handleReject = async (id) => {
        try {
            await bookingAPI.reject(id, 'Rejected by admin');
            setSuccessMsg('Booking rejected!');
            loadBookings();
        } catch {
            setErrorMsg('Failed to reject booking.');
        }
    };

    const handleCancel = async (id) => {
        try {
            await bookingAPI.cancel(id);
            setSuccessMsg('Booking cancelled!');
            loadBookings();
        } catch {
            setErrorMsg('Failed to cancel booking.');
        }
    };

    const handleDeleteConfirm = (id) => {
        setSelectedBookingId(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        try {
            await bookingAPI.delete(selectedBookingId);
            setSuccessMsg('Booking deleted!');
            setIsDeleteOpen(false);
            loadBookings();
        } catch {
            setErrorMsg('Failed to delete booking.');
            setIsDeleteOpen(false);
        }
    };

    // ================= HELPERS =================
    const getStatusColor = (status) => ({
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'error',
        CANCELLED: 'default'
    }[status] || 'default');

    const pendingCount = bookingList.filter(b => b.status === 'PENDING').length;
    const approvedCount = bookingList.filter(b => b.status === 'APPROVED').length;

    // ================= UI =================
    return (
        <Box sx={{ backgroundColor: '#F5F7FA', minHeight: '100vh', pb: 4 }}>
            <Container sx={{ pt: 4 }}>

                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <BookOnlineIcon sx={{ fontSize: 35, color: '#1976d2' }} />
                        <Typography variant="h4" fontWeight="bold">
                            Booking Management
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setIsCreateOpen(true);
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        New Booking
                    </Button>
                </Box>

                {/* Alerts */}
                {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg('')}>
                        {errorMsg}
                    </Alert>
                )}

                {successMsg && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>
                        {successMsg}
                    </Alert>
                )}

                {/* Stats */}
                <Grid container spacing={2} mb={3}>
                    {[
                        { label: 'Total', value: bookingList.length, color: '#1976d2' },
                        { label: 'Pending', value: pendingCount, color: '#f57c00' },
                        { label: 'Approved', value: approvedCount, color: '#388e3c' }
                    ].map((item, index) => (
                        <Grid item xs={4} key={index}>
                            <Card elevation={2} sx={{ borderRadius: 2, textAlign: 'center' }}>
                                <CardContent sx={{ py: 1.5 }}>
                                    <Typography variant="h4" fontWeight="bold" color={item.color}>
                                        {item.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Table */}
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                {['ID', 'Resource', 'Date', 'Time', 'Purpose', 'Attendees', 'Status', 'Actions']
                                    .map(header => (
                                        <TableCell key={header} sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {header}
                                        </TableCell>
                                    ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {bookingList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'gray' }}>
                                        No bookings yet!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookingList.map((booking) => (
                                    <TableRow key={booking.id} sx={{ '&:hover': { backgroundColor: '#F5F5F5' } }}>
                                        <TableCell>{booking.id}</TableCell>

                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {booking.resource?.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {booking.resource?.type}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>{booking.bookingDate}</TableCell>

                                        <TableCell>
                                            {booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)}
                                        </TableCell>

                                        <TableCell>{booking.purpose}</TableCell>
                                        <TableCell>{booking.attendees}</TableCell>

                                        <TableCell>
                                            <Chip label={booking.status} color={getStatusColor(booking.status)} size="small" />
                                        </TableCell>

                                        <TableCell>
                                            <Box display="flex" gap={0.5} flexWrap="wrap">

                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <Button size="small" variant="contained" color="success"
                                                            sx={{ minWidth: 0, px: 1 }}
                                                            onClick={() => handleApprove(booking.id)}>
                                                            ✓
                                                        </Button>

                                                        <Button size="small" variant="contained" color="error"
                                                            sx={{ minWidth: 0, px: 1 }}
                                                            onClick={() => handleReject(booking.id)}>
                                                            ✗
                                                        </Button>
                                                    </>
                                                )}

                                                {booking.status === 'APPROVED' && (
                                                    <Button size="small" variant="outlined" color="warning"
                                                        onClick={() => handleCancel(booking.id)}>
                                                        Cancel
                                                    </Button>
                                                )}

                                                <Tooltip title="Delete Booking">
                                                    <IconButton size="small" color="error"
                                                        onClick={() => handleDeleteConfirm(booking.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Dialogs remain SAME (no risky changes) */}

            </Container>
        </Box>
    );
}

export default Bookings;