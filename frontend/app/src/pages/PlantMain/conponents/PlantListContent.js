import React from 'react';
import { motion } from 'framer-motion';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PlantListContent = ({ onClose, children }) => {
  return (
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
      <IconButton 
        onClick={onClose} 
        style={{ position: 'absolute', top: 10, right: 10 }}
      >
        <CloseIcon />
      </IconButton>
      {children}
    </motion.div>
  );
};

export default PlantListContent;