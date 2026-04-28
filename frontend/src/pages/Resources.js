import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Box, Card,
    CardContent, Grid, IconButton, Tooltip, Alert, Fade, Avatar
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
            setError('Failed to create resource.');
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
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                    {error}
                </Alert>
            )}
            <TextField 
                fullWidth 
                label="Resource Name *" 
                margin="normal"
                variant="outlined"
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                    }
                }}
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} 
            />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField 
                        fullWidth 
                        select 
                        label="Type *" 
                        margin="normal"
                        variant="outlined"
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1
                            }
                        }}
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value})}>
                        {types.map(t => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField 
                        fullWidth 
                        label="Capacity *"
                        type="number" 
                        margin="normal"
                        variant="outlined"
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1
                            }
                        }}
                        value={form.capacity}
                        onChange={e => setForm({...form, capacity: e.target.value})} 
                    />
                </Grid>
            </Grid>
            <TextField 
                fullWidth 
                label="Location *" 
                margin="normal"
                variant="outlined"
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                    }
                }}
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})} 
            />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField 
                        fullWidth 
                        label="Available From"
                        type="time" 
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1
                            }
                        }}
                        value={form.availableFrom?.substring(0, 5)}
                        onChange={e => setForm({
                            ...form,
                            availableFrom: e.target.value + ':00'
                        })} 
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField 
                        fullWidth 
                        label="Available To"
                        type="time" 
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1
                            }
                        }}
                        value={form.availableTo?.substring(0, 5)}
                        onChange={e => setForm({
                            ...form,
                            availableTo: e.target.value + ':00'
                        })} 
                    />
                </Grid>
            </Grid>
            <TextField 
                fullWidth 
                select 
                label="Status" 
                margin="normal"
                variant="outlined"
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                    }
                }}
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}>
                <MenuItem value="ACTIVE">✓ ACTIVE</MenuItem>
                <MenuItem value="OUT_OF_SERVICE">⚠ OUT OF SERVICE</MenuItem>
            </TextField>
            <TextField 
                fullWidth 
                label="Description" 
                margin="normal"
                variant="outlined"
                multiline 
                rows={3} 
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                    }
                }}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} 
            />
        </>
    );

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
            minHeight: '100vh', 
            pb: 4 
        }}>
            <Container maxWidth="xl" sx={{ pt: 4 }}>

                {/* Header with Avatar */}
                <Fade in={true} timeout={1000}>
                    <Box display="flex" justifyContent="space-between"
                         alignItems="center" mb={4}>
                        <Box display="flex" alignItems="center" gap={3}>
                            <Avatar sx={{ 
                                bgcolor: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                width: 64, height: 64,
                                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
                            }}>
                                <MeetingRoomIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h3" fontWeight="bold" color="primary">
                                    🏢 Resources Management
                                </Typography>
                                <Typography variant="h6" color="textSecondary">
                                    Manage campus resources and facilities
                                </Typography>
                            </Box>
                        </Box>
                        <Button variant="contained
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setOpen(true);
                                setError('');
                                resetForm();
                            }}
                            sx={{ 
                                borderRadius: 3, 
                                px: 4, 
                                py: 1.5,
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                            }}>
                            Add Resource
                        </Button>
                    </Box>
                </Fade>

                {/* Alerts */}
                {success && (
                    <Fade in={true} timeout={500}>
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}
                               onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    </Fade>
                )}
                {error && (
                    <Fade in={true} timeout={500}>
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}
                               onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                {/* Stats Cards */}
                <Grid container spacing={2} mb={3}>
                    {[
                        { label: 'Total', value: resources.length, color: '#1976d2' },
                        { label: 'Active', value: activeCount, color: '#388e3c' },
                        { label: 'Out of Service', value: outCount, color: '#d32f2f' },
                    ].map((s, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Card elevation={2} sx={{
                                borderRadius: 2,
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)'
                                }
                            }}>
                                <CardContent sx={{ py: 2.5 }}>
                                    <Typography variant="h4"
                                        fontWeight="bold"
                                        color={s.color}
                                        sx={{ mb: 1 }}>
                                        {s.value}
                                    </Typography>
                                    <Typography variant="body2"
                                        color="textSecondary"
                                        sx={{ fontSize: '0.95rem' }}>
                                        {s.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Filters */}
                <Fade in={true} timeout={800}>
                    <Box display="flex" gap={2} mb={3} alignItems="center"
                         sx={{ 
                             flexWrap: 'wrap',
                             backgroundColor: 'white',
                             p: 2.5,
                             borderRadius: 2,
                             boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                             alignContent: 'center'
                         }}>
                        <FilterListIcon color="primary" sx={{ fontSize: 24 }} />
                        <TextField select size="small" label="Filter by Type"
                            value={filterType} sx={{ minWidth: 180 }}
                            onChange={e => setFilterType(e.target.value)}>
                            <MenuItem value="ALL">All Types</MenuItem>
                            {types.map(t => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select size="small" label="Filter by Status"
                            value={filterStatus} sx={{ minWidth: 180 }}
                            onChange={e => setFilterStatus(e.target.value)}>
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                            <MenuItem value="OUT_OF_SERVICE">OUT OF SERVICE</MenuItem>
                        </TextField>
                        <Box sx={{ ml: 'auto' }}>
                            <Typography variant="body2" color="textSecondary">
                                Showing <strong>{filtered.length}</strong> of <strong>{resources.length}</strong> resources
                            </Typography>
                        </Box>
                    </Box>
                </Fade>

                {/* Resources Table */}
                <Fade in={true} timeout={1000}>
                    <TableContainer component={Paper} elevation={2}
                                    sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ 
                                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                                '& th': { fontWeight: 'bold' }
                            }}>
                                {['Name', 'Type', 'Capacity', 'Location',
                                  'Available Hours', 'Status', 'Actions'].map(h => (
                                    <TableCell key={h}
                                        sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center"
                                               sx={{ py: 5, color: '#999' }}>
                                        <MeetingRoomIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                                        <Typography>No resources found!</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((r, idx) => (
                                    <TableRow key={r.id}
                                        sx={{ 
                                            '&:hover': { 
                                                backgroundColor: '#F5F5F5',
                                                boxShadow: 'inset 4px 0 0 #1976d2'
                                            },
                                            transition: 'all 0.2s ease',
                                            borderLeft: idx === 0 ? 'none' : '1px solid #e0e0e0'
                                        }}>
                                        <TableCell>
                                            <Typography variant="body2"
                                                        fontWeight="bold"
                                                        sx={{ color: '#1976d2' }}>
                                                {r.name}
                                            </Typography>
                                            <Typography variant="caption"
                                                        color="textSecondary"
                                                        sx={{ fontSize: '0.8rem', display: 'block', mt: 0.3 }}>
                                                {r.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={r.type}
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                sx={{ fontWeight: 'bold' }} />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            {r.capacity}
                                        </TableCell>
                                        <TableCell>{r.location}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {r.availableFrom?.substring(0, 5)} - {r.availableTo?.substring(0, 5)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={r.status === 'ACTIVE'
                                                    ? '✓ ACTIVE' : '⚠ OUT OF SERVICE'}
                                                color={r.status === 'ACTIVE'
                                                    ? 'success' : 'error'}
                                                size="small"
                                                onClick={() => handleToggleStatus(r)}
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={0.5}>
                                                <Tooltip title="Edit Resource" arrow>
                                                    <IconButton size="small"
                                                        color="primary"
                                                        onClick={() => handleEdit(r)}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Resource" arrow>
                                                    <IconButton size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            handleDeleteConfirm(r)}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}>
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
                </Fade>

                {/* Add Resource Dialog */}
                <Dialog open={open} onClose={() => setOpen(false)}
                        maxWidth="sm" fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                            }
                        }}>
                    <DialogTitle sx={{
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        ➕ Add New Resource
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2.5 }}>
                        <ResourceForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button onClick={() => setOpen(false)}
                                color="inherit"
                                sx={{ borderRadius: 1 }}>
                            Cancel
                        </Button>
                        <Button variant="contained"
                                onClick={handleCreate}
                                sx={{ 
                                    px: 3,
                                    borderRadius: 1,
                                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1565c0, #1976d2)'
                                    }
                                }}>
                            Add Resource
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Resource Dialog */}
                <Dialog open={editOpen}
                        onClose={() => setEditOpen(false)}
                        maxWidth="sm" fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                            }
                        }}>
                    <DialogTitle sx={{
                        background: 'linear-gradient(135deg, #f57c00, #ffb74d)',
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        ✏️ Edit Resource
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2.5 }}>
                        <ResourceForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button onClick={() => setEditOpen(false)}
                                color="inherit"
                                sx={{ borderRadius: 1 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" 
                                onClick={handleUpdate}
                                sx={{ 
                                    px: 3,
                                    borderRadius: 1,
                                    background: 'linear-gradient(135deg, #f57c00, #ffb74d)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #e65100, #f57c00)'
                                    }
                                }}>
                            Update Resource
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirm Dialog */}
                <Dialog open={deleteOpen}
                        onClose={() => setDeleteOpen(false)}
                        maxWidth="xs" fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                            }
                        }}>
                    <DialogTitle sx={{ 
                        color: '#d32f2f',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                    }}>
                        ⚠️ Delete Resource?
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Typography>
                            Are you sure you want to delete <strong>{selectedResource?.name}</strong>?
                            <br/>
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button onClick={() => setDeleteOpen(false)}
                                color="inherit"
                                sx={{ borderRadius: 1 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="error"
                                onClick={handleDelete}
                                sx={{ 
                                    px: 3,
                                    borderRadius: 1,
                                    background: 'linear-gradient(135deg, #d32f2f, #f44336)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #b71c1c, #d32f2f)'
                                    }
                                }}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Box>
    );
}

export default Resources;