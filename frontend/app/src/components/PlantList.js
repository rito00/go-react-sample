import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PlantDetails from './PlantDetails';
import { motion } from 'framer-motion';

const PlantList = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;
  
  const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: '-100%' },
  };
  
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <h1>いちごの株一覧</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>場所</th>
              <th>登録日</th>
              <th>状態</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr 
                key={plant.plant_id} 
                onClick={() => handlePlantClick(plant)} 
                style={{ cursor: 'pointer' }}
                className="plant-row"
              >
                <td>{plant.plant_id}</td>
                <td>{`${plant.shelf} - ${plant.position}`}</td>
                <td>{new Date(plant.entry_date).toLocaleDateString()}</td>
                <td>{plant.state_type || '未設定'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <motion.div animate={sidebarOpen ? 'open' : 'closed'} variants={variants}>
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

export default PlantList;
