import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Card, CardContent, Typography, IconButton,
  Snackbar, Alert, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function CostCentreManagement() {
  const [companies, setCompanies] = useState([]);
  const [costCentres, setCostCentres] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    company: '',
    name: '',
    transaction_direction: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    cost_centre_id: '',
    company: '',
    name: '',
    transaction_direction: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchCostCentres = async () => {
    try {
      const res = await API.get('cost-centres/');
      setCostCentres(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching cost centres', severity: 'error' });
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await API.get('companies/');
      setCompanies(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching companies', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchCostCentres();
    fetchCompanies();
  }, []);

  const validateForm = (data, isEdit = false) => {
    const errors = {};
    if (!isEdit && !data.company) errors.company = 'Company is required';
    if (!data.name) errors.name = 'Name is required';
    if (!data.transaction_direction) errors.transaction_direction = 'Transaction direction is required';
    return errors;
  };

  const handleAddCostCentre = async () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      await API.post('cost-centres/', form);
      setSnackbar({ open: true, message: 'Cost Centre added successfully!', severity: 'success' });
      fetchCostCentres();
      setOpen(false);
      setForm({ company: '', name: '', transaction_direction: '', notes: '' });
      setFormErrors({});
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add cost centre', severity: 'error' });
    }
  };

  const handleRealTimeValidation = (field, value, setForm, form, setErrors) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    const errors = validateForm(updatedForm);
    setErrors(errors);
  };

  const openEditModal = (costCentre) => {
    setEditForm({
      cost_centre_id: costCentre.cost_centre_id,
      company: costCentre.company,
      name: costCentre.name,
      transaction_direction: costCentre.transaction_direction,
      notes: costCentre.notes,
    });
    setEditFormErrors({});
    setEditOpen(true);
  };

  const handleEditCostCentre = async () => {
    const errors = validateForm(editForm, true);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    try {
      await API.put(`cost-centres/${editForm.cost_centre_id}/`, editForm);
      setSnackbar({ open: true, message: 'Cost Centre updated successfully!', severity: 'success' });
      fetchCostCentres();
      setEditOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update cost centre', severity: 'error' });
    }
  };

  const deleteCostCentre = async (id) => {
    try {
      await API.delete(`cost-centres/${id}/`);
      setSnackbar({ open: true, message: 'Cost Centre deleted successfully!', severity: 'success' });
      fetchCostCentres();
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  return (
    <div className="p-[95px]">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" fontWeight="bold">Cost Centre Management</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Add Cost Centre</Button>
      </div>

      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Direction</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costCentres.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => (
                  <TableRow key={c.cost_centre_id} hover>
                    <TableCell>{c.cost_centre_id}</TableCell>
                    <TableCell>{c.company_name}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.transaction_direction}</TableCell>
                    <TableCell>{c.notes}</TableCell>
                    <TableCell>{c.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete" arrow>
                        <IconButton color="error" onClick={() => deleteCostCentre(c.cost_centre_id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit" arrow>
                        <IconButton color="primary" onClick={() => openEditModal(c)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={costCentres.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            showFirstButton
            showLastButton
          />
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Cost Centre</DialogTitle>
        <DialogContent dividers>
          <TextField
            select fullWidth margin="dense" label="Company"
            value={form.company}
            onChange={(e) => handleRealTimeValidation('company', e.target.value, setForm, form, setFormErrors)}
            error={!!formErrors.company}
            helperText={formErrors.company}
          >
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth margin="dense" label="Name"
            value={form.name}
            onChange={(e) => handleRealTimeValidation('name', e.target.value, setForm, form, setFormErrors)}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />

          <TextField
            select fullWidth margin="dense" label="Transaction Direction"
            value={form.transaction_direction}
            onChange={(e) => handleRealTimeValidation('transaction_direction', e.target.value, setForm, form, setFormErrors)}
            error={!!formErrors.transaction_direction}
            helperText={formErrors.transaction_direction}
          >
            <MenuItem value="Credit">Credit</MenuItem>
            <MenuItem value="Debit">Debit</MenuItem>
            <MenuItem value="Both">Both</MenuItem>
          </TextField>

          <TextField
            fullWidth margin="dense" label="Notes" multiline
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCostCentre} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Cost Centre</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth margin="dense" label="Name"
            value={editForm.name}
            onChange={(e) => handleRealTimeValidation('name', e.target.value, setEditForm, editForm, setEditFormErrors)}
            error={!!editFormErrors.name}
            helperText={editFormErrors.name}
          />

          <TextField
            select fullWidth margin="dense" label="Transaction Direction"
            value={editForm.transaction_direction}
            onChange={(e) => handleRealTimeValidation('transaction_direction', e.target.value, setEditForm, editForm, setEditFormErrors)}
            error={!!editFormErrors.transaction_direction}
            helperText={editFormErrors.transaction_direction}
          >
            <MenuItem value="Credit">Credit</MenuItem>
            <MenuItem value="Debit">Debit</MenuItem>
            <MenuItem value="Both">Both</MenuItem>
          </TextField>

          <TextField
            fullWidth margin="dense" label="Notes" multiline
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditCostCentre} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
