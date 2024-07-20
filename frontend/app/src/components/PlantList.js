import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Paper, 
  Typography,
  Button 
} from '@mui/material';

const PlantMain = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
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

    fetchPlants();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("clicked!")
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

  const handleRegisterPlant = (newPlant) => {
    // ここで新しい植物を登録するロジックを実装
    console.log('新しい植物を登録:', newPlant);
    setIsDialogOpen(false);
    // 必要に応じて植物リストを更新
  };
  
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
                <TableCell>ID</TableCell>
                <TableCell>場所</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell>状態</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plants.map((plant) => (
                <TableRow
                  key={plant.plant_id}
                  onClick={() => handlePlantClick(plant)}
                  hover
                  style={{ cursor: 'pointer' }}
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
        
        <div >
          <Button onClick={handleOpenDialog} style={{flex:0.1}}>株の新規登録</Button>
          <Button style={{flex:1}} >その他の情報</Button>
        </div>
        <PlantRegistrationDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onRegister={handleRegisterPlant}
        />
      </div>
      
      <motion.div 
        initial="closed"
        animate={sidebarOpen ? 'open' : 'closed'} 
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
      
    </div>
  );
};

export default PlantMain;
