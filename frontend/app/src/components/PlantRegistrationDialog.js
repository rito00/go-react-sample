import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import apiAxios from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

const PlantRegistrationDialog = ({ isOpen, onClose, onRegister }) => {
  const [locations, setLocations] = useState([]);
  const [stateTypes, setStateTypes] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedState, setSelectedState] = useState('');
  
  useEffect(() => {
    fetchLocations();
    fetchStateTypes();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ shelf: selectedShelf, position: selectedPosition, state: selectedState });
    setSelectedShelf('');
    setSelectedPosition('');
    setSelectedState('');
  };
  
  const fetchLocations = async () => {
    try {
      const response = await apiAxios.get(ENDPOINTS.LOCATIONS);
      setLocations(response.data);
    } catch (err){
      console.error('Failed to fetch locations');
    }
  }
  
  const fetchStateTypes = async () => {
    try {
      const response = await apiAxios.get(ENDPOINTS.STATE_TYPES);
      setStateTypes(response.data);
      console.log(response.data);
    } catch (err){
      console.error('Failed to fetch state types');
    }
  }
  
  // locationをsetにして重複を削除し、配列に変換
  const shelves = [...new Set(locations.map(loc => loc.shelf))];
  const positions = locations.map(loc => loc.position);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>株の新規登録</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="shelf-label">棚</InputLabel>
            <Select
              labelId="shelf-label"
              value={selectedShelf}
              onChange={(e) => setSelectedShelf(e.target.value)}
              required
            >
              {shelves.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="position-label">位置</InputLabel>
            <Select
              labelId="position-label"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              required
            >
              {positions.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="state-label">状態</InputLabel>
            <Select
              labelId="state-label"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              required
            >
              {stateTypes.map((state) => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))} 
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">登録</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlantRegistrationDialog;
