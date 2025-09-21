import { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Laptop, 
  Palette, 
  CircleOff, 
  CheckCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useTheme, predefinedThemes, ThemeVariant } from '@/context/ThemeContext';

interface Props {
  className?: string;
}

const ThemeSwitcher = ({ className }: Props) => {
  const { theme, setTheme, applyTheme, toggleAppearance, toggleVariant } = useTheme();
  const [radiusValue, setRadiusValue] = useState(theme.radius);

  // Türkçe görünüm adları
  const appearanceLabels = {
    'light': 'Açık Tema',
    'dark': 'Koyu Tema',
    'system': 'Sistem Teması'
  };

  // Türkçe varyant adları
  const variantLabels: Record<ThemeVariant, string> = {
    'professional': 'Profesyonel',
    'tint': 'Hafif Tonlu',
    'vibrant': 'Canlı'
  };

  // Renkler için Türkçe isimler
  const colorLabels: Record<string, string> = {
    'purple': 'Mor',
    'violet': 'Menekşe',
    'blue': 'Mavi',
    'skyblue': 'Gök Mavisi',
    'green': 'Yeşil',
    'teal': 'Turkuaz',
    'red': 'Kırmızı',
    'orange': 'Turuncu'
  };

  // Görünüm simgesini belirle
  const getAppearanceIcon = () => {
    switch (theme.appearance) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Laptop className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  // Radius değişikliklerini uygula ve lokalda sakla
  const handleRadiusChange = (value: number[]) => {
    const radius = value[0];
    setRadiusValue(radius);
    setTheme({ radius });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "relative h-8 w-8 rounded-xl p-0",
            theme.appearance === 'dark' 
              ? 'bg-gray-800 text-amber-400 hover:bg-gray-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            className
          )}
        >
          {getAppearanceIcon()}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-2 rounded-xl shadow-xl border-gray-100">
        <DropdownMenuLabel className="text-sm font-medium px-3 py-2 border-b border-gray-50 mb-1">
          Tema Ayarları
        </DropdownMenuLabel>
        
        {/* Görünüm (Light/Dark/System) */}
        <div className="flex gap-4 px-3 py-2">
          <div 
            className={cn(
              "flex flex-1 items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer",
              theme.appearance === 'light' 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "border-gray-100 text-gray-600"
            )}
            onClick={() => setTheme({ appearance: 'light' })}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="text-xs">Açık</span>
          </div>
          
          <div 
            className={cn(
              "flex flex-1 items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer",
              theme.appearance === 'dark' 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "border-gray-100 text-gray-600"
            )}
            onClick={() => setTheme({ appearance: 'dark' })}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="text-xs">Koyu</span>
          </div>
          
          <div 
            className={cn(
              "flex flex-1 items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer",
              theme.appearance === 'system' 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "border-gray-100 text-gray-600"
            )}
            onClick={() => setTheme({ appearance: 'system' })}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="text-xs">Sistem</span>
          </div>
        </div>
        
        <div className="px-3 py-2 border-t border-b border-gray-50 my-1">
          {/* Renk seçimi */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Ana Renk</div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(predefinedThemes).map(([name, settings]) => (
                <div
                  key={name}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 relative cursor-pointer",
                    theme.primary === settings.primary ? "border-white ring-2 ring-offset-1 ring-primary/30" : "border-gray-50"
                  )}
                  style={{ 
                    backgroundColor: settings.primary
                  }}
                  onClick={() => applyTheme(name)}
                >
                  {theme.primary === settings.primary && (
                    <CheckCheck className="w-3 h-3 absolute inset-0 m-auto text-white" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Stil seçimi ve Köşe yuvarlaklığı */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 mb-2">Stil</div>
              <div className="flex gap-1">
                {Object.entries(variantLabels).map(([variant, label]) => (
                  <div 
                    key={variant}
                    className={cn(
                      "cursor-pointer text-xs px-2 py-1 border rounded-md flex-1 text-center",
                      theme.variant === variant 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "border-gray-100 text-gray-600"
                    )}
                    onClick={() => setTheme({ variant: variant as ThemeVariant })}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 mb-2">Köşe: {radiusValue.toFixed(1)}</div>
              <Slider
                value={[radiusValue]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={handleRadiusChange}
              />
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-1" />
        
        {/* Varsayılan ayarlara döndür */}
        <DropdownMenuItem
          className="cursor-pointer text-xs py-2 px-3 rounded-lg hover:bg-gray-50 flex justify-between items-center"
          onClick={() => setTheme({
            primary: 'hsl(255 80% 50%)',
            variant: 'vibrant',
            appearance: 'light',
            radius: 1.0
          })}
        >
          <span>Varsayılan Ayarlara Dön</span>
          <CircleOff className="w-3.5 h-3.5 text-gray-400" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;