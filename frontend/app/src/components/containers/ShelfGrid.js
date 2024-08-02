import React from 'react';
import { Grid, Paper } from '@mui/material';

const ShelfGrid = ({ shelves, selectedShelf, onShelfClick }) => {
  return (
    <Grid container 
      spacing={2}
      justifyContent="flex-start"
      style={{ padding: '20px' }}
    >
      {shelves.map((shelf) => (
        <Grid item key={shelf.id} xs={6} sm={4} md={3} lg={2} xl={2}>
          <Paper
            elevation={3}
            style={{
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: selectedShelf === shelf.name ? '#f5f5f5' : 'white',
            }}
            onClick={() => onShelfClick(shelf.name)}
          >
            {shelf.name}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ShelfGrid;