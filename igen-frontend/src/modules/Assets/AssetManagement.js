import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddAssetDialog from './AddAssetDialog';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editAsset, setEditAsset] = useState(null); // ✅ Edit mode support

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/assets/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Filter only active assets
      const activeAssets = response.data.filter(asset => asset.is_active !== false);
      setAssets(activeAssets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddSuccess = () => {
    setOpen(false);
    setEditAsset(null);
    fetchAssets();
  };

  const handleEdit = (asset) => {
    setEditAsset(asset);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('access');
      await axios.patch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/assets/${id}/`, {
        is_active: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAssets();
    } catch (error) {
      console.error('Failed to deactivate asset:', error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Asset Management
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setEditAsset(null);
          setOpen(true);
        }}
        sx={{ mb: 2 }}
      >
        Add Asset
      </Button>

      <AddAssetDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditAsset(null);
        }}
        onSuccess={handleAddSuccess}
        initialData={editAsset} // Pass data for edit mode
      />

      <TableContainer component={Paper}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <CircularProgress />
          </div>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: '#003B99' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff' }}>ID</TableCell>
                <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                <TableCell sx={{ color: '#fff' }}>Tag ID</TableCell>
                <TableCell sx={{ color: '#fff' }}>Company</TableCell>
                <TableCell sx={{ color: '#fff' }}>Property</TableCell>
                <TableCell sx={{ color: '#fff' }}>Project</TableCell>
                <TableCell sx={{ color: '#fff' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.tag_id || 'N/A'}</TableCell>
                    <TableCell>{asset.company_name || 'N/A'}</TableCell>
                    <TableCell>{asset.property_name || '-'}</TableCell>
                    <TableCell>{asset.project_name || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(asset)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate">
                        <IconButton onClick={() => handleDelete(asset.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No active assets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </div>
  );
}
