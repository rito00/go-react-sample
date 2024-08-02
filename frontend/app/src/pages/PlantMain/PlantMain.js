import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiAxios from '../../api/axios';
import Header from './conponents/Header';
import ShelfGrid from './conponents/ShelfGrid';
import PlantListOverlay from './conponents/PlantListOverlay';
import PlantTable from './conponents/PlantTable';
import PlantDetails from './conponents/PlantDetails';
import PlantRegistrationDialog from './conponents/PlantRegistrationDialog';

import { 
  Typography,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ENDPOINTS } from '../../api/endpoints';

const PlantMain = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [plants, setPlants] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const [showPlantList, setPlantListOpen] = useState(false);
  const [showPlantDetail, setSidebarOpen] = useState(false);
  const [showPlantRegisrationDialog, setIsDialogOpen] = useState(false);
  const [showShelfMakingDialog, setShelfMakingDialog] = useState(false);
  const plantDetailRef = useRef(null);
  
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
    if (plantDetailRef.current && !plantDetailRef.current.contains(event.target)) {
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
  
    if (sortConfig.key === null) {
      // 初期ソート（階層→位置→登録日の順で降順）
      sortablePlants.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        if (a.position !== b.position) return a.position - b.position;
        return new Date(a.entry_date) - new Date(b.entry_date);
      });
    } else {
      // ユーザーが選択したソート設定のみを適用
      sortablePlants.sort((a, b) => {
        if (sortConfig.key === 'entry_date') {
          // 日付の場合は特別な比較を行う
          return sortConfig.direction === 'asc' 
            ? new Date(a.entry_date) - new Date(b.entry_date)
            : new Date(b.entry_date) - new Date(a.entry_date);
        } else {
          // 数値や文字列の場合の一般的な比較
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
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
    <div>
      <Header onOpenDialog={handleOpenDialog} />

      {/* 棚のタイル表示 */}
      <ShelfGrid shelves={shelves} selectedShelf={selectedShelf} onShelfClick={handleShelfClick} />
      
      {/* 株一覧オーバーレイ */}
      <PlantListOverlay isOpen={showPlantList} onClose={handleClosePlantList}>
        {showPlantDetail ? (
          <>
            <Button onClick={handleBackToList} startIcon={<ArrowBackIcon />}>
              一覧に戻る
            </Button>
            <div ref={plantDetailRef}>
              <PlantDetails 
                plant={selectedPlant} 
                isOpen={showPlantDetail} 
                onClose={() => setSidebarOpen(false)} 
              />
            </div>  
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              {selectedShelf} の株一覧
            </Typography>
            <PlantTable
              columns={columns}
              plants={filteredPlants}
              sortConfig={sortConfig}
              onSort={handleSort}
              onPlantClick={handlePlantClick}
            />
          </>
        )}
      </PlantListOverlay>
      
      {/* 新規株登録ダイアログ */}
      <PlantRegistrationDialog
        isOpen={showPlantRegisrationDialog}
        onClose={handleCloseDialog}
        onRegister={handleRegisterPlant}
      />
    </div>
  );
};

export default PlantMain;
