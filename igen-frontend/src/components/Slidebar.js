import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  AccountBalance,
  Category,
  ReceiptLong,
  Logout,
  Assignment,
  Menu as MenuIcon,
  Apartment,         // 🏢 for Properties
  BusinessCenter,    // 🏬 for Entities
  Receipt,           // 🧾 for Receipts
  Inventory,         // 📦 for Assets
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Companies', icon: <Business />, path: '/companies' },
  { text: 'Banks', icon: <AccountBalance />, path: '/banks' },
  { text: 'Cost Centres', icon: <Category />, path: '/cost-centres' },
  { text: 'Transaction Types', icon: <ReceiptLong />, path: '/transaction-types' },
  { text: 'Transactions', icon: <Assignment />, path: '/transactions' },
  { text: 'Projects', icon: <Assignment />, path: '/projects' },
  { text: 'Properties', icon: <Apartment />, path: '/properties' },         // ✅ Added
  { text: 'Entities', icon: <BusinessCenter />, path: '/entities' },        // ✅ Added
  { text: 'Receipts', icon: <Receipt />, path: '/receipts' },               // ✅ Added
  { text: 'Assets', icon: <Inventory />, path: '/assets' },                 // ✅ Added
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 220 : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 220 : 72,
          boxSizing: 'border-box',
          backgroundColor: '#003B99',
          color: '#fff',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '2px 0 10px rgba(0,0,0,0.15)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          paddingRight: '18px',
        },
      }}
    >
      {/* Logo / Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', padding: 12 }}>
        <IconButton onClick={() => setOpen(!open)} sx={{ color: '#fff' }}>
          <MenuIcon />
        </IconButton>
        {open && <h3 style={{ marginLeft: 10, fontWeight: '600' }}>iGen</h3>}
      </div>

      {/* Navigation Links */}
      <List sx={{ mt: 1 }}>
        {menuItems.map(item => (
          <Tooltip key={item.text} title={!open ? item.text : ''} placement="right">
            <ListItem
              button
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: '12px',
                paddingY: '8px',
                backgroundColor:
                  location.pathname === item.path
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.03)',
                },
                transition: 'all 0.25s ease-in-out',
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Spacer */}
      <div style={{ flexGrow: 1 }} />

      {/* Logout Button */}
      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            mx: 1,
            mb: 2,
            borderRadius: '12px',
            paddingY: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.02)',
            },
            transition: 'all 0.25s ease-in-out',
          }}
        >
          <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          {open && <ListItemText primary="Logout" />}
        </ListItem>
      </List>
    </Drawer>
  );
}
