import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// Tema türleri
export type ThemeColor = string;
export type ThemeVariant = 'professional' | 'tint' | 'vibrant';
export type ThemeAppearance = 'light' | 'dark' | 'system';

// Tema nesnesi, vite-plugin-shadcn-theme-json yapısına uygun
export interface ThemeSettings {
  primary: ThemeColor;
  variant: ThemeVariant;
  appearance: ThemeAppearance;
  radius: number;
}

// Önceden tanımlanmış temalar - Profesyonel ve premium görünüm için zenginleştirilmiş palet
export const predefinedThemes: Record<string, Partial<ThemeSettings>> = {
  // Premium mavi tonları
  royalBlue: { primary: 'hsl(224 76% 48%)' }, // Ana tema - Prestij ve güven
  sapphire: { primary: 'hsl(210 85% 45%)' },  // Derin ve zengin mavi
  azure: { primary: 'hsl(205 80% 50%)' },     // Canlı, yüksek kontrast mavi
  
  // Prestij ve lüks renk tonları
  emerald: { primary: 'hsl(160 84% 39%)' },   // Prestijli yeşil ton
  amethyst: { primary: 'hsl(270 70% 55%)' },  // Zarif mor ton
  ruby: { primary: 'hsl(350 75% 50%)' },      // Güçlü kırmızı ton
  
  // Profesyonel tonlar
  graphite: { primary: 'hsl(215 25% 27%)' },  // Profesyonel koyu gri-mavi
  teal: { primary: 'hsl(187 72% 42%)' },      // Modern ve profesyonel
  amber: { primary: 'hsl(36 100% 50%)' },     // Sıcak, enerji dolu
  
  // Özel premium tonlar
  cobalt: { primary: 'hsl(215 70% 35%)' },    // Prestijli koyu mavi
  crimson: { primary: 'hsl(345 83% 41%)' },   // Asil ve göz alıcı
};

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (newTheme: Partial<ThemeSettings>) => void;
  applyTheme: (themeName: string) => void;
  toggleAppearance: () => void;
  toggleVariant: () => void;
}

// Varsayılan tema ayarları - Prestijli ve profesyonel
const defaultTheme: ThemeSettings = {
  primary: 'hsl(224 76% 48%)', // Royal Blue - yarışma için seçilen prestijli ton
  variant: 'vibrant',          // Canlı varyant modern görünüm sağlar
  appearance: 'light',         // Varsayılan olarak aydınlık mod
  radius: 0.7,                 // Daha modern köşe yuvarlaması
};

// Context oluştur
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Context Provider bileşeni
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);

  // Tarayıcı ortamında olup olmadığımızı kontrol et
  const isBrowser = typeof window !== 'undefined';

  // Temayı localStorage'dan al
  useEffect(() => {
    if (!isBrowser) return;

    try {
      const savedTheme = window.localStorage.getItem('user-theme');
      if (savedTheme) {
        setThemeState(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Tema yüklenirken hata oluştu:', error);
    }
  }, [isBrowser]);

  // Tema değişikliklerini localStorage'a kaydet ve theme.json'a uygula
  useEffect(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.setItem('user-theme', JSON.stringify(theme));

      // theme.json dosyasını güncelle (vite-plugin-shadcn-theme-json kullandığımız için)
      // Bu işlem tarayıcıda localStorage'a kaydedilecek ve sayfa yenilendiğinde tema uygulanacak
      window.localStorage.setItem('theme-settings-json', JSON.stringify(theme));
    } catch (error) {
      console.error('Tema kaydedilirken hata oluştu:', error);
    }
  }, [theme, isBrowser]);

  // Temayı güncelle
  const setTheme = (newTheme: Partial<ThemeSettings>) => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      ...newTheme
    }));
  };

  // Hazır temayı uygula
  const applyTheme = (themeName: string) => {
    if (predefinedThemes[themeName]) {
      setTheme(predefinedThemes[themeName]);
    }
  };

  // Aydınlık/karanlık mod değişimi
  const toggleAppearance = () => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      appearance: prevTheme.appearance === 'light' ? 'dark' : 'light'
    }));
  };

  // Varyant değişimi (professional, tint, vibrant)
  const toggleVariant = () => {
    setThemeState(prevTheme => {
      const variants: ThemeVariant[] = ['professional', 'tint', 'vibrant'];
      const currentIndex = variants.indexOf(prevTheme.variant);
      const nextIndex = (currentIndex + 1) % variants.length;
      return {
        ...prevTheme,
        variant: variants[nextIndex]
      };
    });
  };

  const value = {
    theme,
    setTheme,
    applyTheme,
    toggleAppearance,
    toggleVariant
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook oluştur
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};