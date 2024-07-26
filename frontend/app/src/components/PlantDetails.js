import React, { useState, useEffect } from 'react';
import './styles.css'
import apiAxios from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

const PlantDetails = ({ plant, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [waterings, setWaterings] = useState([]);
  const [stateHistory, setStateHistory] = useState([]);
  
  useEffect(() => {
    if (!plant) return;
    const fetchWaterings = async () => {
      try {
        const response = await apiAxios.get((ENDPOINTS.WATERING_HISTORY), {
          params: { plant_id: plant.plant_id }
        });
        setWaterings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('エラーが発生しました。データを取得できませんでした。');
        setLoading(false);
      }
    };
    
    const fetchStateHistory = async () => {
      try {
        const response = await apiAxios.get((ENDPOINTS.STATE_HISTORY), {
          params: { plant_id: plant.plant_id }
        });
        setStateHistory(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('エラーが発生しました。データを取得できませんでした。');
        setLoading(false);
      } 
    }
    
    fetchWaterings();
    fetchStateHistory();
  }, [plant]);
  
  if (!isOpen || !plant) return null;
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;


  return (
    <div className="plant-details">
      <button onClick={onClose} className="close-button">閉じる</button>
      <h2>株の詳細</h2>
      <div className="plant-info">
        <p><strong>ID:</strong> {plant.plant_id}</p>
        <p><strong>場所:</strong> {plant.shelf} - {plant.position}</p>
        <p><strong>登録日:</strong> {new Date(plant.entry_date).toLocaleDateString()}</p>
        <p><strong>状態:</strong> {plant.state_type || '未設定'}</p>
        <p><strong>給水履歴:</strong> {waterings?.length || 0}回</p>
      
        {waterings?.length > 0 && (
          <div className="table-container">
            <table className="watering-table">
              <thead>
                <tr>
                  <th>給水日時</th>
                  <th>肥料レシピ</th>
                  <th>量</th>
                  <th>備考</th>
                </tr>
              </thead>
              <tbody>
                {waterings.map((watering, index) => (
                  <tr key={index}>
                    <td>{new Date(watering.watering_date).toLocaleString()}</td>
                    <td>{watering.fertilizer_recipe_name}</td>
                    <td>{watering.amount}</td>
                    <td>{watering.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p><strong>状態履歴</strong></p>
        {stateHistory?.length > 0 && 
          <div className="table-container">
            <table className="watering-table">
              <thead>
                <tr>
                  <th>日時</th>
                  <th>状態</th>
                  <th>収穫量</th>
                </tr>
              </thead>
              <tbody>
                {stateHistory.map((state, index) => (
                  <tr key={index}>
                    <td>{new Date(state.state_date).toLocaleString()}</td>
                    <td>{state.state_type}</td>
                    <td>{state.state_type && state.state_type === 'harvested'? state.harvest_weight : '-'}</td> 
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
};

export default PlantDetails;
