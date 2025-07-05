import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, TablePagination
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';



export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [uploadResults, setUploadResults] = useState([]);
  const [loading, setLoading] = useState(false);
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
const [showSuccess, setShowSuccess] = useState(false);



  const [form, setForm] = useState({
    name: '', pan: '', gst: '', mca: '', address: '', notes: ''
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchCompanies = async () => {
  try {
    const res = await API.get('companies/');
    // Sort by created date if available, else by ID
    const sorted = res.data.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(a.created_at) - new Date(b.created_at); // FIFO
      }
      return a.id - b.id; // fallback
    });
    setCompanies(sorted);
  } catch (err) {
   setSnackbar({ open: true, message: 'Error fetching companies', severity: 'error' });

  }
};

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleFormSubmit = async () => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!form.name || !form.pan || !form.gst || !form.mca) {
    setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
    return;
  }

  if (!panRegex.test(form.pan)) {
    setSnackbar({ open: true, message: 'Invalid PAN format.', severity: 'error' });
    return;
  }

  if (!gstRegex.test(form.gst)) {
    setSnackbar({ open: true, message: 'Invalid GST format.', severity: 'error' });
    return;
  }

  setLoading(true);
  try {
  if (editMode) {
  await API.put(`companies/${selectedId}/`, form);
  setSnackbar({ open: true, message: 'Company updated successfully!', severity: 'success' });
} else {
  await API.post('companies/', form);
  setSnackbar({ open: true, message: 'Company added successfully!', severity: 'success' });

  // ✅ Close dialog first
  setOpen(false);

  // ✅ Then show success animation after short delay
  setTimeout(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000); // auto-close animation
  }, 300); // slight delay allows dialog to fade out
}

    fetchCompanies();
    setOpen(false);
    setForm({ name: '', pan: '', gst: '', mca: '', address: '', notes: '' });
    setEditMode(false);
    setSelectedId(null);
  } catch (err) {
    setSnackbar({ open: true, message: 'Operation failed!', severity: 'error' });
  } finally {
    setLoading(false);
  }
};


  const handleEdit = (company) => {
    setForm({
      name: company.name,
      pan: company.pan,
      gst: company.gst,
      mca: company.mca,
      address: company.address,
      notes: company.notes
    });
    setSelectedId(company.id);
    setEditMode(true);
    setOpen(true);
  };

  const deleteCompany = async (id) => {
    try {
      await API.delete(`companies/${id}/`);
     setSnackbar({ open: true, message: 'Company deleted', severity: 'success' });

      fetchCompanies();
    } catch (err) {
  setSnackbar({ open: true, message: 'Failed to delete company', severity: 'error' });


    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

const handleUploadCSV = async () => {
  const file = document.getElementById('csv-upload').files[0];
  if (!file) {
    setSnackbar({ open: true, message: 'Please select a CSV file', severity: 'error' });
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await API.post('companies/bulk_upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    fetchCompanies();

    // Show error messages as snackbars only, no table
    let delay = 0;
    res.data.results.forEach((r) => {
      if (r.errors) {
        const messages = Object.entries(r.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
        const errorMessage = `Row ${r.row} - ${messages}`;

        setTimeout(() => {
          setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }, delay);
        delay += 3000;
      }
    });

    // If no errors, show success
    if (!res.data.results.some(r => r.errors)) {
      setSnackbar({ open: true, message: 'Bulk upload completed successfully', severity: 'success' });
    }

  } catch (err) {
    setSnackbar({ open: true, message: 'Bulk upload failed', severity: 'error' });
  }
};



  return (
    <div className="p-[95px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Company Management</h2>
        <div className="flex gap-3">
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Add Company</Button>
          <label>
            <input type="file" id="csv-upload" accept=".csv" hidden onChange={handleUploadCSV} />
            <Button variant="outlined" component="span">Upload CSV</Button>
          </label>
        </div>
      </div>

      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
         <Table sx={{ minWidth: 650 }} size="small">
  <TableHead>
    <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
      <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>PAN</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>GST</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>MCA</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
    
      <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {companies
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((c, index) => (
        <TableRow
          key={c.id}
          hover
          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
          <TableCell>{c.name}</TableCell>
          <TableCell>{c.pan}</TableCell>
          <TableCell>{c.gst}</TableCell>
          <TableCell>{c.mca}</TableCell>
          <TableCell>{c.address}</TableCell>
        
          <TableCell align="center">
            <IconButton onClick={() => handleEdit(c)} color="primary">
              <Edit />
            </IconButton>
            <IconButton onClick={() => deleteCompany(c.id)} color="error">
              <Delete />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
  </TableBody>
</Table>

         <TablePagination
  component="div"
  count={companies.length}
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

      {uploadResults.length > 0 && (
        <div className="mt-6">
          <Typography variant="h6">Bulk Upload Results</Typography>
          <Card className="mt-2">
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Errors</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadResults.map((res, index) => (
                    <TableRow key={index}>
                      <TableCell>{res.row}</TableCell>
                      <TableCell>{res.status}</TableCell>
                      <TableCell>{res.errors ? JSON.stringify(res.errors) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Modal */}
<Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle>{editMode ? 'Edit Company' : 'Add New Company'}</DialogTitle>
  <DialogContent dividers>
    <div className="space-y-4">
      <TextField
        label="Company Name *"
        fullWidth
        value={form.name}
        error={!form.name}
        helperText={!form.name ? 'Name is required' : ''}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <TextField
        label="PAN *"
        fullWidth
        value={form.pan}
        error={!form.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)}
        helperText={
          !form.pan ? 'PAN is required' :
          !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan) ? 'Invalid PAN format' : ''
        }
        onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
      />

      <TextField
        label="GSTIN *"
        fullWidth
        value={form.gst}
        error={!form.gst || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(form.gst)}
        helperText={
          !form.gst ? 'GST is required' :
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(form.gst) ? 'Invalid GSTIN format' : ''
        }
        onChange={(e) => setForm({ ...form, gst: e.target.value.toUpperCase() })}
      />

      <TextField
        label="MCA Number *"
        fullWidth
        value={form.mca}
        error={!form.mca}
        helperText={!form.mca ? 'MCA Number is required' : ''}
        onChange={(e) => setForm({ ...form, mca: e.target.value })}
      />

      <TextField
        label="Address"
        fullWidth
        multiline
        minRows={2}
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      <TextField
        label="Notes"
        fullWidth
        multiline
        minRows={2}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
    </div>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button
  onClick={handleFormSubmit}
  color="primary"
  variant="contained"
  disabled={loading}
>
  {loading ? <CircularProgress size={24} color="inherit" /> : (editMode ? 'Update' : 'Add')}
</Button>

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
          sx={{ width: '100%', backgroundColor: snackbar.severity === 'success' ? '#4caf50' : snackbar.severity === 'error' ? '#f44336' : '#2196f3' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
{showSuccess && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40"
    style={{ zIndex: 1600 }} // ✅ Ensure it's above MUI dialogs
  >
    <Card sx={{ p: 4, borderRadius: 4, boxShadow: 6, backgroundColor: 'white' }}>
      <Player
        autoplay
        loop={false}
        src="https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json"
        style={{ height: '150px', width: '150px' }}
      />
      <Typography align="center" variant="h6" sx={{ mt: 2 }}>
        Company Added!
      </Typography>
    </Card>
  </div>
)}


    </div>
  );
}
