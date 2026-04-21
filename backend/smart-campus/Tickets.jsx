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