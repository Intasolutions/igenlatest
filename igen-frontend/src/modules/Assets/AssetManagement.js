// src/modules/Assets/AssetManagement.js
import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
} from '@mui/material';
import AddAssetDialog from './AddAssetDialog';
import axios from 'axios';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assets/`);
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        Asset Management
      </Typography>
      <Button
        variant="contained"
        onClick={() => setAddDialogOpen(true)}
        style={{ marginBottom: '16px' }}
      >
        ADD ASSET
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#003B99' }}>
              <TableCell style={{ color: '#fff' }}>ID</TableCell>
              <TableCell style={{ color: '#fff' }}>Name</TableCell>
              <TableCell style={{ color: '#fff' }}>Category</TableCell>
              <TableCell style={{ color: '#fff' }}>Location</TableCell>
              <TableCell style={{ color: '#fff' }}>Purchase Date</TableCell>
              <TableCell style={{ color: '#fff' }}>Maintenance Frequency</TableCell>
              <TableCell style={{ color: '#fff' }}>Actions</TableCell>
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
                  <TableCell> {/* Add edit/delete actions here if needed */}</TableCell>
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

      {/* Add Asset Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <AddAssetDialog onClose={() => { setAddDialogOpen(false); fetchAssets(); }} />
      </Dialog>
    </div>
  );
}
