import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PlantDetails from './PlantDetails';
import PlantRegistrationDialog from './PlantRegistrationDialog';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TableSortLabel,
  Paper, 
  Typography,
  Button,
  MenuItem,
  Select,
} from '@mui/material';

const PlantMain = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sidebarRef = useRef(null);

  const fetchPlants = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/plants');
      setPlants(response.data);
      setLoading(false);
    } catch (err) {
      setError('エラーが発生しました。データを取得できませんでした。');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const clickedElement = event.target.closest('tr');
        if (!clickedElement || !clickedElement.classList.contains('plant-row')) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
    setSidebarOpen(true);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleRegisterPlant = async (newPlant) => {
    try {
      const response = await axios.post('http://localhost:8080/api/plants', newPlant);
      if (response.status === 201) {
        await fetchPlants();
      }
    } catch (err) {
      console.error('Failed to register plant:', err);
    } finally { 
      setIsDialogOpen(false);
    }
  };
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig({ key:null, direction });
      return
    }
    setSortConfig({ key, direction });
  };

  const latestPlants = useMemo(() => {
    const plantMap = new Map();
    plants.forEach(plant => {
      if (!plantMap.has(plant.plant_id) || new Date(plant.state_date) > new Date(plantMap.get(plant.plant_id).state_date)) {
        plantMap.set(plant.plant_id, plant);
      }
    });
    return Array.from(plantMap.values());
  }, [plants]);

  const sortedPlants = useMemo(() => {
    let sortablePlants = [...latestPlants];
    if (sortConfig.key !== null) {
      sortablePlants.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePlants;
  }, [latestPlants, sortConfig]);

  const columns = [
    { id: 'plant_id', label: 'ID', sortable: true },
    { id: 'location', label: '場所', sortable: true },
    { id: 'entry_date', label: '登録日', sortable: true },
    { id: 'state_type', label: '状態', sortable: false },
  ];
  
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;
  
  const variants = {
    open: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      opacity: 0, 
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          いちごの株一覧
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="いちごの株一覧">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortConfig.key === column.id}
                        direction={sortConfig.key === column.id ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                    {column.id === 'state_type' && (
                      <Select
                        value={sortConfig.key === column.id ? sortConfig.direction : ''}
                        onChange={(e) => handleSort(column.id)}
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value="">ソートなし</MenuItem>
                        <MenuItem value="asc">昇順</MenuItem>
                        <MenuItem value="desc">降順</MenuItem>
                      </Select>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlants.map((plant) => (
                <TableRow 
                  key={plant.plant_id} 
                  hover 
                  onClick={() => handlePlantClick(plant)} 
                  style={{ cursor: 'pointer' }}
                  className="plant-row"
                >
                  <TableCell>{plant.plant_id}</TableCell>
                  <TableCell>{`${plant.shelf} - ${plant.position}`}</TableCell>
                  <TableCell>{new Date(plant.entry_date).toLocaleDateString()}</TableCell>
                  <TableCell>{plant.state_type || '未設定'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <div>
          <Button onClick={handleOpenDialog} style={{flex:0.1}}>株の新規登録</Button>
          <Button style={{flex:1}}>その他の情報</Button>
        </div>
        <PlantRegistrationDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onRegister={handleRegisterPlant}
        />
      </div>
      
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '450px',
              background: '#f0f0f0',
              boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
            }}
          >
            <div ref={sidebarRef}>
              <PlantDetails 
                plant={selectedPlant} 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
            </div>  
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantMain;
