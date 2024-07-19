import React, { useState, useEffect } from 'react';

const PlantDetails = ({ plant, isOpen, onClose }) => {
  if (!isOpen || !plant) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '300px',
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
      <p><strong>給水履歴:</strong></p>
    </div>
  );
};

export default PlantDetails;
