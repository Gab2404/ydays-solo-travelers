import React, { createContext, useState, useContext } from 'react';

export const NavigationDirectionContext = createContext();

export const NavigationDirectionProvider = ({ children }) => {
  const [direction, setDirection] = useState('right');

  return (
    <NavigationDirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </NavigationDirectionContext.Provider>
  );
};

export const useNavigationDirection = () => useContext(NavigationDirectionContext);
