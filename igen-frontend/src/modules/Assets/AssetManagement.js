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
} from '@mui/material';
import AddAssetDialog from './AddAssetDialog';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setAssets(response.data);
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
    fetchAssets();
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

      <AddAssetDialog
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleAddSuccess}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <TableRow key={asset.asset_id}>
                    <TableCell>{asset.asset_id}</TableCell>
                    <TableCell>{asset.asset_name}</TableCell>
                    <TableCell>{asset.tag_id}</TableCell>
                    <TableCell>{asset.company?.name || 'N/A'}</TableCell>
                    <TableCell>{asset.property?.name || '-'}</TableCell>
                    <TableCell>{asset.project?.name || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No assets found.
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