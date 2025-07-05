import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Table, TableBody, TableCell, Typography, TableContainer,
  TableHead, TableRow, Paper, Tooltip, IconButton, Card, CardContent, Snackbar, Alert, TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function TransactionTypeManagement() {
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);


  const [form, setForm] = useState({
    company: '',
    name: '',
    type: 'INCOME',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTransactionTypes();
    fetchCompanies();
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

  const validateField = (field, value) => {
    let error = '';
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else if (field === 'name' && !/^[A-Za-z][A-Za-z0-9\s]*$/.test(value)) {
      error = 'Name must start with a letter and contain only letters, numbers, and spaces';
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateForm = () => {
    const fields = ['company', 'name', 'type'];
    let valid = true;
    const newErrors = {};
    fields.forEach(field => {
      const value = form[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        valid = false;
      } else if (field === 'name' && !/^[A-Za-z][A-Za-z0-9\s]*$/.test(value)) {
        newErrors[field] = 'Name must start with a letter and contain only letters, numbers, and spaces';
        valid = false;
      }
    });
    setErrors(newErrors);
    return valid;
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
      setForm({ company: '', name: '', type: 'INCOME', description: '' });
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
      setSnackbar({ open: true, message: 'Transaction Type deleted', severity: 'success' });
      fetchTransactionTypes();
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const openEditDialog = (transaction) => {
    setForm({
      company: transaction.company,
      name: transaction.name,
      type: transaction.type,
      description: transaction.description || '',
    });
    setEditId(transaction.id);
    setIsEditMode(true);
    setOpen(true);
  };
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};

  return (
    <div className="p-[95px]">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" fontWeight="bold">Transaction Type Management</Typography>
        <Button variant="contained" color="primary" onClick={() => { setOpen(true); setIsEditMode(false); setForm({ company: '', name: '', type: 'INCOME', description: '' }); }}>Add Transaction Type</Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? 'Edit Transaction Type' : 'Add Transaction Type'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Company"
            fullWidth
            required
            value={form.company}
            onChange={(e) => {
              setForm({ ...form, company: e.target.value });
              validateField('company', e.target.value);
            }}
            error={!!errors.company}
            helperText={errors.company}
          >
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Name"
            fullWidth
            required
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              validateField('name', e.target.value);
            }}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            select
            margin="dense"
            label="Type"
            fullWidth
            required
            value={form.type}
            onChange={(e) => {
              setForm({ ...form, type: e.target.value });
              validateField('type', e.target.value);
            }}
            error={!!errors.type}
            helperText={errors.type}
          >
            <MenuItem value="INCOME">Income</MenuItem>
            <MenuItem value="EXPENSE">Expense</MenuItem>
            <MenuItem value="ASSET">Asset</MenuItem>
            <MenuItem value="LIABILITY">Liability</MenuItem>
          </TextField>

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitTransactionType} variant="contained">{isEditMode ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell><strong>#</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Active</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
             {transactionTypes
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((t, index) => (
    <TableRow key={t.id}>

                   <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                    <TableCell>{t.company_name}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.type}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit" arrow>
                        <IconButton color="primary" onClick={() => openEditDialog(t)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton color="error" onClick={() => deleteTransactionType(t.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {transactionTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No data found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
  component="div"
  count={transactionTypes.length}
  page={page}
  onPageChange={handleChangePage}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
/>

          </TableContainer>
        </CardContent>
      </Card>

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
