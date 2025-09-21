import { WebSocket } from "ws";
import { ExtendedWebSocket, MessageType, WebSocketMessage } from "./WebSocketTypes";

/**
 * Yeni WebSocket bağlantısını yönet
 * @param ws WebSocket bağlantısı
 */
export function handleConnection(ws: ExtendedWebSocket): void {
  // Ek veri ekleyerek bağlantıyı tanımlayalım
  ws.connectionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  
  console.log('Yeni WebSocket bağlantısı kuruldu');
  
  // Bağlantıyı aktif olarak işaretle
  ws.isAlive = true;
  
  // Hoş geldiniz mesajı gönder
  sendSystemMessage(ws, 'WebSocket bağlantısı kuruldu');
  
  // Gelen mesajları işle
  ws.on('message', (message) => handleMessage(ws, message));
  
  // Bağlantı kapandığında
  ws.on('close', (code) => {
    // Normal kapatma kodları için loglama yapma
    if (code !== 1000 && code !== 1001) {
      console.log(`WebSocket bağlantısı kapandı (${ws.connectionId}), Kod: ${code}`);
    }
    ws.isAlive = false;
  });
  
  // Pong yanıtını işle (heartbeat için)
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Hataları işle
  ws.on('error', (error) => {
    console.error(`WebSocket bağlantı hatası (${ws.connectionId}):`, error);
    ws.isAlive = false;
  });
}

/**
 * Gelen WebSocket mesajlarını işle
 * @param ws WebSocket bağlantısı
 * @param message Gelen mesaj
 */
export function handleMessage(ws: ExtendedWebSocket, message: any): void {
  try {
    const data = JSON.parse(message.toString()) as WebSocketMessage;
    
    // Gereksiz konsol çıktısını azaltmak için ping mesajlarını loglamıyoruz
    if (data.type !== MessageType.PING) {
      console.log('WebSocket mesajı alındı:', data);
    }
    
    // Mesaj tiplerini işle
    switch (data.type) {
      case MessageType.PING:
        // Pong ile yanıt ver
        ws.send(JSON.stringify({
          type: MessageType.PONG,
          data: { 
            message: 'Pong',
            timestamp: new Date()
          }
        }));
        break;
        
      // Gerekirse buraya başka mesaj tipi işleyicileri eklenebilir
        
      default:
        console.log('Bilinmeyen mesaj tipi:', data.type);
    }
  } catch (error) {
    console.error('WebSocket mesajı işlenemedi:', error);
  }
}

/**
 * Tüm istemcilere ping gönder ve bağlantı durumlarını kontrol et
 * İyileştirilmiş versiyon: Bağlantının durumunu daha toleranslı kontrol eder
 */
export function pingAllClients(): void {
  const wss = (global as any).websocketServer;
  if (!wss) return;
  
  // Sadece 3+ bağlantı varsa loglama yap (gereksiz logları azaltmak için)
  if (wss.clients.size > 2) {
    console.log(`Aktif WebSocket bağlantıları kontrol ediliyor (${wss.clients.size} bağlantı)`);
  }
  
  // Bağlantı yoksa işlem yapma
  if (wss.clients.size === 0) return;
  
  wss.clients.forEach((ws: WebSocket) => {
    const extWs = ws as ExtendedWebSocket;
    
    try {
      // Eğer bağlantı zaten kapalıysa veya kapanma durumunda ise
      if (ws.readyState !== WebSocket.OPEN) {
        return; // Bu bağlantıyı atla
      }
      
      // Yanıt vermeyen bağlantıları kapat
      if (extWs.isAlive === false) {
        console.log('Yanıt vermeyen bağlantı kapatılıyor');
        return extWs.terminate();
      }
      
      // Pong alınana kadar inaktif olarak işaretle
      extWs.isAlive = false;
      // Ping gönder
      extWs.ping();
    } catch (error) {
      console.error('Ping gönderirken hata:', error);
      try {
        extWs.terminate(); // Hatalı bağlantıyı sonlandır
      } catch (e) {
        // Zaten kapanmış olabilir, yoksay
      }
    }
  });
}

/**
 * Belirli bir istemciye sistem mesajı gönder
 * @param ws WebSocket bağlantısı
 * @param message Mesaj içeriği
 */
export function sendSystemMessage(ws: WebSocket, message: string): void {
  try {
    // Bağlantı hala açık mı kontrol et
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: MessageType.SYSTEM,
        data: {
          message,
          date: new Date()
        }
      }));
      console.log('WebSocket bağlantısı başarılı');
    } else {
      // Bağlantı açık değilse sessizce çık
      console.log('WebSocket bağlantısı açık değil, mesaj gönderilemedi');
    }
  } catch (error) {
    console.error('Sistem mesajı gönderilirken hata:', error);
  }
}

/**
 * Aktif bağlantıları periyodik olarak logla
 */
export function logActiveConnections(): void {
  const wss = (global as any).websocketServer;
  if (wss && wss.clients.size > 0) {
    console.log(`Aktif WebSocket bağlantıları: ${wss.clients.size}`);
  }
}