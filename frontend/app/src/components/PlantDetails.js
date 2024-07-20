import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlantDetails = ({ plant, isOpen, onClose }) => {
  const [waterings, setWaterings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    if (!plant) return;
    const fetchWaterings = async () => {
      try {
        const response = await axios.get((`http://localhost:8080/api/watering-history`), {
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
    
    fetchWaterings();
  }, [plant]);
  
  if (!isOpen || !plant) return null;
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '450px',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
      overflowY: 'auto'
    }}>
      <button onClick={onClose} style={{ float: 'right' }}>閉じる</button>
      <h2>株の詳細</h2>
      <p><strong>ID:</strong> {plant.plant_id}</p>
      <p><strong>場所:</strong> {plant.shelf} - {plant.position}</p>
      <p><strong>登録日:</strong> {new Date(plant.entry_date).toLocaleDateString()}</p>
      <p><strong>状態:</strong> {plant.state_type || '未設定'}</p>
      <p><strong>給水履歴:</strong> {waterings?.length || 0}回</p>
      
      {waterings?.length > 0 &&
        <table>
        <thead>
          <tr>
            <th>給水日時</th>
            <th>肥料レシピID</th>
            <th>量</th>
            <th>追加情報</th>
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
      }
      
    </div>
  );
};

export default PlantDetails;
