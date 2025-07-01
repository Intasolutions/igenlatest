import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);  // NEW: store bulk upload results

  const [form, setForm] = useState({
    name: '',
    pan: '',
    gst: '',
    mca: '',
    address: '',
    notes: '',
  });

  const fetchCompanies = async () => {
    try {
      const res = await API.get('companies/');
      setCompanies(res.data);
    } catch (err) {
      alert('Error fetching companies');
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = async () => {
    if (!form.name || !form.pan) {
      alert('Name and PAN are required');
      return;
    }
    try {
      await API.post('companies/', form);
      alert('Company added');
      fetchCompanies();
      setOpen(false);
      setForm({ name: '', pan: '', gst: '', mca: '', address: '', notes: '' });
    } catch (err) {
      alert('Failed to add company');
    }
  };

  const handleUploadCSV = async () => {
    const file = document.getElementById('csv-upload').files[0];
    if (!file) return alert('Please select a CSV file');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('companies/bulk_upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(res.data);
      alert('Bulk upload completed');
      fetchCompanies();
      setUploadResults(res.data.results);  // NEW: save server response
    } catch (err) {
      console.error(err.response?.data);
      alert('Bulk upload failed');
      setUploadResults([]);  // clear on error
    }
  };

  const handleUploadDocuments = async (id) => {
    const files = document.getElementById(`docs-${id}`).files;
    if (!files.length) return alert('Please select files first');
    const formData = new FormData();
    for (let f of files) formData.append('documents', f);
    try {
      await API.post(`companies/${id}/upload_document/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Documents uploaded');
      fetchCompanies();
    } catch (err) {
      alert('Upload failed');
    }
  };

  const deleteCompany = async (id) => {
    try {
      await API.delete(`companies/${id}/`);
      alert('Company deleted');
      fetchCompanies();
    } catch (err) {
      alert('Failed to delete company');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Company Management</h2>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Company
      </Button>

      <input type="file" id="csv-upload" accept=".csv" style={{ marginLeft: 10 }} />
      <Button variant="outlined" onClick={handleUploadCSV} style={{ marginLeft: 5 }}>
        Upload Companies CSV
      </Button>

      {/* Add Company Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Company</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense" label="Name" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            margin="dense" label="PAN" fullWidth value={form.pan}
            onChange={(e) => setForm({ ...form, pan: e.target.value })}
          />
          <TextField
            margin="dense" label="GST" fullWidth value={form.gst}
            onChange={(e) => setForm({ ...form, gst: e.target.value })}
          />
          <TextField
            margin="dense" label="MCA" fullWidth value={form.mca}
            onChange={(e) => setForm({ ...form, mca: e.target.value })}
          />
          <TextField
            margin="dense" label="Address" fullWidth multiline value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <TextField
            margin="dense" label="Notes" fullWidth multiline value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCompany} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>PAN</th>
            <th>GST</th>
            <th>Documents</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.pan}</td>
              <td>{c.gst}</td>
              <td>
                {c.documents.map((d) => (
                  <div key={d.id}>
                    <a href={d.file} target="_blank" rel="noreferrer">Doc {d.id}</a>
                  </div>
                ))}
                <input type="file" id={`docs-${c.id}`} multiple />
                <Button onClick={() => handleUploadDocuments(c.id)} size="small" variant="outlined">
                  Upload
                </Button>
              </td>
              <td>
                <Button onClick={() => deleteCompany(c.id)} size="small" variant="outlined" color="error">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bulk Upload Results Section */}
      {uploadResults.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Bulk Upload Results</h3>
          <table border="1" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Row</th>
                <th>Status</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {uploadResults.map((res, index) => (
                <tr key={index}>
                  <td>{res.row}</td>
                  <td>{res.status}</td>
                  <td>{res.errors ? JSON.stringify(res.errors) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
