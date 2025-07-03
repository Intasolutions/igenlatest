// src/modules/Assets/AssetManagement.js
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
} from '@mui/material';
import AddAssetDialog from './AddAssetDialog';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/assets/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddSuccess = () => {
    setOpen(false);
    fetchAssets(); // Refresh assets after adding
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Asset Management
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add Asset
      </Button>

      <AddAssetDialog open={open} onClose={() => setOpen(false)} onSuccess={handleAddSuccess} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#003B99' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>ID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Category</TableCell>
              <TableCell sx={{ color: '#fff' }}>Location</TableCell>
              <TableCell sx={{ color: '#fff' }}>Purchase Date</TableCell>
              <TableCell sx={{ color: '#fff' }}>Maintenance Frequency</TableCell>
              <TableCell sx={{ color: '#fff' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.length > 0 ? (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.id}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell>{asset.purchase_date}</TableCell>
                  <TableCell>{asset.maintenance_frequency}</TableCell>
                  <TableCell>Coming soon</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No assets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
