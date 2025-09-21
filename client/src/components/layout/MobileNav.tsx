import { useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  PlusCircle, 
  ClipboardCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

// Ana menü öğeleri (5 adet ile sınırlayın)
const tabs = [
  { icon: <Home className="w-5 h-5" />, label: "Ana Sayfa", path: "/" },
  { icon: <Users className="w-5 h-5" />, label: "Öğrenciler", path: "/ogrenciler" },
  { icon: <Calendar className="w-5 h-5" />, label: "Randevular", path: "/randevular" },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Görüşmeler", path: "/gorusmeler" },
  { icon: <Settings className="w-5 h-5" />, label: "Ayarlar", path: "/ayarlar" },
];

// Yeni Eylem öğeleri
const actionItems = [
  { icon: <Users className="w-5 h-5" />, label: "Yeni Öğrenci", path: "/ogrenciler?new=true" },
  { icon: <Calendar className="w-5 h-5" />, label: "Yeni Randevu", path: "/randevular?new=true" },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Yeni Görüşme", path: "/gorusmeler?new=true" },
  { icon: <ClipboardCheck className="w-5 h-5" />, label: "Yeni Anket", path: "/anketler/olustur" }
];

const MobileNav = () => {
  const [location, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [showNewActionMenu, setShowNewActionMenu] = useState(false);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  
  // Component ilk yüklendiğinde animate-in sınıfını ekle
  useEffect(() => {
    setMounted(true);
    
    // Scroll event listener to hide/show tab bar
    const handleScroll = () => {
      if (!tabBarRef.current) return;
      
      const currentScrollY = window.scrollY;
      const prevScrollY = (tabBarRef.current as any).prevScrollY || 0;
      
      if (currentScrollY > prevScrollY && currentScrollY > 100) {
        // Scrolling down, hide the tab bar
        tabBarRef.current.style.transform = "translateY(100%)";
      } else {
        // Scrolling up, show the tab bar
        tabBarRef.current.style.transform = "translateY(0)";
      }
      
      (tabBarRef.current as any).prevScrollY = currentScrollY;
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Route'a göre aktif ikonu belirle
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // Tema durumunu al
  const { theme } = useTheme();
  
  // Handle double tap on tabs for extra actions
  const handleTabClick = (path: string) => {
    const now = Date.now();
    
    if (lastTap && now - lastTap < 300) {
      // Double tap detected
      if (path === location) {
        // Double tapped the current tab - scroll to top or refresh
        window.scrollTo({ top: 0, behavior: "smooth" });
        
        // Show a small spark animation
        if (tabBarRef.current) {
          const sparkEl = document.createElement("div");
          sparkEl.className = "absolute pointer-events-none";
          sparkEl.style.top = "-20px";
          sparkEl.style.left = "50%";
          sparkEl.style.transform = "translateX(-50%)";
          sparkEl.innerHTML = `<div class="text-primary animate-ping duration-700"><span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></span></div>`;
          tabBarRef.current.appendChild(sparkEl);
          
          setTimeout(() => {
            sparkEl.remove();
          }, 700);
        }
      }
      setLastTap(null);
    } else {
      setLastTap(now);
      setLocation(path);
    }
  };

  return (
    <>
      {/* Artı Butonu (Sağ alt köşede) */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          animate={{ 
            rotate: showNewActionMenu ? 135 : 0,
            boxShadow: showNewActionMenu 
              ? "0 0 15px 5px rgba(var(--color-primary), 0.3)" 
              : "0 10px 25px -5px rgba(var(--color-primary), 0.3)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-primary text-white",
            "transition-all duration-300"
          )}
          onClick={() => setShowNewActionMenu(!showNewActionMenu)}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="sr-only">Yeni Ekle</span>
        </motion.button>
      </div>
      
      {/* Tab Bar */}
      <motion.div 
        ref={tabBarRef}
        initial={{ y: 100 }}
        animate={{ y: mounted ? 0 : 100 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          duration: 0.5 
        }}
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-40",
          "flex items-center justify-around border-t px-2",
          theme.appearance === 'dark' 
            ? "bg-gray-900/95 backdrop-blur-lg border-gray-800 text-white" 
            : "bg-white/95 backdrop-blur-lg border-gray-100 text-gray-800",
          "transition-transform duration-300 ease-out h-16"
        )}
      >
        {/* Tüm Ana Sekmeler */}
        {tabs.map((tab) => (
          <Tab
            key={tab.path}
            icon={tab.icon}
            label={tab.label}
            active={isActive(tab.path)}
            onClick={() => handleTabClick(tab.path)}
          />
        ))}
      </motion.div>
      
      {/* Yeni eylem menüsü */}
      <AnimatePresence>
        {showNewActionMenu && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowNewActionMenu(false)}
            />
            
            {/* Action menu items grid */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="grid grid-cols-2 gap-3 w-full">
                {actionItems.map((action, idx) => (
                  <motion.div
                    key={action.path}
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{ 
                      delay: idx * 0.05,
                      type: "spring",
                      stiffness: 260, 
                      damping: 20
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "w-full rounded-xl py-3 px-3",
                        "shadow-md bg-primary text-white",
                        "relative overflow-hidden flex flex-col items-center gap-2"
                      )}
                      onClick={() => {
                        setLocation(action.path);
                        setShowNewActionMenu(false);
                      }}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary-700 to-primary-400 opacity-80"></div>
                      
                      {/* Icon */}
                      <div className="relative z-10 bg-white/20 rounded-full p-2">
                        {action.icon}
                      </div>
                      
                      {/* Label */}
                      <span className="text-xs font-medium relative z-10">{action.label}</span>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

interface TabProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const Tab = ({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: TabProps) => {
  const { theme } = useTheme();
  
  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center justify-center py-1.5 w-16"
      onClick={onClick}
    >
      <div className="relative">
        {/* Background pulsing circle for active tabs */}
        {active && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: [0, 0.7, 1]
            }}
            transition={{ duration: 0.4 }}
            className={cn(
              "absolute w-10 h-10 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              theme.appearance === 'dark'
                ? "bg-primary/10"
                : "bg-primary/5"
            )}
          />
        )}
        
        {/* Icon Container */}
        <motion.div 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "transition-all duration-200 relative z-10",
            active
              ? "text-primary"
              : theme.appearance === 'dark'
                ? "text-gray-500"
                : "text-gray-400"
          )}
        >
          <motion.div
            animate={{ 
              y: active ? [0, -3, 0] : 0,
              scale: active ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.4,
              type: active ? "spring" : "tween",
              stiffness: 300,
              damping: 10,
            }}
          >
            {icon}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Indicator Line */}
      <div className="h-0.5 w-6 my-1 mx-auto relative">
        {active && (
          <motion.div 
            layoutId="tabIndicator"
            className="absolute inset-0 bg-primary rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
      
      {/* Label */}
      <span className={cn(
        "text-[10px] font-medium transition-all",
        active
          ? "text-primary scale-105"
          : theme.appearance === 'dark'
            ? "text-gray-500"
            : "text-gray-500"
      )}>
        {label}
      </span>
    </motion.button>
  );
};

export default MobileNav;