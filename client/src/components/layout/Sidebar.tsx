import { useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart, 
  Settings,
  Sparkles,
  Brain,
  BookOpenCheck,
  LineChart,
  HelpCircle,
  ClipboardCheck,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Component ilk yüklendiğinde animate-in sınıfını ekle
  useEffect(() => {
    setMounted(true);
  }, []);

  // Route'a göre aktif ikonu belirle
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={cn(
      "hidden md:flex flex-col items-center w-20 py-8",
      "border-r transition-all duration-500 ease-out relative z-10",
      "backdrop-blur-sm shadow-lg",
      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
      theme.appearance === 'dark' 
        ? "bg-gray-900/95 border-gray-800/70 text-gray-200" 
        : "bg-white/95 border-gray-100/70 text-gray-900"
    )}>
      <div className="mb-10 flex flex-col items-center">
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:shadow-primary/30 transform hover:scale-105 transition-all duration-300 hover:rotate-3">
          <Brain className="w-6 h-6" />
          <div className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center",
            "ring-[2.5px] ring-white/90 shadow-md",
            theme.appearance === 'dark' ? "ring-gray-900/90" : "ring-white/90"
          )}>
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-semibold mt-2 tracking-wider",
          theme.appearance === 'dark' ? "text-gray-400" : "text-gray-500"
        )}>REHBER</span>
      </div>
      
      <div className="flex flex-col space-y-3 items-center w-full px-2">
        <SidebarIcon 
          icon={<Home className="w-5 h-5" />} 
          tooltip="Ana Sayfa" 
          active={isActive("/")}
          onClick={() => setLocation("/")} 
        />
        
        <SidebarIcon 
          icon={<Users className="w-5 h-5" />} 
          tooltip="Öğrenciler" 
          active={isActive("/ogrenciler")}
          onClick={() => setLocation("/ogrenciler")} 
        />
        
        <SidebarIcon 
          icon={<Calendar className="w-5 h-5" />} 
          tooltip="Randevular" 
          active={isActive("/randevular")}
          onClick={() => setLocation("/randevular")} 
        />
        
        <SidebarIcon 
          icon={<MessageSquare className="w-5 h-5" />} 
          tooltip="Görüşme Kayıtları" 
          active={isActive("/gorusmeler")}
          onClick={() => setLocation("/gorusmeler")} 
        />
        
        <SidebarIcon 
          icon={<BarChart className="w-5 h-5" />} 
          tooltip="Raporlar" 
          active={isActive("/raporlar")}
          onClick={() => setLocation("/raporlar")} 
        />

        <SidebarIcon 
          icon={<ClipboardCheck className="w-5 h-5" />} 
          tooltip="Anketler" 
          active={isActive("/anketler")}
          onClick={() => setLocation("/anketler")} 
        />
        
        <div className={cn(
          "w-12 h-px my-1",
          theme.appearance === 'dark' ? "bg-gray-800" : "bg-gray-100"
        )}></div>
        
        <SidebarIcon
          icon={<LineChart className="w-5 h-5" />}
          tooltip="İstatistikler"
          active={isActive("/istatistikler")}
          onClick={() => setLocation("/istatistikler")}
        />
      </div>
      
      <div className="mt-auto space-y-3 w-full px-2">
        <SidebarIcon 
          icon={<HelpCircle className="w-5 h-5" />} 
          tooltip="Yardım" 
          active={isActive("/yardim")}
          onClick={() => alert("Yardım sayfası yakında eklenecek")} 
        />
        
        <SidebarIcon 
          icon={<Settings className="w-5 h-5" />} 
          tooltip="Ayarlar" 
          active={isActive("/ayarlar")}
          onClick={() => setLocation("/ayarlar")} 
        />
      </div>
    </div>
  );
};

interface SidebarIconProps {
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const SidebarIcon = ({ 
  icon, 
  tooltip, 
  active = false, 
  onClick, 
  className = "" 
}: SidebarIconProps) => {
  const { theme } = useTheme();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center justify-center h-11 w-11 rounded-xl cursor-pointer",
              "transition-all duration-300 ease-out relative group",
              "border overflow-hidden",
              active 
                ? "bg-gradient-to-br from-primary to-primary/90 text-white shadow-xl shadow-primary/30 border-primary/10" 
                : theme.appearance === 'dark'
                  ? "text-gray-300 hover:text-primary/90 hover:bg-primary/10 hover:shadow-lg hover:border-primary/20 border-transparent"
                  : "text-gray-600 hover:text-primary/90 hover:bg-primary/5 hover:shadow-md hover:border-primary/20 border-transparent",
              active ? "scale-110" : "hover:scale-105",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-t-full after:scale-x-0",
              active 
                ? "after:bg-amber-300 after:scale-x-70 after:origin-center" 
                : "after:bg-primary/40 hover:after:scale-x-40 after:origin-center",
              "after:transition-transform after:duration-300 after:ease-out",
              className
            )}
            onClick={onClick}
          >
            {/* Hover efekti */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )}></div>
            
            {/* İkon */}
            <span className={cn(
              "relative transition-all duration-300 ease-out z-10",
              active ? "-translate-y-0.5" : "group-hover:-translate-y-0.5"
            )}>
              {icon}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className={cn(
            "text-xs font-medium border-none rounded-xl backdrop-blur-sm shadow-xl py-1.5 px-3",
            theme.appearance === 'dark'
              ? "bg-gray-800/90 text-white"
              : "bg-gray-900/90 text-white"
          )}
          sideOffset={8}
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Sidebar;
