import { useState, useEffect, useRef, useCallback } from "react";

// Sunucu tarafındaki MessageType enum'ına uygun olarak tanımlanmış tipler
// Serverle tam tutarlı olması için import edilebilir ama şimdilik sadece tanımlıyoruz
export enum MessageType {
  PING = "ping",
  PONG = "pong",
  SYSTEM = "system",
  NOTIFICATION = "notification"
}

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  category?: string;
  actionLink?: string;
  actionText?: string;
}

// Bildirim işleyici tipini tanımla
export type NotificationHandler = (notification: NotificationData) => void;

// Yeniden bağlanma gecikme süreleri (ms cinsinden)
// Fibonacci sequence for exponential backoff with cap
const RECONNECT_DELAYS = [1000, 2000, 3000, 5000, 8000, 13000, 21000];
const MAX_RECONNECT_ATTEMPTS = 10; // Increase max reconnect attempts

export function useWebSocket(onNotification?: NotificationHandler) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isUnmountingRef = useRef(false);

  // WebSocket bağlantısını başlat veya yeniden bağlan
  const connect = useCallback(() => {
    // Eğer unmounting süreci başladıysa bağlanma
    if (isUnmountingRef.current) return;

    // Eğer zaten açık bir bağlantı varsa tekrar bağlanma
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Önceki bağlantıyı temizle
      if (socketRef.current) {
        try {
          socketRef.current.onopen = null;
          socketRef.current.onmessage = null;
          socketRef.current.onerror = null;
          socketRef.current.onclose = null;
          socketRef.current.close();
        } catch (e) {
          // Bağlantı zaten kapalıysa hata çıkabilir, görmezden gel
        }
      }

      // WebSocket URL'sini oluştur (http/https -> ws/wss)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // WebSocket bağlantısını oluştur
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Bağlantı olayları
      socket.onopen = () => {
        // Zaten bağlandıysak ve bu yeni bir bağlantıysa, tekrar log yapmayalım
        const isReconnect = reconnectAttemptsRef.current > 0;
        if (!isReconnect) {
          console.log("WebSocket bağlantısı açıldı");
        }
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0; // Bağlantı başarılı olduğunda deneme sayacını sıfırla
        
        // Bağlantı testi için ping gönder
        sendPing();
      };
      
      // Mesaj alımı
      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Mesaj türüne göre işleme
          switch (message.type) {
            case MessageType.PONG:
              // Pong mesajları için log gösterme (spam engellemek için)
              break;
              
            case MessageType.NOTIFICATION:
              if (message.data && onNotification) {
                onNotification({
                  type: message.data.type,
                  title: message.data.title,
                  message: message.data.message,
                  category: message.data.category,
                  actionLink: message.data.actionLink,
                  actionText: message.data.actionText
                });
              }
              console.log("Bildirim alındı:", message.data?.title);
              break;
              
            case MessageType.SYSTEM:
              console.log("Sistem mesajı:", message.data?.message);
              break;
              
            default:
              console.log("WebSocket mesajı alındı:", message);
          }
        } catch (err) {
          console.error("WebSocket mesajı işlenemedi:", err);
        }
      };
      
      // Bağlantı hatası
      socket.onerror = (event) => {
        console.error("WebSocket hatası:", event);
        setError("WebSocket bağlantı hatası");
      };
      
      // Bağlantı kapanması
      socket.onclose = (event) => {
        // Bileşen unmount oluyorsa yeniden bağlanma
        if (isUnmountingRef.current) return;

        // Normal kapanma kodları için sessize geç, sadece hata durumlarında log kaydet
        if (event.code !== 1000 && event.code !== 1001) {
          console.log(`WebSocket bağlantısı anormal şekilde kapandı: Kod=${event.code}, Sebep=${event.reason}`);
        }
        
        setIsConnected(false);
        
        // Temiz kapatma durumu (1000) veya sayfada yönlendirme (1001) dışında yeniden bağlan
        if (event.code !== 1000 && event.code !== 1001) {
          scheduleReconnect();
        }
      };
    } catch (err) {
      console.error("WebSocket bağlantısı kurulamadı:", err);
      setError(`WebSocket bağlantısı kurulamadı: ${err}`);
      setIsConnected(false);
      scheduleReconnect();
    }
  }, [onNotification]);

  // İyileştirilmiş yeniden bağlanma planlaması
  const scheduleReconnect = useCallback(() => {
    // Eğer sayfa artık görünür değilse (sekme arka planda kaldıysa) yeniden bağlanmayı ertele
    if (document.visibilityState === 'hidden') {
      // Görünürlük değişikliğini bir kez dinle ve sayfa görünür olduğunda yeniden bağlan
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // Dinleyiciyi bir kere çalıştıktan sonra kaldır
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          reconnectAttemptsRef.current = 0; // Sayaç sıfırla
          connect();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return;
    }
    
    // Önceki planlanmış yeniden bağlanmayı temizle
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Maksimum deneme sayısını aşmadıysak yeniden bağlan
    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
      const delayIndex = Math.min(reconnectAttemptsRef.current, RECONNECT_DELAYS.length - 1);
      const delay = RECONNECT_DELAYS[delayIndex];
      
      // Sadece her iki yeniden bağlanma denemesinde log yap (gereksiz logları azaltmak için)
      if (reconnectAttemptsRef.current % 2 === 0) {
        console.log(`WebSocket yeniden bağlanıyor... Deneme: ${reconnectAttemptsRef.current + 1}, ${delay}ms sonra`);
      }
      
      reconnectTimeoutRef.current = window.setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        // Ağ bağlantısı kontrolü ekle
        if (navigator.onLine) {
          connect();
        } else {
          // Cihaz çevrimdışıysa, çevrimiçi olana kadar bekle
          const handleOnline = () => {
            window.removeEventListener('online', handleOnline);
            connect();
          };
          window.addEventListener('online', handleOnline);
        }
      }, delay);
    } else {
      console.log("WebSocket yeniden bağlanma denemelerinde maksimum sayıya ulaşıldı.");
      // 1 dakika sonra sıfırlanacak ve yeniden başlayacak
      reconnectTimeoutRef.current = window.setTimeout(() => {
        reconnectAttemptsRef.current = 0;
        connect();
      }, 60000);
    }
  }, [connect]);

  // Periyodik ping gönderme
  const sendPing = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: MessageType.PING, data: { message: "Ping" } }));
    }
  }, []);

  // WebSocket bağlantısını başlat ve bağlantı durumunu izle
  useEffect(() => {
    isUnmountingRef.current = false;
    
    // Sayfa tam olarak yüklendikten sonra bağlan 
    // Bu, birçok eşzamanlı bağlantı isteğini önler
    const initTimeout = setTimeout(() => {
      connect();
    }, 500);
    
    // 45 saniyede bir ping gönder (sunucu 60 saniyede kontrol ediyor)
    const pingInterval = setInterval(sendPing, 45000);
    
    // URL değişikliklerini dinle
    const handleUrlChange = () => {
      // Sayfa değiştiğinde WebSocket bağlantısını korur
      // ancak bağlantı kesilmişse yeniden bağlanır
      if (socketRef.current?.readyState !== WebSocket.OPEN && !isUnmountingRef.current) {
        connect();
      }
    };
    
    // URL değişikliği olayını dinle (SPA yönlendirmelerini izlemek için)
    window.addEventListener('popstate', handleUrlChange);
    
    // Bileşen unmount olduğunda
    return () => {
      isUnmountingRef.current = true;
      
      // İlk bağlantı zaman aşımını temizle
      clearTimeout(initTimeout);
      
      // Ping zamanlayıcısını temizle
      clearInterval(pingInterval);
      
      // URL değişikliği dinleyicisini kaldır
      window.removeEventListener('popstate', handleUrlChange);
      
      // Yeniden bağlanma zamanlayıcısını temizle
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Açık bağlantıyı kapat
      if (socketRef.current) {
        try {
          // Tüm olay işleyicilerini temizle
          socketRef.current.onopen = null;
          socketRef.current.onmessage = null; 
          socketRef.current.onerror = null;
          socketRef.current.onclose = null; // Kapanma olayını devre dışı bırak, yeniden bağlanmaya çalışmasın
          
          // Bağlantıyı kapat
          socketRef.current.close(1000, "Normal shutdown");
        } catch (e) {
          // Hataları görmezden gel
        }
      }
    };
  }, [connect, sendPing]);
  
  // Mesaj gönderme fonksiyonu
  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
      return true;
    }
    return false;
  }, []);
  
  return {
    isConnected,
    error,
    sendMessage
  };
}