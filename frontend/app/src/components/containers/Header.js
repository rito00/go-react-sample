import React from 'react';
import { Typography, Button } from '@mui/material';

const Header = ({ onOpenDialog }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: "20px"
    }}>
      <Typography variant="h4" component="h1">
        部屋1
      </Typography>
      <div>
        <Button onClick={onOpenDialog} style={{ marginRight: '10px' }}>
          株の新規登録
        </Button>
        <Button>その他の情報</Button>
      </div>
    </div>
  );
};

export default Header;