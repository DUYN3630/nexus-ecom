import { createContext, useState, useCallback, useEffect } from 'react';

const BulkActionContext = createContext();

const BulkActionProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const toggleItemSelection = useCallback((item) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(item)) {
        return prevSelected.filter((i) => i !== item);
      } else {
        return [...prevSelected, item];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const showBulkActionBar = useCallback(() => setIsVisible(true), []);
  const hideBulkActionBar = useCallback(() => setIsVisible(false), []);

  // Update visibility based on selected items count
  useEffect(() => {
    if (selectedItems.length > 0) {
      showBulkActionBar();
    } else {
      hideBulkActionBar();
    }
  }, [selectedItems, showBulkActionBar, hideBulkActionBar]);

  const contextValue = {
    selectedItems,
    toggleItemSelection,
    clearSelection,
    isVisible,
    showBulkActionBar,
    hideBulkActionBar,
  };

  return (
    <BulkActionContext.Provider value={contextValue}>
      {children}
    </BulkActionContext.Provider>
  );
};

export { BulkActionContext, BulkActionProvider };
