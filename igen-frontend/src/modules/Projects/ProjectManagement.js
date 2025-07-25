import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Card, CardContent, Typography, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Paper, Tooltip, Snackbar, Alert, Slide, MenuItem
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '', start_date: '', end_date: '', stakeholders: '', expected_return: '', status: 'Planned',
    landmark: '', pincode: '', city: '', district: '', state: 'Kerala', country: 'India',
    project_manager_id: '', key_stakeholder_id: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchContacts();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('projects/');
      setProjects(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      showSnackbar('Error fetching projects', 'error');
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await API.get('contacts/');
      const contactList = Array.isArray(res.data) ? res.data : res.data.results || [];
      setContacts(contactList);
    } catch (err) {
      showSnackbar('Error fetching contacts', 'error');
    }
  };

  const handleAddOrUpdateProject = async () => {
    if (!form.name || !form.start_date) {
      showSnackbar('Name and Start Date are required', 'warning');
      return;
    }
    try {
      if (editingId) {
        await API.put(`projects/${editingId}/`, form);
        showSnackbar('Project updated');
      } else {
        await API.post('projects/', form);
        showSnackbar('Project added');
      }
      fetchProjects();
      setOpen(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      showSnackbar('Failed to save project', 'error');
    }
  };


  const handleUploadCSV = async () => {
    if (!csvFile) {
      showSnackbar('Please choose a CSV file first', 'warning');
      return;
    }
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      await API.post('projects/bulk_upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSnackbar('Bulk upload successful');
      fetchProjects();
    } catch (err) {
      showSnackbar('Bulk upload failed', 'error');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`projects/${id}/`);
      showSnackbar('Project deleted');
      fetchProjects();
    } catch (err) {
      showSnackbar('Delete failed', 'error');
    }
  };

  const resetForm = () => setForm({
    name: '', start_date: '', end_date: '', stakeholders: '', expected_return: '', status: 'Planned',
    landmark: '', pincode: '', city: '', district: '', state: 'Kerala', country: 'India',
    project_manager_id: '', key_stakeholder_id: ''
  });

  const handleEdit = (project) => {
    setForm({
      ...project,
      project_manager_id: project.project_manager?.id || '',
      key_stakeholder_id: project.key_stakeholder?.id || ''
    });
    setEditingId(project.id);
    setOpen(true);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Start Date', 'End Date', 'Stakeholders', 'Expected Return', 'Status'];
    const rows = projects.map(p => [p.name, p.start_date, p.end_date, p.stakeholders, p.expected_return, p.status]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'projects.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.stakeholders || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [search, projects]);

  return (
    <div className="p-[35px]">
      <Typography variant="h5" fontWeight={600}>Project Management</Typography>

      <div className="flex justify-between items-center mb-6 mt-6">
        <TextField
          label="Search by Company"
          size="small"
          variant="outlined"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <span className="material-icons text-gray-500 mr-2">search</span>
            ),
            sx: { borderRadius: 2, backgroundColor: '#fafafa' }
          }}
        />
        <div className="flex gap-3">
          <Button startIcon={<UploadFileIcon />} variant="contained" color="secondary" component="label" sx={{ borderRadius: 2 }}>
            Upload CSV
            <input hidden accept=".csv" type="file" onChange={(e) => setCsvFile(e.target.files[0])} />
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export</Button>
          <Button variant="contained" startIcon={<AddIcon />} color="primary" onClick={() => { setOpen(true); resetForm(); setEditingId(null); }}>Add Project</Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Stakeholders</TableCell>
                  <TableCell>Expected Return</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Project Manager</TableCell>
                  <TableCell>Key Stakeholder</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.length > 0 ? filteredProjects.map((p, index) => (
                  <TableRow key={p.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.start_date}</TableCell>
                    <TableCell>{p.end_date || '-'}</TableCell>
                    <TableCell>{p.stakeholders || '-'}</TableCell>
                    <TableCell>{p.expected_return || '-'}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.city || '-'}</TableCell>
                    <TableCell>{p.state || '-'}</TableCell>
                    <TableCell>{p.country || '-'}</TableCell>
                    <TableCell>{p.project_manager?.name || '-'}</TableCell>
                    <TableCell>{p.key_stakeholder?.name || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(p)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => deleteProject(p.id)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={13} align="center">No projects found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth TransitionComponent={Transition} keepMounted PaperProps={{ sx: { borderRadius: 4, p: 3, backgroundColor: '#fafafa', boxShadow: 10 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.4rem', mb: 1, color: 'primary.main' }}>{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 1 }}>
          <TextField label="Name" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Start Date" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <TextField label="End Date" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <TextField label="Stakeholders" fullWidth margin="normal" value={form.stakeholders} onChange={(e) => setForm({ ...form, stakeholders: e.target.value })} />
          <TextField label="Expected Return" type="number" fullWidth margin="normal" value={form.expected_return} onChange={(e) => setForm({ ...form, expected_return: e.target.value })} />
          <TextField label="Landmark" fullWidth margin="normal" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
          <TextField label="Pincode" fullWidth margin="normal" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          <TextField label="City" fullWidth margin="normal" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <TextField label="District" fullWidth margin="normal" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <TextField label="State" fullWidth margin="normal" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <TextField label="Country" fullWidth margin="normal" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <TextField select label="Project Manager" fullWidth margin="normal" value={form.project_manager_id} onChange={(e) => setForm({ ...form, project_manager_id: e.target.value })}>
            <MenuItem value="">Select Project Manager</MenuItem>
            {contacts.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select label="Key Stakeholder" fullWidth margin="normal" value={form.key_stakeholder_id} onChange={(e) => setForm({ ...form, key_stakeholder_id: e.target.value })}>
            <MenuItem value="">Select Key Stakeholder</MenuItem>
            {contacts.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select label="Status" fullWidth margin="normal" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['Planned', 'In Progress', 'Completed', 'On Hold'].map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOrUpdateProject}>{editingId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
