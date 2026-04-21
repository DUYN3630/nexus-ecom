import { useContext } from 'react';
import { ConfirmDialogContext } from '../contexts/ConfirmDialogContext';

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (context === undefined) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};
