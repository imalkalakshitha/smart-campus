import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip,
    Button, Box, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Alert, Card,
    CardContent, Grid, Avatar, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BugReportIcon from '@mui/icons-material/BugReport';
import { ticketAPI, resourceAPI } from '../services/api';

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [resources, setResources] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        resourceId: '', category: '',
        description: '', priority: 'MEDIUM',
        contactDetails: ''
    });

    const userId = localStorage.getItem('userId') || 1;

    const categories = [
        'Electrical', 'Network', 'Projector',
        'Air Conditioning', 'Furniture', 'Computer', 'Other'
    ];

    useEffect(() => {
        fetchTickets();
        fetchResources();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await ticketAPI.getAll();
            setTickets(res.data);
        } catch (err) {
            setError('Cannot connect to server!');
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
        if (!form.category || !form.description ||
            !form.contactDetails) {
            setError('Please fill all required fields!');
            return;
        }
        try {
            await ticketAPI.create({
                reportedBy: { id: parseInt(userId) },
                resource: form.resourceId ?
                    { id: parseInt(form.resourceId) } : null,
                category: form.category,
                description: form.description,
                priority: form.priority,
                contactDetails: form.contactDetails
            });
            setSuccess('Ticket created successfully!');
            setOpen(false);
            setForm({
                resourceId: '', category: '',
                description: '', priority: 'MEDIUM',
                contactDetails: ''
            });
            fetchTickets();
        } catch (err) {
            setError('Failed to create ticket. Try again.');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await ticketAPI.updateStatus(id, status, '');
            setSuccess('Status updated!');
            fetchTickets();
        } catch (err) {
            setError('Failed to update status.');
        }
    };

    const handleDeleteConfirm = (id) => {
        setSelectedId(id);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        try {
            await ticketAPI.delete(selectedId);
            setSuccess('Ticket deleted successfully!');
            setDeleteOpen(false);
            fetchTickets();
        } catch (err) {
            setError('Failed to delete ticket.');
            setDeleteOpen(false);
        }
    };

    const priorityColor = (p) => ({
        LOW: 'success', MEDIUM: 'warning',
        HIGH: 'error', CRITICAL: 'error'
    }[p] || 'default');

    const statusColor = (s) => ({
        OPEN: 'warning', IN_PROGRESS: 'info',
        RESOLVED: 'success', CLOSED: 'default',
        REJECTED: 'error'
    }[s] || 'default');

    const open_count = tickets.filter(
        t => t.status === 'OPEN').length;
    const progress_count = tickets.filter(
        t => t.status === 'IN_PROGRESS').length;
    const resolved_count = tickets.filter(
        t => t.status === 'RESOLVED').length;

    return (
        <Box sx={{ backgroundColor: '#F5F7FA',
                   minHeight: '100vh', pb: 4 }}>
            <Container sx={{ pt: 4 }}>

                <Box display="flex" justifyContent="space-between"
                     alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <BugReportIcon sx={{
                            fontSize: 35, color: '#d32f2f'
                        }} />
                        <Typography variant="h4" fontWeight="bold">
                            Incident Tickets
                        </Typography>
                    </Box>
                    <Button variant="contained" color="error"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setOpen(true);
                            setError('');
                        }}
                        sx={{ borderRadius: 2, px: 3 }}>
                        Report Incident
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
                          value: tickets.length,
                          color: '#1976d2' },
                        { label: 'Open',
                          value: open_count,
                          color: '#f57c00' },
                        { label: 'In Progress',
                          value: progress_count,
                          color: '#0288d1' },
                        { label: 'Resolved',
                          value: resolved_count,
                          color: '#388e3c' },
                    ].map((s, i) => (
                        <Grid item xs={3} key={i}>
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
                                backgroundColor: '#d32f2f'
                            }}>
                                {['ID', 'Category', 'Description',
                                  'Priority', 'Status',
                                  'Reported By', 'Actions'].map(h => (
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
                            {tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}
                                        align="center"
                                        sx={{ py: 4, color: 'gray' }}>
                                        No tickets yet!
                                        Click "Report Incident".
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((t) => (
                                    <TableRow key={t.id} sx={{
                                        '&:hover': {
                                            backgroundColor: '#F5F5F5'
                                        }
                                    }}>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2"
                                                fontWeight="bold">
                                                {t.category}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2"
                                                sx={{
                                                    maxWidth: 180,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                {t.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={t.priority}
                                                color={priorityColor(
                                                    t.priority)}
                                                size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={t.status}
                                                color={statusColor(
                                                    t.status)}
                                                size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex"
                                                alignItems="center"
                                                gap={1}>
                                                <Avatar sx={{
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: '12px',
                                                    bgcolor: '#1976d2'
                                                }}>
                                                    {t.reportedBy?.name
                                                        ?.charAt(0)}
                                                </Avatar>
                                                <Typography
                                                    variant="caption">
                                                    {t.reportedBy?.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex"
                                                 gap={0.5}
                                                 flexWrap="wrap">
                                                {t.status === 'OPEN' && (
                                                    <Button size="small"
                                                        variant="contained"
                                                        color="info"
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                t.id,
                                                                'IN_PROGRESS'
                                                            )}>
                                                        Start
                                                    </Button>
                                                )}
                                                {t.status ===
                                                    'IN_PROGRESS' && (
                                                    <Button size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                t.id,
                                                                'RESOLVED'
                                                            )}>
                                                        Resolve
                                                    </Button>
                                                )}
                                                {t.status ===
                                                    'RESOLVED' && (
                                                    <Button size="small"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                t.id,
                                                                'CLOSED'
                                                            )}>
                                                        Close
                                                    </Button>
                                                )}
                                                {/* DELETE Button */}
                                                <Tooltip title="Delete Ticket">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            handleDeleteConfirm(
                                                                t.id)}>
                                                        <DeleteIcon
                                                            fontSize="small" />
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

                {/* New Ticket Dialog */}
                <Dialog open={open}
                        onClose={() => setOpen(false)}
                        maxWidth="sm" fullWidth>
                    <DialogTitle sx={{
                        background:
                            'linear-gradient(135deg, #d32f2f, #ef5350)',
                        color: 'white', fontWeight: 'bold'
                    }}>
                        Report New Incident
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        {error && (
                            <Alert severity="error"
                                   sx={{ mb: 2, mt: 1 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField fullWidth select
                            label="Related Resource"
                            margin="normal"
                            value={form.resourceId}
                            onChange={e => setForm({
                                ...form,
                                resourceId: e.target.value
                            })}>
                            <MenuItem value="">None</MenuItem>
                            {resources.map(r => (
                                <MenuItem key={r.id} value={r.id}>
                                    {r.name} — {r.location}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField fullWidth select
                            label="Category *"
                            margin="normal"
                            value={form.category}
                            onChange={e => setForm({
                                ...form,
                                category: e.target.value
                            })}>
                            {categories.map(c => (
                                <MenuItem key={c} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField fullWidth select
                            label="Priority *"
                            margin="normal"
                            value={form.priority}
                            onChange={e => setForm({
                                ...form,
                                priority: e.target.value
                            })}>
                            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                                <MenuItem key={p} value={p}>{p}</MenuItem>
                            ))}
                        </TextField>
                        <TextField fullWidth
                            label="Description *"
                            margin="normal" multiline rows={3}
                            value={form.description}
                            placeholder="Describe the issue..."
                            onChange={e => setForm({
                                ...form,
                                description: e.target.value
                            })} />
                        <TextField fullWidth
                            label="Contact Details *"
                            margin="normal"
                            value={form.contactDetails}
                            placeholder="Phone or email"
                            onChange={e => setForm({
                                ...form,
                                contactDetails: e.target.value
                            })} />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpen(false)}
                                color="inherit">
                            Cancel
                        </Button>
                        <Button variant="contained" color="error"
                                onClick={handleSubmit}
                                sx={{ px: 3 }}>
                            Submit Ticket
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirm Dialog */}
                <Dialog open={deleteOpen}
                        onClose={() => setDeleteOpen(false)}
                        maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ color: '#d32f2f' }}>
                        Delete Ticket?
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete
                            ticket <strong>#{selectedId}</strong>?
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

export default Tickets;