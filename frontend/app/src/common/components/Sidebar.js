import React, { useState } from 'react';
import { Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import ContactsIcon from '@mui/icons-material/Contacts';

const drawerWidth = 200;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 0.6),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(2, 0),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  height: 48,
  padding: theme.spacing(0, 1.6),
}));

const Sidebar = ({ onViewChange }) => {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { icon: <HomeIcon />, label: 'Home' },
    { icon: <InfoIcon />, label: 'About' },
    { icon: <ContactsIcon />, label: 'Contact' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 50,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 50,
          transition: theme =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: 'hidden',
        },
      }}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerToggle}>
          <MenuIcon />
        </IconButton>
      </DrawerHeader>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <StyledList>
          {menuItems.map((item, index) => (
            <StyledListItem key={index} button onClick={() => {
              onViewChange(item.label.toLowerCase());
              console.log(item.label)}
            } >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              {open && <ListItemText primary={item.label} />}
            </StyledListItem>
          ))}
        </StyledList>
        <Box sx={{ flexGrow: 1 }} />
        <StyledList>
          <StyledListItem button onClick={() => onViewChange('settings')}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Settings" />}
          </StyledListItem>
        </StyledList>
      </Box>
    </Drawer>
  );
};

export default Sidebar;