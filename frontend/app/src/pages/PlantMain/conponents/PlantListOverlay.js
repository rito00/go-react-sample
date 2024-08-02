import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlantListContent from './PlantListContent';

const PlantListOverlay = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'black',
              zIndex: 10,
            }}
            onClick={onClose}
          />
          <PlantListContent onClose={onClose}>
            {children}
          </PlantListContent>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlantListOverlay;