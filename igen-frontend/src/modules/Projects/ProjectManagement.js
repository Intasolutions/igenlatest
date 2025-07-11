import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [form, setForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    stakeholders: '',
    expected_return: '',
  });

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const res = await API.get('projects/');
      console.log('Fetched projects:', res.data); // Debug log
      // Ensure res.data is always an array
      setProjects(res.data.results || []);

    } catch (err) {
      console.error('Error fetching projects:', err.response?.data || err);
      alert('Error fetching projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Add a new project manually
  const handleAddProject = async () => {
    if (!form.name || !form.start_date) {
      alert('Name and Start Date are required');
      return;
    }
    try {
      await API.post('projects/', form);
      alert('Project added successfully');
      fetchProjects();
      setOpen(false);
      setForm({
        name: '',
        start_date: '',
        end_date: '',
        stakeholders: '',
        expected_return: ''
      });
    } catch (err) {
      console.error('Add project error:', err.response?.data || err);
      alert('Failed to add project');
    }
  };

  // Bulk upload CSV handler
  const handleUploadCSV = async () => {
    if (!csvFile) {
      alert('Please choose a CSV file first');
      return;
    }
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await API.post('projects/bulk_upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Bulk upload response:', res.data);
      setBulkResults(res.data.results);
      alert('Bulk upload complete');
      fetchProjects();
    } catch (err) {
      console.error('Bulk upload failed:', err.response?.data || err);
      alert('Bulk upload failed');
    }
  };

  // Delete a project
  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`projects/${id}/`);
      alert('Project deleted');
      fetchProjects();
    } catch (err) {
      console.error('Delete project error:', err.response?.data || err);
      alert('Failed to delete project');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Project Management</h2>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Project
      </Button>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setCsvFile(e.target.files[0])}
        style={{ marginLeft: 10 }}
      />
      <Button
        onClick={handleUploadCSV}
        variant="outlined"
        color="secondary"
        style={{ marginLeft: 10 }}
      >
        Upload CSV
      </Button>

      {/* Add project modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense" label="Name" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            margin="dense" label="Start Date (YYYY-MM-DD)" fullWidth value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <TextField
            margin="dense" label="End Date (YYYY-MM-DD)" fullWidth value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
          <TextField
            margin="dense" label="Stakeholders" fullWidth value={form.stakeholders}
            onChange={(e) => setForm({ ...form, stakeholders: e.target.value })}
          />
          <TextField
            margin="dense" label="Expected Return" type="number" fullWidth value={form.expected_return}
            onChange={(e) => setForm({ ...form, expected_return: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProject} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Projects Table */}
      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Stakeholders</th>
            <th>Expected Return</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(projects) && projects.length > 0 ? (
            projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.start_date}</td>
                <td>{p.end_date || '-'}</td>
                <td>{p.stakeholders || '-'}</td>
                <td>{p.expected_return || '-'}</td>
                <td>
                  <Button onClick={() => deleteProject(p.id)} size="small" variant="outlined" color="error">
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No projects found</td></tr>
          )}
        </tbody>
      </table>

      {/* Bulk Upload Results */}
      {bulkResults.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Bulk Upload Results</h4>
          <table border="1" width="100%">
            <thead>
              <tr>
                <th>Row</th>
                <th>Status</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {bulkResults.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.row}</td>
                  <td>{r.status}</td>
                  <td>{r.errors ? JSON.stringify(r.errors) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
