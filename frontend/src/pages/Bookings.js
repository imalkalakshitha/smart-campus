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
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        resourceId: '', bookingDate: '',
        startTime: '', endTime: '',
        purpose: '', attendees: ''
    });

    const userId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        fetchBookings();
        fetchResources();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await bookingAPI.getAll();
            setBookings(res.data);
        } catch (err) {
            setError('Cannot connect to server. Check if Spring Boot is running on port 8081!');
        }
    };

    const fetchResources = async () => {
        try {
            const res = await resourceAPI.getAll();
            setResources(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.resourceId || !form.bookingDate ||
            !form.startTime || !form.endTime || !form.purpose) {
            setError('Please fill all required fields!');
            return;
        }
        try {
            await bookingAPI.create({
                user: { id: parseInt(userId) },
                resource: { id: parseInt(form.resourceId) },
                bookingDate: form.bookingDate,
                startTime: form.startTime + ':00',
                endTime: form.endTime + ':00',
                purpose: form.purpose,
                attendees: parseInt(form.attendees) || 0
            });
            setSuccess('Booking created successfully!');
            setOpen(false);
            setForm({
                resourceId: '', bookingDate: '',
                startTime: '', endTime: '',
                purpose: '', attendees: ''
            });
            fetchBookings();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Booking conflict! Already booked.'
            );
        }
    };

    const handleApprove = async (id) => {
        try {
            await bookingAPI.approve(id, 'Approved by admin');
            setSuccess('Booking approved!');
            fetchBookings();
        } catch (err) {
            setError('Failed to approve booking.');
        }
    };

    const handleReject = async (id) => {
        try {
            await bookingAPI.reject(id, 'Rejected by admin');
            setSuccess('Booking rejected!');
            fetchBookings();
        } catch (err) {
            setError('Failed to reject booking.');
        }
    };

    const handleCancel = async (id) => {
        try {
            await bookingAPI.cancel(id);
            setSuccess('Booking cancelled!');
            fetchBookings();
        } catch (err) {
            setError('Failed to cancel. Check Spring Boot!');
        }
    };

    const handleDeleteConfirm = (id) => {
        setSelectedId(id);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        try {
            await bookingAPI.delete(selectedId);
            setSuccess('Booking deleted!');
            setDeleteOpen(false);
            fetchBookings();
        } catch (err) {
            setError('Failed to delete booking.');
            setDeleteOpen(false);
        }
    };

    const statusColor = (status) => ({
        PENDING: 'warning', APPROVED: 'success',
        REJECTED: 'error', CANCELLED: 'default'
    }[status] || 'default');

    const pending = bookings.filter(
        b => b.status === 'PENDING').length;
    const approved = bookings.filter(
        b => b.status === 'APPROVED').length;

    return (
        <Box sx={{ backgroundColor: '#F5F7FA',
                   minHeight: '100vh', pb: 4 }}>
            <Container sx={{ pt: 4 }}>

                <Box display="flex" justifyContent="space-between"
                     alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <BookOnlineIcon sx={{
                            fontSize: 35, color: '#1976d2'
                        }} />
                        <Typography variant="h4" fontWeight="bold">
                            Booking Management
                        </Typography>
                    </Box>
                    <Button variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setOpen(true);
                            setError('');
                            setSuccess('');
                        }}
                        sx={{ borderRadius: 2, px: 3 }}>
                        New Booking
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}
                           onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}
                           onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={2} mb={3}>
                    {[
                        { label: 'Total',
                          value: bookings.length,
                          color: '#1976d2' },
                        { label: 'Pending',
                          value: pending,
                          color: '#f57c00' },
                        { label: 'Approved',
                          value: approved,
                          color: '#388e3c' },
                    ].map((s, i) => (
                        <Grid item xs={4} key={i}>
                            <Card elevation={2} sx={{
                                borderRadius: 2,
                                textAlign: 'center'
                            }}>
                                <CardContent sx={{ py: 1.5 }}>
                                    <Typography variant="h4"
                                        fontWeight="bold"
                                        color={s.color}>
                                        {s.value}
                                    </Typography>
                                    <Typography variant="body2"
                                        color="textSecondary">
                                        {s.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <TableContainer component={Paper} elevation={2}
                                sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                backgroundColor: '#1976d2'
                            }}>
                                {['ID', 'Resource', 'Date', 'Time',
                                  'Purpose', 'Attendees',
                                  'Status', 'Actions'].map(h => (
                                    <TableCell key={h} sx={{
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8}
                                        align="center"
                                        sx={{ py: 4, color: 'gray' }}>
                                        No bookings yet!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings.map((b) => (
                                    <TableRow key={b.id} sx={{
                                        '&:hover': {
                                            backgroundColor: '#F5F5F5'
                                        }
                                    }}>
                                        <TableCell>{b.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2"
                                                fontWeight="bold">
                                                {b.resource?.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="textSecondary">
                                                {b.resource?.type}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {b.bookingDate}
                                        </TableCell>
                                        <TableCell>
                                            {b.startTime?.substring(0,5)}
                                            {' - '}
                                            {b.endTime?.substring(0,5)}
                                        </TableCell>
                                        <TableCell>
                                            {b.purpose}
                                        </TableCell>
                                        <TableCell>
                                            {b.attendees}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={b.status}
                                                color={statusColor(
                                                    b.status)}
                                                size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex"
                                                 gap={0.5}
                                                 flexWrap="wrap">
                                                {b.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            sx={{ minWidth: 0, px: 1 }}
                                                            onClick={() => handleApprove(b.id)}>
                                                            ✓
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="error"
                                                            sx={{ minWidth: 0, px: 1 }}
                                                            onClick={() => handleReject(b.id)}>
                                                            ✗
                                                        </Button>
                                                    </>
                                                )}
                                                {b.status === 'APPROVED' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="warning"
                                                        onClick={() => handleCancel(b.id)}>
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Tooltip title="Delete Booking">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteConfirm(b.id)}>
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

                {/* New Booking Dialog */}
                <Dialog open={open}
                        onClose={() => setOpen(false)}
                        maxWidth="sm" fullWidth>
                    <DialogTitle sx={{
                        background:
                            'linear-gradient(135deg, #1976d2, #42a5f5)',
                        color: 'white', fontWeight: 'bold'
                    }}>
                        New Booking Request
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        {error && (
                            <Alert severity="error"
                                   sx={{ mb: 2, mt: 1 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField fullWidth select
                            label="Select Resource *"
                            margin="normal"
                            value={form.resourceId}
                            onChange={e => setForm({
                                ...form,
                                resourceId: e.target.value
                            })}>
                            {resources.map(r => (
                                <MenuItem key={r.id} value={r.id}>
                                    {r.name} — {r.type}
                                    (Cap: {r.capacity})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField fullWidth
                            label="Booking Date *"
                            type="date" margin="normal"
                            InputLabelProps={{ shrink: true }}
                            value={form.bookingDate}
                            onChange={e => setForm({
                                ...form,
                                bookingDate: e.target.value
                            })} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField fullWidth
                                    label="Start Time *"
                                    type="time" margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.startTime}
                                    onChange={e => setForm({
                                        ...form,
                                        startTime: e.target.value
                                    })} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth
                                    label="End Time *"
                                    type="time" margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.endTime}
                                    onChange={e => setForm({
                                        ...form,
                                        endTime: e.target.value
                                    })} />
                            </Grid>
                        </Grid>
                        <TextField fullWidth label="Purpose *"
                            margin="normal" value={form.purpose}
                            onChange={e => setForm({
                                ...form, purpose: e.target.value
                            })} />
                        <TextField fullWidth
                            label="Expected Attendees"
                            type="number" margin="normal"
                            value={form.attendees}
                            onChange={e => setForm({
                                ...form, attendees: e.target.value
                            })} />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpen(false)}
                                color="inherit">
                            Cancel
                        </Button>
                        <Button variant="contained"
                                onClick={handleSubmit}
                                sx={{ px: 3 }}>
                            Submit Booking
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirm Dialog */}
                <Dialog open={deleteOpen}
                        onClose={() => setDeleteOpen(false)}
                        maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ color: '#d32f2f' }}>
                        Delete Booking?
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete
                            booking <strong>#{selectedId}</strong>?
                            This cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setDeleteOpen(false)}
                            color="inherit">
                            Cancel
                        </Button>
                        <Button variant="contained" color="error"
                                onClick={handleDelete}
                                sx={{ px: 3 }}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Box>
    );
}

export default Bookings;