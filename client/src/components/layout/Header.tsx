import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/context/ThemeContext";
import { 
  Search, 
  Bell, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  BarChart2, 
  Settings,
  LogOut,
  Sparkles,
  Brain,
  Heart,
  BellRing,
  User,
  GraduationCap,
  Clock,
  Loader2,
  ClipboardCheck
} from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import NotificationCenter from "@/components/layout/NotificationCenter";
import CommandPalette from "@/components/layout/CommandPalette";

const Header = () => {
  const [location] = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState({
    fullName: "Ali Has", // Varsayılan isim
    title: "Rehberlik Öğretmeni", // Varsayılan ünvan
    email: "ali.has@okul.edu.tr", // Varsayılan e-posta
    profilePhoto: "" // Profil fotoğrafı (boş olduğunda icon gösterilecek)
  });
  const [isLoading, setIsLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [_, navigate] = useLocation();
  
  // Kullanıcı bilgilerini getir
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/users/1/settings/personal");
        
        if (response.ok) {
          const data = await response.json();
          const profileData = {
            fullName: data.find((item: any) => item.settingKey === "fullName")?.settingValue || userProfile.fullName,
            title: data.find((item: any) => item.settingKey === "title")?.settingValue || userProfile.title,
            email: data.find((item: any) => item.settingKey === "email")?.settingValue || userProfile.email,
            profilePhoto: data.find((item: any) => item.settingKey === "profilePhoto")?.settingValue || userProfile.profilePhoto
          };
          
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri alınırken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    // Animasyon için mounted state'ini güncelle
    setMounted(true);
  }, []);
  
  // Öğrenci sayısını getir
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const response = await fetch("/api/students");
        if (response.ok) {
          const students = await response.json();
          setStudentCount(students.length);
        }
      } catch (error) {
        console.error("Öğrenci sayısı alınırken hata:", error);
      }
    };
    
    // Öğrenciler sayfasındaysa veya ana sayfadaysa öğrenci sayısını getir
    if (location.startsWith("/ogrenciler") || location === "/") {
      fetchStudentCount();
    }
  }, [location]);
  
  // Sayfanın başlığını ve simgesini belirle
  const getPageInfo = () => {
    switch (true) {
      case location === "/":
        return { 
          title: "Ana Sayfa", 
          icon: <LayoutDashboard className="w-6 h-6 mr-3 text-primary" />,
          color: "text-primary",
          gradient: "from-primary to-primary/70"
        };
      case location.startsWith("/ogrenciler"):
        return { 
          title: "Öğrenciler", 
          icon: <Users className="w-6 h-6 mr-3 text-blue-500" />,
          color: "text-blue-500",
          gradient: "from-blue-500 to-blue-400/70"
        };
      case location.startsWith("/randevular"):
        return { 
          title: "Randevular", 
          icon: <Calendar className="w-6 h-6 mr-3 text-amber-500" />,
          color: "text-amber-500",
          gradient: "from-amber-500 to-amber-400/70"
        };
      case location.startsWith("/gorusmeler"):
        return { 
          title: "Görüşme Kayıtları", 
          icon: <FileText className="w-6 h-6 mr-3 text-emerald-500" />,
          color: "text-emerald-500",
          gradient: "from-emerald-500 to-emerald-400/70"
        };
      case location.startsWith("/raporlar"):
        return { 
          title: "Raporlar", 
          icon: <BarChart2 className="w-6 h-6 mr-3 text-purple-500" />,
          color: "text-purple-500",
          gradient: "from-purple-500 to-purple-400/70"
        };
      case location.startsWith("/anketler"):
        return { 
          title: "Anketler", 
          icon: <ClipboardCheck className="w-6 h-6 mr-3 text-indigo-500" />,
          color: "text-indigo-500",
          gradient: "from-indigo-500 to-indigo-400/70"
        };
      case location.startsWith("/ayarlar"):
        return { 
          title: "Ayarlar", 
          icon: <Settings className="w-6 h-6 mr-3 text-gray-500" />,
          color: "text-gray-500",
          gradient: "from-gray-500 to-gray-400/70"
        };
      default:
        return { 
          title: "Rehberlik Servisi", 
          icon: <Brain className="w-6 h-6 mr-3 text-primary" />,
          color: "text-primary",
          gradient: "from-primary to-primary/70" 
        };
    }
  };

  const pageInfo = getPageInfo();
  
  // Bildirim verileri
  const notifications = [
    { 
      id: 1, 
      title: "Yeni randevu oluşturuldu", 
      description: "Ali Has için 14:30'da randevu oluşturuldu.",
      time: "5 dakika önce", 
      type: "info",
      icon: <Calendar className="w-5 h-5 text-primary" />
    },
    { 
      id: 2, 
      title: "Öğrenci görüşmesi", 
      description: "30 dakika içinde öğrenci g��rüşmesi başlayacak.",
      time: "30 dakika içinde", 
      type: "warning",
      icon: <BellRing className="w-5 h-5 text-amber-500" />
    },
    { 
      id: 3, 
      title: "Rapor talebi onaylandı", 
      description: "9-A sınıfı için oluşturduğunuz rapor onaylandı.",
      time: "2 saat önce", 
      type: "success",
      icon: <FileText className="w-5 h-5 text-emerald-500" />
    }
  ];
  
  // Arama işlemleri
  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    // Öğrenci numarasına göre arama yapıyoruz
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const students = await response.json();
        // Öğrenci numarasına göre öğrenciyi bul
        const foundStudent = students.find((student: any) => 
          student.studentNumber === searchValue.trim()
        );
        
        if (foundStudent) {
          // Öğrenci bulundu, detay sayfasına yönlendir
          navigate(`/ogrenciler/detay/${foundStudent.id}`);
          // Arama alanını temizle
          setSearchValue("");
          return;
        }
      }
    } catch (error) {
      console.error("Öğrenci arama hatası:", error);
    }
    
    // Öğrenci numarası bulunamadı veya hata oluştu, normal arama yap
    navigate(`/ogrenciler?q=${encodeURIComponent(searchValue.trim())}`);
  };
  
  // Enter tuşuna basıldığında arama yap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className={cn(
      "sticky top-0 backdrop-blur-xl px-5 py-4 z-30",
      "shadow-sm transition-all duration-500 ease-out border-b",
      mounted ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0",
      theme.appearance === 'dark' 
        ? "bg-gray-900/80 border-gray-800 text-gray-200" 
        : "bg-white/80 border-gray-100 text-gray-900"
    )}>
      <div className="flex justify-between items-center">
        {/* Sayfa başlığı */}
        <div className="flex items-center">
          <div className={cn(
            "hidden md:flex w-10 h-10 rounded-2xl bg-gradient-to-br items-center justify-center text-white mr-3",
            "shadow-lg relative group transform transition-all duration-500",
            theme.appearance === 'dark' ? "shadow-primary/5" : "shadow-primary/10",
            `${pageInfo.gradient}`,
            mounted ? "rotate-0" : "rotate-90"
          )}>
            <Brain className="w-5 h-5 group-hover:scale-110 transition-all duration-300" />
            <span className="absolute inset-0 rounded-2xl bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </div>
          {/* Mobile için sol boşluğu ayarla */}
          <div className="md:hidden w-8"></div>
          <div>
            <h1 className={cn(
              "text-lg font-bold tracking-tight mb-0.5 flex items-center",
              theme.appearance === 'dark' ? "text-white" : "text-neutral-900"
            )}>
              <span className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r",
                pageInfo.gradient
              )}>
                {pageInfo.title}
              </span>
              {location === "/" && (
                <GraduationCap className="ml-2 w-4 h-4 text-amber-500" />
              )}
            </h1>
            {location.startsWith("/randevular") && (
              <div className="flex items-center mt-0.5">
                <Badge className="badge-primary text-xs px-2.5 py-0.5 shadow-sm font-medium">
                  Bugün 1 randevu
                </Badge>
              </div>
            )}
            {location.startsWith("/ogrenciler") && (
              <div className="flex items-center mt-0.5">
                <Badge className="badge-secondary text-xs px-2.5 py-0.5 shadow-sm font-medium">
                  {studentCount > 0 ? `${studentCount} öğrenci` : "Yükleniyor..."}
                </Badge>
              </div>
            )}
            {location.startsWith("/anketler") && (
              <div className="flex items-center mt-0.5">
                <Badge className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 shadow-sm font-medium">
                  Yönetim
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Sağ taraf - Arama, bildirimler ve profil */}
        <div className="flex items-center space-x-3 sm:space-x-4">
        
          <div className="relative hidden md:block ml-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className={cn(
                "w-4 h-4",
                theme.appearance === 'dark' ? "text-gray-400" : "text-gray-400"
              )} />
            </div>
            <Input 
              type="text" 
              placeholder="Öğrenci No Ara..." 
              className={cn(
                "w-52 pl-9 pr-3 py-2 rounded-xl shadow-sm text-sm transition-all duration-300 focus:w-60",
                theme.appearance === 'dark' 
                  ? "bg-gray-800 border-gray-700 text-white focus:border-primary" 
                  : "bg-white border-gray-200 text-gray-900 focus:border-primary"
              )}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div 
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={handleSearch}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors duration-200",
                      theme.appearance === 'dark' 
                        ? "hover:bg-gray-700 text-gray-400 hover:text-white" 
                        : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                    )}>
                      <Search className="w-3.5 h-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Ara</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Tema değiştirme bileşeni */}
          <ThemeSwitcher className="flex" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-xl px-2 py-1.5",
                    theme.appearance === 'dark' ? "hover:bg-gray-800" : "hover:bg-gray-50"
                  )}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                  aria-label="Komut Paleti"
                >
                  <Search className="w-4 h-4" />
                  <span className="ml-2 hidden md:inline text-xs text-muted-foreground">Ctrl + K</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Komut Paleti (Ctrl + K)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Bildirim Merkezi */}
          <NotificationCenter />
          
          {/* Profil dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "relative rounded-xl px-2 py-1.5 transition-all duration-300",
                  "md:mr-0 mr-4", // Mobilde sağ boşluk ekle
                  theme.appearance === 'dark' 
                    ? "hover:bg-gray-800" 
                    : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-xl overflow-hidden shadow-md relative group",
                    "border-2",
                    theme.appearance === 'dark' 
                      ? "border-primary/30" 
                      : "border-primary/20"
                  )}>
                    {userProfile.profilePhoto ? (
                      <>
                        <img 
                          src={userProfile.profilePhoto} 
                          alt="Profil" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </>
                    ) : (
                      <div className={cn(
                        "flex items-center justify-center w-full h-full bg-gradient-to-br",
                        theme.appearance === 'dark' 
                          ? "from-gray-700 to-gray-800" 
                          : "from-gray-100 to-gray-200"
                      )}>
                        <User className={cn(
                          "w-4 h-4",
                          theme.appearance === 'dark' 
                            ? "text-gray-300" 
                            : "text-gray-600"
                        )} />
                      </div>
                    )}
                  </div>
                  <div className="ml-2 text-left hidden md:block">
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary mr-1" />
                        <span className={cn(
                          "text-xs",
                          theme.appearance === 'dark' ? "text-gray-400" : "text-gray-500"
                        )}>Yükleniyor...</span>
                      </div>
                    ) : (
                      <>
                        <p className={cn(
                          "text-sm font-medium",
                          theme.appearance === 'dark' ? "text-white" : "text-neutral-900"
                        )}>{userProfile.fullName}</p>
                        <p className={cn(
                          "text-xs",
                          theme.appearance === 'dark' ? "text-gray-400" : "text-gray-500"
                        )}>{userProfile.title}</p>
                      </>
                    )}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className={cn(
                "w-56 p-2 rounded-xl shadow-xl",
                theme.appearance === 'dark' 
                  ? "bg-gray-900 border-gray-800" 
                  : "bg-white border-gray-100"
              )}
            >
              <div className="py-3 px-3 flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl overflow-hidden shadow-md",
                  theme.appearance === 'dark' 
                    ? "border-2 border-gray-800" 
                    : "border-2 border-white"
                )}>
                  {userProfile.profilePhoto ? (
                    <img 
                      src={userProfile.profilePhoto} 
                      alt="Profil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={cn(
                      "flex items-center justify-center w-full h-full bg-gradient-to-br",
                      theme.appearance === 'dark' 
                        ? "from-gray-700 to-gray-800" 
                        : "from-gray-100 to-gray-200"
                    )}>
                      <User className={cn(
                        "w-6 h-6",
                        theme.appearance === 'dark' 
                          ? "text-gray-300" 
                          : "text-gray-600"
                      )} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-primary mr-1" />
                      <span className={cn(
                        "text-xs",
                        theme.appearance === 'dark' ? "text-gray-400" : "text-gray-500"
                      )}>Yükleniyor...</span>
                    </div>
                  ) : (
                    <>
                      <p className={cn(
                        "text-sm font-bold",
                        theme.appearance === 'dark' ? "text-white" : "text-neutral-900"
                      )}>{userProfile.fullName}</p>
                      <p className={cn(
                        "text-xs",
                        theme.appearance === 'dark' ? "text-gray-400" : "text-gray-500"
                      )}>{userProfile.email}</p>
                      <Badge 
                        variant="secondary" 
                        className="badge-primary py-0 px-1.5 text-[10px] mt-1 w-fit"
                      >
                        {userProfile.title}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator className={theme.appearance === 'dark' ? "my-2 bg-gray-800" : "my-2"} />
              
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className={cn(
                    "cursor-pointer text-sm py-2.5 px-3 rounded-lg transition-colors duration-200",
                    theme.appearance === 'dark' 
                      ? "hover:bg-gray-800 text-gray-200" 
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                  onClick={() => window.location.href = "/profilim"}
                >
                  <User className="w-4 h-4 mr-2.5" />
                  <span>Profilim</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "cursor-pointer text-sm py-2.5 px-3 rounded-lg transition-colors duration-200",
                    theme.appearance === 'dark' 
                      ? "hover:bg-gray-800 text-gray-200" 
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                  onClick={() => window.location.href = "/ayarlar?tab=app"}
                >
                  <Settings className="w-4 h-4 mr-2.5" />
                  <span>Ayarlar</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "cursor-pointer text-sm py-2.5 px-3 rounded-lg transition-colors duration-200",
                    theme.appearance === 'dark' 
                      ? "hover:bg-gray-800 text-gray-200" 
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <Heart className="w-4 h-4 mr-2.5 text-red-500" />
                  <span>Favoriler</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator className={theme.appearance === 'dark' ? "my-2 bg-gray-800" : "my-2"} />
              <DropdownMenuItem 
                className={cn(
                  "cursor-pointer text-sm py-2.5 px-3 rounded-lg text-red-500",
                  theme.appearance === 'dark' 
                    ? "hover:bg-red-900/20" 
                    : "hover:bg-red-50"
                )}
              >
                <LogOut className="w-4 h-4 mr-2.5 text-red-500" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CommandPalette />
    </header>
  );
};

export default Header;
