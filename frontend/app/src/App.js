import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './common/components/Sidebar';
import PlantMain from './pages/PlantMain/PlantMain';
import Settings from './pages/Settings/Settings';

const App = () => {
  const [currentView, setCurrentView] = useState('home');

  const handleViewChange = (view) => {
    setCurrentView(view);
  }
  
  return (
    <Box sx={{ display: 'flex' }}>
    <Sidebar onViewChange={handleViewChange} />
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        p: 3, 
        width: 'calc(100% - 50px)', // サイドバーの幅を引いた残りの幅
        position: 'relative', // オーバーレイの基準位置
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh'
      }}
    >
      {currentView === 'home' && <PlantMain />}
      {currentView === 'settings' && <Settings />}
    </Box>
  </Box>
  );
}

export default App;