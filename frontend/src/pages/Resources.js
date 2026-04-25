import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Box, Card,
    CardContent, Grid, IconButton, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import FilterListIcon from '@mui/icons-material/FilterList';
import { resourceAPI } from '../services/api';

function Resources() {
    const [resources, setResources] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '', type: 'LAB', capacity: '',
        location: '', status: 'ACTIVE',
        description: '', availableFrom: '08:00:00',
        availableTo: '18:00:00'
    });

    const types = ['LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT'];

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        let result = resources;
        if (filterType !== 'ALL') {
            result = result.filter(r => r.type === filterType);
        }
        if (filterStatus !== 'ALL') {
            result = result.filter(r => r.status === filterStatus);
        }
        setFiltered(result);
    }, [resources, filterType, filterStatus]);

    const fetchResources = async () => {
        try {
            const res = await resourceAPI.getAll();
            setResources(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setForm({
            name: '', type: 'LAB', capacity: '',
            location: '', status: 'ACTIVE',
            description: '', availableFrom: '08:00:00',
            availableTo: '18:00:00'
        });
    };

    const handleCreate = async () => {
        setError('');
        if (!form.name || !form.location || !form.capacity) {
            setError('Please fill all required fields!');
            return;
        }
        try {
            await resourceAPI.create({
                ...form,
                capacity: parseInt(form.capacity)
            });
            setSuccess('Resource created successfully!');
            setOpen(false);
            resetForm();
            fetchResources();
        } catch (err) {
            setError('Failed to create resource.');//error done imalka
        }
    };

    const handleEdit = (resource) => {
        setSelectedResource(resource);
        setForm({
            name: resource.name,
            type: resource.type,
            capacity: resource.capacity,
            location: resource.location,
            status: resource.status,
            description: resource.description || '',
            availableFrom: resource.availableFrom || '08:00:00',
            availableTo: resource.availableTo || '18:00:00'
        });
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        setError('');
        try {
            await resourceAPI.update(selectedResource.id, {
                ...form,
                capacity: parseInt(form.capacity)
            });
            setSuccess('Resource updated successfully!');
            setEditOpen(false);
            fetchResources();
        } catch (err) {
            setError('Failed to update resource.');
        }
    };

    const handleDeleteConfirm = (resource) => {
        setSelectedResource(resource);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        try {
            await resourceAPI.delete(selectedResource.id);
            setSuccess('Resource deleted successfully!');
            setDeleteOpen(false);
            fetchResources();
        } catch (err) {
            setError('Failed to delete resource.');
        }
    };

    const handleToggleStatus = async (resource) => {
        const newStatus = resource.status === 'ACTIVE'
            ? 'OUT_OF_SERVICE' : 'ACTIVE';
        try {
            await resourceAPI.update(resource.id, {
                ...resource,
                status: newStatus
            });
            setSuccess(`Resource marked as ${newStatus}!`);
            fetchResources();
        } catch (err) {
            setError('Failed to update status.');
        }
    };

    const activeCount = resources.filter(
        r => r.status === 'ACTIVE').length;
    const outCount = resources.filter(
        r => r.status === 'OUT_OF_SERVICE').length;

    const ResourceForm = () => (
        <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField fullWidth label="Resource Name *" margin="normal"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField fullWidth select label="Type *" margin="normal"
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value})}>
                        {types.map(t => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth label="Capacity *"
                        type="number" margin="normal"
                        value={form.capacity}
                        onChange={e => setForm({...form, capacity: e.target.value})} />
                </Grid>
            </Grid>
            <TextField fullWidth label="Location *" margin="normal"
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})} />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField fullWidth label="Available From"
                        type="time" margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={form.availableFrom?.substring(0, 5)}
                        onChange={e => setForm({
                            ...form,
                            availableFrom: e.target.value + ':00'
                        })} />
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth label="Available To"
                        type="time" margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={form.availableTo?.substring(0, 5)}
                        onChange={e => setForm({
                            ...form,
                            availableTo: e.target.value + ':00'
                        })} />
                </Grid>
            </Grid>
            <TextField fullWidth select label="Status" margin="normal"
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="OUT_OF_SERVICE">OUT OF SERVICE</MenuItem>
            </TextField>
            <TextField fullWidth label="Description" margin="normal"
                multiline rows={2} value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
        </>
    );

    return (
        <Box sx={{ backgroundColor: '#F5F7FA', minHeight: '100vh', pb: 4 }}>
            <Container sx={{ pt: 4 }}>

                {/* Header */}
                <Box display="flex" justifyContent="space-between"
                     alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <MeetingRoomIcon sx={{ fontSize: 35, color: '#1976d2' }} />
                        <Typography variant="h4" fontWeight="bold">
                            Resources
                        </Typography>
                    </Box>
                    <Button variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setOpen(true);
                            setError('');
                            resetForm();
                        }}
                        sx={{ borderRadius: 2, px: 3 }}>
                        Add Resource
                    </Button>
                </Box>

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}
                           onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {/* Stats */}
                <Grid container spacing={2} mb={3}>
                    {[
                        { label: 'Total', value: resources.length, color: '#1976d2' },
                        { label: 'Active', value: activeCount, color: '#388e3c' },
                        { label: 'Out of Service', value: outCount, color: '#d32f2f' },
                    ].map((s, i) => (
                        <Grid item xs={4} key={i}>
                            <Card elevation={2}
                                  sx={{ borderRadius: 2, textAlign: 'center' }}>
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

                {/* Filters */}
                <Box display="flex" gap={2} mb={2} alignItems="center">
                    <FilterListIcon color="action" />
                    <TextField select size="small" label="Filter by Type"
                        value={filterType} sx={{ minWidth: 160 }}
                        onChange={e => setFilterType(e.target.value)}>
                        <MenuItem value="ALL">All Types</MenuItem>
                        {types.map(t => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </TextField>
                    <TextField select size="small" label="Filter by Status"
                        value={filterStatus} sx={{ minWidth: 160 }}
                        onChange={e => setFilterStatus(e.target.value)}>
                        <MenuItem value="ALL">All Status</MenuItem>
                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                        <MenuItem value="OUT_OF_SERVICE">OUT OF SERVICE</MenuItem>
                    </TextField>
                    <Typography variant="body2" color="textSecondary">
                        Showing {filtered.length} of {resources.length} resources
                    </Typography>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} elevation={2}
                                sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                {['Name', 'Type', 'Capacity', 'Location',
                                  'Available Hours', 'Status', 'Actions'].map(h => (
                                    <TableCell key={h}
                                        sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center"
                                               sx={{ py: 4, color: 'gray' }}>
                                        No resources found!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((r) => (
                                    <TableRow key={r.id}
                                        sx={{ '&:hover': { backgroundColor: '#F5F5F5' } }}>
                                        <TableCell>
                                            <Typography variant="body2"
                                                        fontWeight="bold">
                                                {r.name}
                                            </Typography>
                                            <Typography variant="caption"
                                                        color="textSecondary">
                                                {r.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={r.type}
                                                variant="outlined"
                                                size="small"
                                                color="primary" />
                                        </TableCell>
                                        <TableCell>{r.capacity}</TableCell>
                                        <TableCell>{r.location}</TableCell>
                                        <TableCell>
                                            {r.availableFrom?.substring(0, 5)} -
                                            {r.availableTo?.substring(0, 5)}
                                        </TableCell>
                                        <TableCell>
                                            {/* Status Toggle Button */}
                                            <Chip
                                                label={r.status === 'ACTIVE'
                                                    ? 'ACTIVE' : 'OUT OF SERVICE'}
                                                color={r.status === 'ACTIVE'
                                                    ? 'success' : 'error'}
                                                size="small"
                                                onClick={() => handleToggleStatus(r)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={0.5}>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small"
                                                        color="primary"
                                                        onClick={() => handleEdit(r)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            handleDeleteConfirm(r)}>
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

                {/* Add Resource Dialog */}
                <Dialog open={open} onClose={() => setOpen(false)}
                        maxWidth="sm" fullWidth>
                    <DialogTitle sx={{
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        color: 'white', fontWeight: 'bold'
                    }}>
                        Add New Resource
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <ResourceForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpen(false)}
                                color="inherit">Cancel</Button>
                        <Button variant="contained"
                                onClick={handleCreate}
                                sx={{ px: 3 }}>
                            Add Resource
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Resource Dialog */}
                <Dialog open={editOpen}
                        onClose={() => setEditOpen(false)}
                        maxWidth="sm" fullWidth>
                    <DialogTitle sx={{
                        background: 'linear-gradient(135deg, #f57c00, #ffb74d)',
                        color: 'white', fontWeight: 'bold'
                    }}>
                        Edit Resource
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <ResourceForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setEditOpen(false)}
                                color="inherit">Cancel</Button>
                        <Button variant="contained" color="warning"
                                onClick={handleUpdate}
                                sx={{ px: 3 }}>
                            Update Resource
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirm Dialog */}
                <Dialog open={deleteOpen}
                        onClose={() => setDeleteOpen(false)}
                        maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ color: '#d32f2f' }}>
                        Delete Resource?
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete
                            <strong> {selectedResource?.name}</strong>?
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setDeleteOpen(false)}
                                color="inherit">Cancel</Button>
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

export default Resources;