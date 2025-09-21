import { Server } from "http";
import { WebSocketServer } from "ws";
import { handleConnection, logActiveConnections, pingAllClients } from "./ConnectionManager";

// Temizleme için interval referansları
let heartbeatInterval: NodeJS.Timeout | null = null;
let connectionLoggerInterval: NodeJS.Timeout | null = null;

/**
 * HTTP sunucusuna bağlı WebSocket sunucusu kurulumu
 * @param httpServer HTTP sunucusu
 * @returns WebSocketServer örneği
 */
export function setupWebSocketServer(httpServer: Server): WebSocketServer {
  // WebSocket sunucusu örneği oluştur
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true
  });
  
  // Global değişkene ata
  Object.assign(global, { websocketServer: wss });
  
  // Yeni bağlantıları işle
  wss.on('connection', handleConnection);
  
  // Bağlantı sağlık kontrolü için heartbeat aralığını başlat (her 60 saniyede bir)
  // Daha uzun süre verdik, bağlantı yükünü azaltmak için
  heartbeatInterval = setInterval(() => pingAllClients(), 60000);
  
  // Aktif bağlantıları periyodik olarak logla
  // Log miktarını azaltmak için 3 dakikada bir yapıyoruz
  connectionLoggerInterval = setInterval(() => logActiveConnections(), 180000);
  
  // Sunucu kapandığında interval'leri temizle
  wss.on('close', () => {
    cleanupIntervals();
  });
  
  return wss;
}

/**
 * WebSocket bağlantılarını kapat ve kaynakları temizle
 */
export function shutdownWebSocketServer(): void {
  cleanupIntervals();
  
  const wss = (global as any).websocketServer;
  
  if (wss) {
    wss.clients.forEach((client: any) => {
      try {
        client.terminate();
      } catch (err) {
        console.error('WebSocket bağlantısı kapatılırken hata:', err);
      }
    });
    
    wss.close((err: Error | undefined) => {
      if (err) {
        console.error('WebSocket sunucusu kapatılırken hata:', err);
      } else {
        console.log('WebSocket sunucusu başarıyla kapatıldı');
      }
    });
    
    (global as any).websocketServer = null;
  }
}

/**
 * Interval'leri temizle
 */
function cleanupIntervals(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  if (connectionLoggerInterval) {
    clearInterval(connectionLoggerInterval);
    connectionLoggerInterval = null;
  }
}