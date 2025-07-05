import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Card, CardContent, Typography, IconButton,
  Snackbar, Alert, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, RadioGroup, FormControlLabel, Radio, Switch
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function TransactionTypeManagement() {
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [costCentres, setCostCentres] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [form, setForm] = useState({
    company: '',
    cost_centre: '',
    name: '',
    direction: '',
    gst_applicable: false,
    status: 'Active',
    remarks: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTransactionTypes();
    fetchCompanies();
    fetchCostCentres();
  }, []);

  const fetchTransactionTypes = async () => {
    try {
      const res = await API.get('transaction-types/');
      setTransactionTypes(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching transaction types', severity: 'error' });
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

  const fetchCostCentres = async () => {
    try {
      const res = await API.get('cost-centres/');
      setCostCentres(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error fetching cost centres', severity: 'error' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.company) newErrors.company = 'Company is required';
    if (!form.cost_centre) newErrors.cost_centre = 'Cost Centre is required';
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.direction) newErrors.direction = 'Direction is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmitTransactionType = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        await API.put(`transaction-types/${editId}/`, form);
        setSnackbar({ open: true, message: 'Transaction Type updated successfully', severity: 'success' });
      } else {
        await API.post('transaction-types/', form);
        setSnackbar({ open: true, message: 'Transaction Type added successfully', severity: 'success' });
      }
      fetchTransactionTypes();
      setOpen(false);
      setForm({ company: '', cost_centre: '', name: '', direction: '', gst_applicable: false, status: 'Active', remarks: '' });
      setErrors({});
      setIsEditMode(false);
      setEditId(null);
    } catch (err) {
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    }
  };

  const deleteTransactionType = async (id) => {
    try {
      await API.delete(`transaction-types/${id}/`);
      setSnackbar({ open: true, message: 'Transaction Type deleted (soft)', severity: 'success' });
      fetchTransactionTypes();
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const openEditDialog = (transaction) => {
    setForm({
      company: transaction.company,
      cost_centre: transaction.cost_centre,
      name: transaction.name,
      direction: transaction.direction,
      gst_applicable: transaction.gst_applicable,
      status: transaction.status,
      remarks: transaction.remarks || '',
    });
    setEditId(transaction.transaction_type_id);
    setIsEditMode(true);
    setOpen(true);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  return (
    <div className="p-[95px]">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" fontWeight="bold">Transaction Type Management</Typography>
        <Button variant="contained" color="primary" onClick={() => { setOpen(true); setIsEditMode(false); setForm({ company: '', cost_centre: '', name: '', direction: '', gst_applicable: false, status: 'Active', remarks: '' }); }}>Add Transaction Type</Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? 'Edit Transaction Type' : 'Add Transaction Type'}</DialogTitle>
        <DialogContent dividers>
          <TextField select margin="dense" label="Company" fullWidth required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} error={!!errors.company} helperText={errors.company}>
            {companies.map((c) => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
          </TextField>

          <TextField select margin="dense" label="Cost Centre" fullWidth required value={form.cost_centre} onChange={(e) => setForm({ ...form, cost_centre: e.target.value })} error={!!errors.cost_centre} helperText={errors.cost_centre}>
            {costCentres.map((cc) => (<MenuItem key={cc.cost_centre_id} value={cc.cost_centre_id}>{cc.name}</MenuItem>))}
          </TextField>

          <TextField margin="dense" label="Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} helperText={errors.name} />

          <Typography sx={{ mt: 2 }}>Direction</Typography>
          <RadioGroup row value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
            <FormControlLabel value="Credit" control={<Radio />} label="Credit" />
            <FormControlLabel value="Debit" control={<Radio />} label="Debit" />
          </RadioGroup>
          {errors.direction && <Typography color="error" variant="caption">{errors.direction}</Typography>}

          <Typography sx={{ mt: 2 }}>GST Applicable</Typography>
          <Switch checked={form.gst_applicable} onChange={(e) => setForm({ ...form, gst_applicable: e.target.checked })} />

          <TextField select margin="dense" label="Status" fullWidth value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>

          <TextField margin="dense" label="Remarks" fullWidth multiline value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitTransactionType} variant="contained">{isEditMode ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Cost Centre</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Direction</strong></TableCell>
                  <TableCell><strong>GST</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Remarks</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactionTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((t) => (
                  <TableRow key={t.transaction_type_id}>
                    <TableCell>{t.transaction_type_id}</TableCell>
                    <TableCell>{t.company_name}</TableCell>
                    <TableCell>{t.cost_centre_name}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.direction}</TableCell>
                    <TableCell>{t.gst_applicable ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell>{t.remarks}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit" arrow><IconButton color="primary" onClick={() => openEditDialog(t)}><Edit /></IconButton></Tooltip>
                      <Tooltip title="Delete" arrow><IconButton color="error" onClick={() => deleteTransactionType(t.transaction_type_id)}><Delete /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {transactionTypes.length === 0 && (<TableRow><TableCell colSpan={9} align="center">No data found</TableCell></TableRow>)}
              </TableBody>
            </Table>
            <TablePagination component="div" count={transactionTypes.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]} />
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
