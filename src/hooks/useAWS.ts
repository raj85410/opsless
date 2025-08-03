import { useContext } from 'react';
import { AWSContext } from '../contexts/AWSContext';

export const useAWS = () => {
  const context = useContext(AWSContext);
  if (!context) {
    throw new Error('useAWS must be used within an AWSProvider');
  }
  return context;
}; 