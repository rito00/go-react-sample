import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiAxios from '../api/axios';
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
  Grid,
  IconButton,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ENDPOINTS } from '../api/endpoints';

const PlantMain = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [plants, setPlants] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const [plantListOpen, setPlantListOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sidebarRef = useRef(null);
  
  useEffect(() => {
    fetchPlants();
    fetchShelves();
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      const clickedElement = event.target.closest('tr');
      if (!clickedElement || !clickedElement.classList.contains('plant-row')) {
        setSidebarOpen(false);
      }
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await apiAxios.get(ENDPOINTS.PLANTS);
      setPlants(response.data);
      console.log('Fetched plants:', response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError('エラーが発生しました。データを取得できませんでした。');
      setLoading(false);
    }
  };
  
  const fetchShelves = async () => {
    try {
      const response = await apiAxios.get(ENDPOINTS.SHELVES);
      setShelves(response.data);
      console.log('Fetched shelves:', response.data);
    } catch (err) {
      console.error('Failed to fetch shelves:', err);
    }
  };
  
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
  
  const handleBackToList = () => {
    setSidebarOpen(false);
    setSelectedPlant(null);
  };

  const handleRegisterPlant = async (newPlant) => {
    try {
      const response = await apiAxios.post(ENDPOINTS.PLANTS, newPlant);
      if (response.status === 201) {
        console.log('New plant registered:', response.data);
        await fetchPlants();
      }
    } catch (err) {
      console.error('Failed to register plant:', err);
    } finally { 
      setIsDialogOpen(false);
    }
  };
  


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
  
  const handleShelfClick = (shelf) => {
    setSelectedShelf(shelf);
    setPlantListOpen(true);
  };

  const handleClosePlantList = () => {
    setSelectedShelf(null);
    setPlantListOpen(false);
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
    console.log('Sorted plants:', sortablePlants);
    return sortablePlants;
  }, [latestPlants, sortConfig]);
  
  const filteredPlants = useMemo(() => {
    if (!selectedShelf) return [];
    const filtered = sortedPlants.filter(plant => plant.shelf === selectedShelf);
    console.log('Filtered plants for shelf', selectedShelf, ':', filtered);
    return filtered;
  }, [sortedPlants, selectedShelf]);

  const columns = [
    { id: 'level', label: '階層', sortable: true },
    { id: 'position', label: '位置', sortable: true },
    { id: 'entry_date', label: '登録日', sortable: true },
    { id: 'state_type', label: '状態', sortable: false },
  ];
  
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4" component="h1">
          部屋1
        </Typography>
        <div>
          <Button onClick={handleOpenDialog} style={{ marginRight: '10px' }}>株の新規登録</Button>
          <Button>その他の情報</Button>
        </div>
      </div>
      
        <PlantRegistrationDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onRegister={handleRegisterPlant}
        />

        {/* 棚のタイル表示 */}
        <Grid container spacing={2} style={{ marginBottom: '20px' }}>
          {shelves.map((shelf) => (
            <Grid item key={shelf.id} xs={6} sm={4} md={3} lg={2} xl={1}>
              <Paper
                elevation={3}
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: selectedShelf === shelf.name ? '#f5f5f5' : 'white',
                }}
                onClick={() => handleShelfClick(shelf.name)}
              >
                {shelf.name}
              </Paper>
            </Grid>
        ))}
      </Grid>
        
        {/* 株一覧オーバーレイ */}
        <AnimatePresence>
          {plantListOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'black',
                  zIndex: 10,
                }}
                onClick={handleClosePlantList}
              />
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                style={{
                  position: 'fixed',
                  top: '10%',
                  left: '10%',
                  right: '10%',
                  bottom: '10%',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  zIndex: 11,
                  overflow: 'auto',
                }}
              >
                <IconButton onClick={handleClosePlantList} style={{ position: 'absolute', top: 10, right: 10 }} >
                  <CloseIcon />
                </IconButton>
                
                {sidebarOpen ? (
                <>
                  <Button onClick={handleBackToList} startIcon={<ArrowBackIcon />}>
                    一覧に戻る
                  </Button>
                  <div ref={sidebarRef}>
                    <PlantDetails 
                      plant={selectedPlant} 
                      isOpen={sidebarOpen} 
                      onClose={() => setSidebarOpen(false)} 
                    />
                  </div>  
                </>
              ) : (
                <>
                  <Typography variant="h5" gutterBottom>
                    {selectedShelf} の株一覧
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
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    
                      <TableBody>
                        {filteredPlants.map((plant) => (
                          <TableRow 
                            key={plant.plant_id} 
                            hover 
                            onClick={() => handlePlantClick(plant)} 
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
                </>
              )}
            </motion.div>
            </>
          )}
        </AnimatePresence>
        
      </div>
  );
};

export default PlantMain;
