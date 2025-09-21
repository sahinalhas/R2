import { useEffect } from "react";
import { useLocation } from "wouter";
import SettingsLayout from "./settings/SettingsLayout";

const Settings = () => {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // URL'den tab parametresini alma
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    
    // Eski URL formatından (query param) yeni URL formatına (path param) geçiş
    if (tabParam) {
      setLocation(`/ayarlar/${tabParam}`);
    } else {
      // Tab belirtilmemişse varsayılan olarak app sekmesine yönlendir
      setLocation('/ayarlar/app');
    }
  }, []);

  return (
    <SettingsLayout />
  );
};

export default Settings;