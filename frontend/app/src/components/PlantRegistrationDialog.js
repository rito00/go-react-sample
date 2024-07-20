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


const PlantRegistrationDialog = ({ isOpen, onClose, onRegister }) => {
  const [shelf, setShelf] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('');

  // 仮のデータ（後でバックエンドから取得するようにします）
  const shelves = ['棚A', '棚B', '棚C'];
  const positions = ['左', '中央', '右'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ shelf, position, status });
    setShelf('');
    setPosition('');
    setStatus('');
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
              value={shelf}
              onChange={(e) => setShelf(e.target.value)}
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
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            >
              {positions.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            id="status"
            label="状態"
            type="text"
            fullWidth
            variant="outlined"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
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
