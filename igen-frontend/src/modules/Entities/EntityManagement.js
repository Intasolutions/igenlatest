import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Card, CardContent, IconButton, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function EntityManagement() {
  const [entities, setEntities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    company: '',
    name: '',
    entity_type: 'Property',
    linked_property: '',
    linked_project: '',
    status: 'Active',
    remarks: '',
  });

  const fetchEntities = async () => {
    try {
      const res = await API.get('entities/');
      setEntities(res.data);
    } catch (err) {
      console.error('Fetch entities error:', err.response?.data);
      setSnackbar({ open: true, message: 'Error fetching entities', severity: 'error' });
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await API.get('companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error('Fetch companies error:', err.response?.data);
      setSnackbar({ open: true, message: 'Error fetching companies', severity: 'error' });
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await API.get('properties/');
      setProperties(res.data);
    } catch (err) {
      console.error('Fetch properties error:', err.response?.data);
      setSnackbar({ open: true, message: 'Error fetching properties', severity: 'error' });
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await API.get('projects/');
      setProjects(res.data);
    } catch (err) {
      console.error('Fetch projects error:', err.response?.data);
      setSnackbar({ open: true, message: 'Error fetching projects', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchEntities();
    fetchCompanies();
    fetchProperties();
    fetchProjects();
  }, []);

  const resetForm = () => setForm({
    company: '', name: '', entity_type: 'Property',
    linked_property: '', linked_project: '',
    status: 'Active', remarks: ''
  });

  const handleSaveEntity = async () => {
    const payload = {
      company: form.company,
      name: form.name,
      entity_type: form.entity_type,
      linked_property: form.entity_type === 'Property' ? form.linked_property || null : null,
      linked_project: form.entity_type === 'Project' ? form.linked_project || null : null,
      status: form.status,
      remarks: form.remarks,
    };

    try {
      if (isEditMode) {
        await API.put(`entities/${editId}/`, payload);
        setSnackbar({ open: true, message: 'Entity updated successfully', severity: 'success' });
      } else {
        await API.post('entities/', payload);
        setSnackbar({ open: true, message: 'Entity added successfully', severity: 'success' });
      }
      fetchEntities();
      setOpen(false);
      resetForm();
      setIsEditMode(false);
    } catch (err) {
      console.error('Save entity error:', err.response?.data);
      setSnackbar({ open: true, message: 'Failed to save entity', severity: 'error' });
    }
  };

  const deactivateEntity = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this entity?')) return;
    try {
      await API.patch(`entities/${id}/`, { status: 'Inactive' });
      setSnackbar({ open: true, message: 'Entity deactivated successfully', severity: 'success' });
      fetchEntities();
    } catch (err) {
      console.error('Deactivate entity error:', err.response?.data);
      setSnackbar({ open: true, message: 'Failed to deactivate entity', severity: 'error' });
    }
  };

  const openEditDialog = (entity) => {
    setForm({
      company: entity.company,
      name: entity.name,
      entity_type: entity.entity_type,
      linked_property: entity.linked_property || '',
      linked_project: entity.linked_project || '',
      status: entity.status,
      remarks: entity.remarks,
    });
    setEditId(entity.entity_id);
    setIsEditMode(true);
    setOpen(true);
  };

  return (
    <div className="p-[95px]">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" fontWeight="bold">Entity Management</Typography>
        <Button variant="contained" color="primary" onClick={() => { resetForm(); setOpen(true); setIsEditMode(false); }}>ADD ENTITY</Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? 'Edit Entity' : 'Add New Entity'}</DialogTitle>
        <DialogContent>
          <TextField select margin="dense" label="Company *" fullWidth required
            value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
          >
            {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>

          <TextField margin="dense" label="Name *" fullWidth required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="flex space-x-4 mt-3 mb-2">
            <Typography>Entity Type</Typography>
            {['Property', 'Project', 'Internal'].map(type => (
              <label key={type}>
                <input type="radio" checked={form.entity_type === type} onChange={() => setForm({ ...form, entity_type: type })} />
                {type}
              </label>
            ))}
          </div>

          {form.entity_type === 'Property' && (
            <TextField select margin="dense" label="Linked Property *" fullWidth required
              value={form.linked_property} onChange={(e) => setForm({ ...form, linked_property: e.target.value })}
            >
              {properties.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          )}

          {form.entity_type === 'Project' && (
            <TextField select margin="dense" label="Linked Project *" fullWidth required
              value={form.linked_project} onChange={(e) => setForm({ ...form, linked_project: e.target.value })}
            >
              {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          )}

          <TextField select margin="dense" label="Status" fullWidth value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>

          <TextField margin="dense" label="Remarks" fullWidth multiline
            value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>CANCEL</Button>
          <Button onClick={handleSaveEntity} variant="contained">{isEditMode ? 'UPDATE' : 'ADD'}</Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entities.map((e, idx) => (
                  <TableRow key={e.entity_id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{e.company_name}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.entity_type}</TableCell>
                    <TableCell>{e.status}</TableCell>
                    <TableCell>{e.remarks || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit" arrow>
                        <IconButton color="primary" onClick={() => openEditDialog(e)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate" arrow>
                        <IconButton color="error" onClick={() => deactivateEntity(e.entity_id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {entities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No entities found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
