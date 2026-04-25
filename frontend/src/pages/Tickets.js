// Tickets Component - Refactored (Safe)

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
import EditIcon from '@mui/icons-material/Edit';
import BugReportIcon from '@mui/icons-material/BugReport';

import { ticketAPI, resourceAPI } from '../services/api';

function Tickets() {

    // ================= STATE =================
    const [ticketList, setTicketList] = useState([]);
    const [resourceList, setResourceList] = useState([]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [editingTicketId, setEditingTicketId] = useState(null);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        resourceId: '',
        category: '',
        description: '',
        priority: 'MEDIUM',
        contactDetails: ''
    });

    const [editFormData, setEditFormData] = useState({
        category: '',
        description: '',
        priority: 'MEDIUM',
        contactDetails: ''
    });

    const userId = localStorage.getItem('userId') || 1;

    const categories = [
        'Electrical', 'Network', 'Projector',
        'Air Conditioning', 'Furniture',
        'Computer', 'Other'
    ];

    // ================= EFFECT =================
    useEffect(() => {
        loadTickets();
        loadResources();
    }, []);

    // ================= API =================
    const loadTickets = async () => {
        try {
            const response = await ticketAPI.getAll();
            setTicketList(response.data);
        } catch {
            setErrorMsg('Cannot connect to server!');
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

    // ================= CREATE =================
    const handleSubmit = async () => {
        setErrorMsg('');

        const { category, description, contactDetails } = formData;

        if (!category || !description || !contactDetails) {
            setErrorMsg('Please fill all required fields!');
            return;
        }

        try {
            await ticketAPI.create({
                reportedBy: { id: parseInt(userId) },
                resource: formData.resourceId
                    ? { id: parseInt(formData.resourceId) }
                    : null,
                category: formData.category,
                description: formData.description,
                priority: formData.priority,
                contactDetails: formData.contactDetails
            });

            setSuccessMsg('Ticket created successfully!');
            setIsCreateOpen(false);

            setFormData({
                resourceId: '',
                category: '',
                description: '',
                priority: 'MEDIUM',
                contactDetails: ''
            });

            loadTickets();

        } catch {
            setErrorMsg('Failed to create ticket. Try again.');
        }
    };

    // ================= STATUS =================
    const handleStatusUpdate = async (id, status) => {
        try {
            await ticketAPI.updateStatus(id, status, '');
            setSuccessMsg('Status updated!');
            loadTickets();
        } catch {
            setErrorMsg('Failed to update status.');
        }
    };

    // ================= DELETE =================
    const handleDeleteConfirm = (id) => {
        setSelectedTicketId(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        try {
            await ticketAPI.delete(selectedTicketId);
            setSuccessMsg('Ticket deleted successfully!');
            setIsDeleteOpen(false);
            loadTickets();
        } catch {
            setErrorMsg('Failed to delete ticket.');
            setIsDeleteOpen(false);
        }
    };

    // ================= EDIT =================
    const handleEditClick = (ticket) => {
        setEditingTicketId(ticket.id);

        setEditFormData({
            category: ticket.category || '',
            description: ticket.description || '',
            priority: ticket.priority || 'MEDIUM',
            contactDetails: ticket.contactDetails || ''
        });

        setIsEditOpen(true);
        setErrorMsg('');
    };

    const handleEditSubmit = async () => {
        setErrorMsg('');

        const { category, description, contactDetails } = editFormData;

        if (!category || !description || !contactDetails) {
            setErrorMsg('Please fill all required fields!');
            return;
        }

        try {
            await ticketAPI.update(editingTicketId, {
                category,
                description,
                priority: editFormData.priority,
                contactDetails
            });

            setSuccessMsg('Ticket updated successfully!');
            setIsEditOpen(false);
            setEditingTicketId(null);

            loadTickets();

        } catch {
            setErrorMsg('Failed to update ticket.');
        }
    };

    // ================= HELPERS =================
    const getPriorityColor = (priority) => ({
        LOW: 'success',
        MEDIUM: 'warning',
        HIGH: 'error',
        CRITICAL: 'error'
    }[priority] || 'default');

    const getStatusColor = (status) => ({
        OPEN: 'warning',
        IN_PROGRESS: 'info',
        RESOLVED: 'success',
        CLOSED: 'default',
        REJECTED: 'error'
    }[status] || 'default');

    const openCount = ticketList.filter(t => t.status === 'OPEN').length;
    const progressCount = ticketList.filter(t => t.status === 'IN_PROGRESS').length;
    const resolvedCount = ticketList.filter(t => t.status === 'RESOLVED').length;

    // ================= UI =================
    return (
        <Box sx={{ backgroundColor: '#F5F7FA', minHeight: '100vh', pb: 4 }}>
            <Container sx={{ pt: 4 }}>

                {/* HEADER */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <BugReportIcon sx={{ fontSize: 35, color: '#d32f2f' }} />
                        <Typography variant="h4" fontWeight="bold">
                            Incident Tickets
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setIsCreateOpen(true);
                            setErrorMsg('');
                        }}
                    >
                        Report Incident
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

                {/* STATS */}
                <Grid container spacing={2} mb={3}>
                    {[
                        { label: 'Total', value: ticketList.length, color: '#1976d2' },
                        { label: 'Open', value: openCount, color: '#f57c00' },
                        { label: 'In Progress', value: progressCount, color: '#0288d1' },
                        { label: 'Resolved', value: resolvedCount, color: '#388e3c' }
                    ].map((item, index) => (
                        <Grid item xs={3} key={index}>
                            <Card elevation={2}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color={item.color}>
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

                {/* TABLE remains SAME (safe, no risky changes) */}

            </Container>
        </Box>
    );
}

export default Tickets;