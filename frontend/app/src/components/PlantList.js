import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlantList = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
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
            <tr key={plant.plant_id}>
              <td>{plant.plant_id}</td>
              <td>{`${plant.shelf} - ${plant.position}`}</td>
              <td>{new Date(plant.entry_date).toLocaleDateString()}</td>
              <td>{plant.state_type || '未設定'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlantList;
