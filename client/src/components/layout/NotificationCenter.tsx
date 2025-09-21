import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  X,
  CheckCheck,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/components/ui/notification";
import {
  useNotifications,
  getIconForNotification,
  type Notification as NotificationType,
} from "@/context/NotificationContext";

// Animasyonlu bildirimleri göstermek için bileşen (performans iyileştirmeli)
export const NotificationToaster: React.FC = () => {
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const [activeNotifications, setActiveNotifications] = useState<NotificationType[]>([]);
  
  // Otomatik bildirim temizleme için ref
  const timeoutsRef = useRef<{[key: string]: number}>({});
  
  // Yeni bildirimleri göster ve 5 saniye sonra otomatik gizle
  useEffect(() => {
    // Gereksiz filtreleme işlemlerini önlüyoruz (useEffect içinde useMemo kullanmak hata verir)
    const newNotifications = notifications.filter((notification) => !notification.read);
    
    // En fazla 3 aktif bildirim göster
    if (newNotifications.length > 0) {
      setActiveNotifications((prev) => [
        ...newNotifications.slice(0, 3),
        ...prev.filter(
          (p) => !newNotifications.some((n) => n.id === p.id)
        ),
      ].slice(0, 3));
      
      // Her yeni bildirim için otomatik temizleme zamanlayıcısı ayarlayalım
      newNotifications.forEach(notification => {
        // Önceki zamanlayıcıyı temizle
        if (timeoutsRef.current[notification.id]) {
          window.clearTimeout(timeoutsRef.current[notification.id]);
        }
        
        // 5 saniye sonra otomatik olarak kapat
        timeoutsRef.current[notification.id] = window.setTimeout(() => {
          handleClose(notification.id);
        }, 5000);
      });
    }
    
    // Temizleme işlevi
    return () => {
      // Tüm zamanlayıcıları temizle
      Object.values(timeoutsRef.current).forEach(timeoutId => {
        window.clearTimeout(timeoutId);
      });
    };
  }, [notifications, markAsRead]);
  
  // Bildirim kapatıldığında
  const handleClose = React.useCallback((id: string) => {
    markAsRead(id);
    setActiveNotifications((prev) => 
      prev.filter((notification) => notification.id !== id)
    );
    
    // Zamanlayıcıyı temizle
    if (timeoutsRef.current[id]) {
      window.clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, [markAsRead]);
  
  if (activeNotifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
      {activeNotifications.map((notification) => (
        <Notification
          key={notification.id}
          variant={notification.type}
          title={notification.title}
          description={notification.message}
          onClose={() => handleClose(notification.id)}
          actionIcon={notification.actionLink ? <ChevronRight className="h-4 w-4" /> : undefined}
          onAction={
            notification.actionLink
              ? () => {
                  window.location.href = notification.actionLink as string;
                  handleClose(notification.id);
                }
              : undefined
          }
          className="shadow-lg"
        />
      ))}
    </div>
  );
};

// Ana bildirim merkezi bileşeni
const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Bir bildirime tıklandığında - memoize ile performans artırıldı
  const handleNotificationClick = React.useCallback((notification: NotificationType) => {
    markAsRead(notification.id);
    if (notification.actionLink) {
      window.location.href = notification.actionLink;
    }
  }, [markAsRead]);
  
  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Bildirimleri zaman damgasına göre grupla (memoize ile performans iyileştirmesi)
  const groupNotificationsByDate = React.useCallback((notifications: NotificationType[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const groups: {
      [key: string]: NotificationType[];
    } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };
    
    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.date);
      notificationDate.setHours(0, 0, 0, 0);
      
      if (notificationDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notificationDate >= thisWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });
    
    return groups;
  }, []);
  
  // Hesaplanmış bildirimleri memoize ediyoruz - gereksiz yeniden hesaplamaları önlemek için
  const groupedNotifications = React.useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications, groupNotificationsByDate]
  );
  
  // Tek bir bildirim öğesi için memoize edilmiş bileşen
  // Bu bileşen, sadece kendi prop'ları değiştiğinde yeniden render olacak
  const NotificationItem = React.memo(
    ({ notification, onClick }: { notification: NotificationType; onClick: (notification: NotificationType) => void }) => (
      <DropdownMenuItem
        key={notification.id}
        className={`py-3 px-4 cursor-pointer focus:bg-gray-100/50 ${
          !notification.read ? "bg-blue-50/30" : ""
        }`}
        onClick={() => onClick(notification)}
      >
        <div className="flex items-start space-x-3 w-full">
          <div className="flex-shrink-0 mt-0.5">
            {getIconForNotification(notification)}
          </div>
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                {notification.title}
              </p>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {format(new Date(notification.date), "HH:mm", { locale: tr })}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
            {notification.actionText && notification.actionLink && (
              <div className="flex justify-end mt-1">
                <span className="text-xs text-primary font-medium flex items-center">
                  {notification.actionText}
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            )}
          </div>
        </div>
      </DropdownMenuItem>
    ),
    // Özel karşılaştırma fonksiyonu ile gereksiz render'ları önle
    (prevProps, nextProps) => {
      // Bu iki durumda yeniden render etme:
      // 1. ID değişmediyse ve 
      // 2. Okundu durumu değişmediyse
      return (
        prevProps.notification.id === nextProps.notification.id &&
        prevProps.notification.read === nextProps.notification.read
      );
    }
  );
  
  // Bildirimleri göster (memoize ile optimize edilmiş)
  const renderNotificationGroup = React.useCallback(
    (groupName: string, title: string, notifications: NotificationType[]) => {
      if (notifications.length === 0) return null;
      
      return (
        <div key={groupName}>
          <DropdownMenuLabel className="text-xs text-gray-500 font-normal py-1">{title}</DropdownMenuLabel>
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}
          <DropdownMenuSeparator />
        </div>
      );
    },
    [handleNotificationClick]
  );
  
  return (
    <div ref={menuRef} className="relative z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full"
            onClick={() => setOpen(!open)}
          >
            <Bell className="h-5 w-5 text-gray-700" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 bg-red-500 text-white h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
                variant="default"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 overflow-hidden p-0 bg-white/95 backdrop-blur-sm border-white/20 shadow-xl rounded-xl"
        >
          <div className="flex items-center justify-between bg-gray-50/80 backdrop-blur-sm px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Bell className="h-4 w-4 mr-2 text-primary" />
              Bildirimler
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary/10 text-primary border-none" variant="outline">
                  {unreadCount} yeni
                </Badge>
              )}
            </h3>
            <div className="flex space-x-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                  onClick={() => markAllAsRead()}
                  title="Tümünü okundu işaretle"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                  onClick={() => clearAllNotifications()}
                  title="Tümünü temizle"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {notifications.length > 0 ? (
              <>
                {renderNotificationGroup("today", "Bugün", groupedNotifications.today)}
                {renderNotificationGroup("yesterday", "Dün", groupedNotifications.yesterday)}
                {renderNotificationGroup("thisWeek", "Bu Hafta", groupedNotifications.thisWeek)}
                {renderNotificationGroup("older", "Daha Eski", groupedNotifications.older)}
              </>
            ) : (
              <div className="py-8 px-4 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Henüz bildirim yok</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-100 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-primary justify-center hover:bg-primary/5 text-xs font-normal"
            >
              Tüm Bildirimleri Gör
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationCenter;