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
  const [shelves, setShelves] = useState([]);
  const [levels, setLevels] = useState([]);
  const [positions, setPositions] = useState([]);
  const [stateTypes, setStateTypes] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [harvestedAmount, setHarvestedAmount] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false); // 登録ボタンの制御
  
  useEffect(() => {
    resetForm();
    fetchShelves();
    fetchStateTypes();
  }, []);

  useEffect(() => {
    const validateForm = () => {
      const isValid = selectedShelf !== '' &&
                      selectedLevel !== '' &&
                      selectedPosition !== '' &&
                      selectedState !== '' &&
                      (selectedState !== 'harvested' || (selectedState === 'harvested' && harvestedAmount > 0));
      setIsFormValid(isValid);
    };
  
    validateForm();
  }, [selectedShelf, selectedLevel, selectedPosition, selectedState, harvestedAmount]);
  
  const resetForm = () => {
    setSelectedShelf('');
    setSelectedLevel('');
    setSelectedPosition('');
    setSelectedState('');
    setHarvestedAmount(0);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ 
      shelf: selectedShelf, 
      level: selectedLevel,
      position: selectedPosition, 
      state: selectedState,
      harvestedAmount: selectedState === 'harvested' ? harvestedAmount : null
    });
    resetForm(); 
  };
  
  const fetchShelves = async () => {
    try {
      const response = await apiAxios.get(ENDPOINTS.SHELVES);
      setShelves(response.data);
    } catch (err){
      console.error('Failed to fetch shelves');
    }
  }

  const fetchLevels = async (shelfId) => {
    try {
      const response = await apiAxios.get(`${ENDPOINTS.LEVELS}?shelf_id=${shelfId}`);
      setLevels(response.data);
    } catch (err){
      console.error('Failed to fetch levels');
    }
  }

  const fetchPositions = async (levelId) => {
    try {
      const response = await apiAxios.get(`${ENDPOINTS.POSITIONS}?level_id=${levelId}`);
      setPositions(response.data);
    } catch (err){
      console.error('Failed to fetch positions');
    }
  }
  
  const fetchStateTypes = async () => {
    try {
      const response = await apiAxios.get(ENDPOINTS.STATE_TYPES);
      setStateTypes(response.data);
    } catch (err){
      console.error('Failed to fetch state types');
    }
  }

  const handleShelfChange = (e) => {
    const shelfId = e.target.value;
    setSelectedShelf(shelfId);
    setSelectedLevel('');
    setSelectedPosition('');
    fetchLevels(shelfId);
  };

  const handleLevelChange = (e) => {
    const levelId = e.target.value;
    setSelectedLevel(levelId);
    setSelectedPosition('');
    fetchPositions(levelId);
  };

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
              onChange={handleShelfChange}
              required
            >
              {shelves.map((shelf) => (
                <MenuItem key={shelf.id} value={shelf.id}>{shelf.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="level-label">階層</InputLabel>
            <Select
              labelId="level-label"
              value={selectedLevel}
              onChange={handleLevelChange}
              required
              disabled={!selectedShelf}
            >
              {levels.map((level) => (
                <MenuItem key={level.id} value={level.id}>{level.level_number}</MenuItem>
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
              disabled={!selectedLevel}
            >
              {positions.map((position) => (
                <MenuItem key={position.id} value={position.id}>{position.position_number}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="state-label">状態</InputLabel>
            <Select
              labelId="state-label"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              required={true}
            >
              {stateTypes.map((state) => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))} 
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            {selectedState === 'harvested' && (
              <TextField
                label="収穫量"
                type="number"
                value={harvestedAmount}
                onChange={(e) => setHarvestedAmount(e.target.value)}
                required
              />
            )}
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={!isFormValid}
        >
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlantRegistrationDialog;