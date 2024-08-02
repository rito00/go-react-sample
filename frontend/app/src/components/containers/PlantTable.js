import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from '@mui/material';

const PlantTable = ({ columns, plants, sortConfig, onSort, onPlantClick }) => {
  return (
    <TableContainer component={Paper}>
      <Table >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>
                {column.sortable ? (
                  <TableSortLabel
                    active={sortConfig.key === column.id}
                    direction={sortConfig.key === column.id ? sortConfig.direction : 'asc'}
                    onClick={() => onSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {plants.map((plant) => (
            <TableRow
              key={plant.plant_id}
              hover
              onClick={() => onPlantClick(plant)}
              style={{ cursor: 'pointer' }}
              className="plant-row"
            >
              <TableCell>{plant.level}</TableCell>
              <TableCell>{plant.position}</TableCell>
              <TableCell>{new Date(plant.entry_date).toLocaleDateString()}</TableCell>
              <TableCell>{plant.state_type || '未設定'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PlantTable;