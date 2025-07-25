import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, MenuItem, Snackbar, Alert, Typography, Grid, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import API from '../../api/axios';

const vendorTypes = ['Contractor', 'Supplier', 'Consultant'];

const defaultForm = {
  vendor_name: '',
  vendor_type: '',
  pan_number: '',
  gst_number: '',
  contact_person: '',
  phone_number: '',
  email: '',
  bank_name: '',
  bank_account: '',
  ifsc_code: '',
  address: '',
  notes: '',
};

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const company_id = localStorage.getItem('company_id');
      if (!company_id) return showSnackbar('Missing company ID. Please login again.', 'error');

      const res = await API.get(`vendors/?company_id=${company_id}`);
      setVendors(res.data || []);
    } catch {
      showSnackbar('Error fetching vendors', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      'vendor_name', 'vendor_type', 'pan_number', 'contact_person',
      'phone_number', 'bank_name', 'bank_account', 'ifsc_code', 'address'
    ];
    for (const field of requiredFields) {
      if (!form[field]) return showSnackbar(`${field.replace(/_/g, ' ')} is required`, 'warning');
    }

    const company_id = localStorage.getItem('company_id');
    const created_by = localStorage.getItem('user_id');

    if (!company_id || !created_by) {
      return showSnackbar("Missing company or user ID. Please login again.", 'error');
    }

    const payload = {
      ...form,
      company_id,
      created_by,
      is_active: true,
    };

    try {
      if (editingId) {
        await API.put(`vendors/${editingId}/`, payload);
        showSnackbar('Vendor updated');
      } else {
        await API.post('vendors/', payload);
        showSnackbar('Vendor added');
      }
      fetchVendors();
      handleClose();
    } catch (err) {
      if (err.response?.data) {
        const msg = Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(', ');
        showSnackbar(msg, 'error');
      } else {
        showSnackbar('Save failed', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await API.delete(`vendors/${id}/`);
      showSnackbar('Vendor deleted');
      fetchVendors();
    } catch {
      showSnackbar('Delete failed', 'error');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm(defaultForm);
    setEditingId(null);
  };

  return (
    <div className="p-[35px]">
      <Typography variant="h5" fontWeight={600}>Vendor Management</Typography>

      <div className="flex justify-end my-4">
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add New Vendor
        </Button>
      </div>

      <Paper>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>PAN</TableCell>
              <TableCell>GST</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bank</TableCell>
              <TableCell>IFSC</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((v, idx) => (
              <TableRow key={v.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{v.vendor_name}</TableCell>
                <TableCell>{v.vendor_type}</TableCell>
                <TableCell>{v.pan_number}</TableCell>
                <TableCell>{v.gst_number}</TableCell>
                <TableCell>{v.phone_number}</TableCell>
                <TableCell>{v.email}</TableCell>
                <TableCell>{v.bank_name}</TableCell>
                <TableCell>{v.ifsc_code}</TableCell>
                <TableCell>{v.address}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => { setForm(v); setEditingId(v.id); setOpen(true); }}>
                      <EditIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(v.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {[{
              label: "Vendor Name", name: "vendor_name"
            }, {
              label: "Vendor Type", name: "vendor_type", select: true
            }, {
              label: "PAN Number", name: "pan_number"
            }, {
              label: "GST Number", name: "gst_number"
            }, {
              label: "Contact Person", name: "contact_person"
            }, {
              label: "Email Address", name: "email"
            }, {
              label: "Phone Number", name: "phone_number"
            }, {
              label: "Bank Name", name: "bank_name"
            }, {
              label: "Bank Account No.", name: "bank_account"
            }, {
              label: "IFSC Code", name: "ifsc_code"
            }, {
              label: "Address", name: "address"
            }, {
              label: "Notes", name: "notes", multiline: true
            }].map((field, index) => (
              <Grid item xs={field.name === "notes" ? 12 : 6} key={index}>
                {field.select ? (
                  <TextField required fullWidth select label={field.label}
                    value={form[field.name]} onChange={e => setForm({ ...form, [field.name]: e.target.value })}>
                    {vendorTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField fullWidth
                    label={field.label}
                    required={['vendor_name', 'vendor_type', 'pan_number', 'contact_person', 'phone_number', 'bank_name', 'bank_account', 'ifsc_code', 'address'].includes(field.name)}
                    value={form[field.name]}
                    multiline={field.multiline || false}
                    rows={field.multiline ? 2 : 1}
                    onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
