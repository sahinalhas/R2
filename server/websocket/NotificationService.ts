import { WebSocket } from "ws";
import { storage } from "../storage";
import { 
  MessageType, 
  NotificationCategory, 
  NotificationData, 
  NotificationType
} from "./WebSocketTypes";

/**
 * Tüm bağlı istemcilere bildirim gönder
 * @param notification Bildirim verisi
 * @returns Gönderilen istemci sayısı
 */
export function sendNotificationToAllClients(notification: NotificationData): number {
  const wss = (global as any).websocketServer;
  if (!wss) return 0;
  
  let sentCount = 0;
  
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify({
          type: MessageType.NOTIFICATION,
          data: notification
        }));
        sentCount++;
      } catch (error) {
        console.error('Bildirim gönderilirken hata:', error);
      }
    }
  });
  
  if (sentCount > 0) {
    console.log(`Bildirim ${sentCount} istemciye gönderildi`);
  }
  
  return sentCount;
}

/**
 * Bildirim oluştur ve gönder
 * @param type Bildirim tipi
 * @param title Bildirim başlığı
 * @param message Bildirim mesajı
 * @param category Bildirim kategorisi (opsiyonel)
 * @param actionLink İşlem bağlantısı (opsiyonel)
 * @param actionText İşlem metni (opsiyonel)
 */
export function createAndSendNotification(
  type: NotificationType,
  title: string,
  message: string,
  category?: NotificationCategory,
  actionLink?: string,
  actionText?: string
): void {
  // Bildirim verisini oluştur
  const notificationData: NotificationData = {
    type,
    title,
    message,
    date: new Date(),
    id: Date.now().toString(),
    category,
    actionLink,
    actionText
  };
  
  // WebSocket üzerinden tüm istemcilere gönder
  sendNotificationToAllClients(notificationData);
  
  // Aktivite olarak kaydet (opsiyonel)
  if (category && title && message) {
    storage.createActivity({
      type: category,
      description: `${title}: ${message}`,
      relatedId: null
    }).catch(err => console.error("Aktivite kaydedilirken hata:", err));
  }
}

