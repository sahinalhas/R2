import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from "react";
import { 
  File, Calendar, Bell, MessageSquare, AlertTriangle, 
  CheckCircle, Info, User
} from "lucide-react";
import { useWebSocket, type NotificationHandler, type NotificationData } from "@/hooks/use-websocket";

// Bildirim türleri
export type NotificationType = "success" | "error" | "warning" | "info" | "default";

// Bildirim nesnesi için arayüz
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionLink?: string;
  actionText?: string;
  icon?: React.ReactNode;
  read?: boolean;
  date: Date;
  category?: "student" | "appointment" | "session" | "report" | "system";
}

// Bildirim bağlamı için arayüz
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

// Eylem türleri
type NotificationAction =
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_ALL" }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" };

// Bildirim bağlamını oluştur
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Bildirim indirgeyici
const notificationReducer = (state: Notification[], action: NotificationAction): Notification[] => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return [action.payload, ...state];
    case "REMOVE_NOTIFICATION":
      return state.filter((notification) => notification.id !== action.payload);
    case "CLEAR_ALL":
      return [];
    case "MARK_AS_READ":
      return state.map((notification) =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
    case "MARK_ALL_AS_READ":
      return state.map((notification) => ({ ...notification, read: true }));
    default:
      return state;
  }
};

// Kategori/tür için simge alma
export const getIconForNotification = (notification: Notification): React.ReactNode => {
  // Kullanıcı tanımlı simge varsa onu kullan
  if (notification.icon) return notification.icon;
  
  // Kategori temelli simge
  switch (notification.category) {
    case "student":
      return <User className="h-5 w-5 text-blue-500" />;
    case "appointment":
      return <Calendar className="h-5 w-5 text-purple-500" />;
    case "session":
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    case "report":
      return <File className="h-5 w-5 text-amber-500" />;
    case "system":
      return <Bell className="h-5 w-5 text-gray-500" />;
    default:
      // Tür temelli simge
      switch (notification.type) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case "error":
          return <AlertTriangle className="h-5 w-5 text-red-500" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        case "info":
          return <Info className="h-5 w-5 text-blue-500" />;
        default:
          return <Bell className="h-5 w-5 text-gray-500" />;
      }
  }
};

// Benzersiz ID oluşturma yardımcı fonksiyonu
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Bildirim sağlayıcısı
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);
  
  // Bildirim ekle
  const addNotification = (notification: Omit<Notification, "id" | "date" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      date: new Date(),
      read: false,
    };
    dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });
  };
  
  // WebSocket'ten gelen bildirimleri işle
  const handleWebSocketNotification: NotificationHandler = (wsNotification) => {
    // WebSocket'ten gelen bildirimi bizim formata dönüştür
    addNotification({
      type: (wsNotification.type || "default") as NotificationType,
      title: wsNotification.title,
      message: wsNotification.message,
      category: wsNotification.category as any, // tip dönüşümü
      actionLink: wsNotification.actionLink,
      actionText: wsNotification.actionText,
    });
  };
  
  // WebSocket bağlantısını kur ve bildirim alıcı fonksiyonu geçir
  const { isConnected, error: wsError } = useWebSocket(handleWebSocketNotification);
  
  // İlk bağlantı ve hata durumları için referansları oluştur
  const isFirstConnection = useRef<boolean>(true);
  const hasShownError = useRef<boolean>(false);
  
  // WebSocket durumunu göster ve bağlantı hatalarını yönet
  useEffect(() => {
    // Gereksiz tekrarlanan logları önlemek için referansları kullan
    
    if (wsError && !hasShownError.current) {
      console.error("WebSocket bağlantı hatası:", wsError);
      hasShownError.current = true;
    }
    
    if (isConnected) {
      // Bağlantı tekrar kurulduğunda hata gösterimini sıfırla
      hasShownError.current = false;
      
      // Sadece ilk bağlantıda log göster
      if (isFirstConnection.current) {
        console.log("WebSocket bağlantısı başarılı");
        isFirstConnection.current = false;
      }
    }
  }, [isConnected, wsError]);
  
  // Okunmamış bildirimleri hesapla
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  // Bildirim kaldır
  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  // Tüm bildirimleri temizle
  const clearAllNotifications = () => {
    dispatch({ type: "CLEAR_ALL" });
  };

  // Okundu olarak işaretle
  const markAsRead = (id: string) => {
    dispatch({ type: "MARK_AS_READ", payload: id });
  };

  // Tümünü okundu olarak işaretle
  const markAllAsRead = () => {
    dispatch({ type: "MARK_ALL_AS_READ" });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        clearAllNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Bildirim bağlamını kullanmak için hook
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

// Örnek bildirimleri oluşturma yardımcı fonksiyonları
export const createSuccessNotification = (title: string, message: string, category?: Notification["category"]) => ({
  type: "success" as NotificationType,
  title,
  message,
  category,
});

export const createErrorNotification = (title: string, message: string, category?: Notification["category"]) => ({
  type: "error" as NotificationType,
  title,
  message,
  category,
});

export const createWarningNotification = (title: string, message: string, category?: Notification["category"]) => ({
  type: "warning" as NotificationType,
  title,
  message,
  category,
});

export const createInfoNotification = (title: string, message: string, category?: Notification["category"]) => ({
  type: "info" as NotificationType,
  title,
  message,
  category,
});