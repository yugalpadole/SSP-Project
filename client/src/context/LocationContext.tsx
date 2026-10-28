import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Locality {
  name: string;
  pincode: string;
  city: string;
}

export const POPULAR_LOCALITIES: Locality[] = [
  { name: 'Yevalewadi', pincode: '411048', city: 'Pune' },
  { name: 'Khadakwasla', pincode: '411024', city: 'Pune' },
  { name: 'Wagholi', pincode: '412207', city: 'Pune' },
  { name: 'Uruli Kanchan', pincode: '412202', city: 'Pune' },
  { name: 'Undri & Pisoli', pincode: '411060', city: 'Pune' },
  { name: 'Pirangut', pincode: '412115', city: 'Pune' },
  { name: 'Alandi Rural', pincode: '412105', city: 'Pune' },
  { name: 'Dhayari Gaon', pincode: '411041', city: 'Pune' },
  { name: 'Khed Shivapur', pincode: '412205', city: 'Pune' },
  { name: 'Saswad Rural', pincode: '412301', city: 'Pune' },
];

interface LocationContextType {
  currentLocality: Locality;
  setLocality: (loc: Locality) => void;
  isPickerOpen: boolean;
  setIsPickerOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocality, setCurrentLocality] = useState<Locality>(() => {
    try {
      const saved = localStorage.getItem('ebazaar_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically migrate if previous location was from Bengaluru
        if (parsed.city === 'Bengaluru' || parsed.name === 'Koramangala') {
          return POPULAR_LOCALITIES[0];
        }
        return parsed;
      }
      return POPULAR_LOCALITIES[0];
    } catch {
      return POPULAR_LOCALITIES[0];
    }
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ebazaar_location', JSON.stringify(currentLocality));
  }, [currentLocality]);

  return (
    <LocationContext.Provider
      value={{
        currentLocality,
        setLocality: setCurrentLocality,
        isPickerOpen,
        setIsPickerOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
