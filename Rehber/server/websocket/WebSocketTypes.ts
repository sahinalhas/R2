import { WebSocket, WebSocketServer } from "ws";

/**
 * WebSocket istemci bağlantısı için genişletilmiş arayüz
 */
export interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: number;
  connectionId?: string; // Benzersiz bağlantı tanımlayıcısı
}

/**
 * Bildirim tipleri
 */
export type NotificationType = "success" | "error" | "warning" | "info" | "default";

/**
 * Bildirim kategorileri
 */
export type NotificationCategory = "student" | "appointment" | "session" | "report" | "system" | "academic";

/**
 * Bildirim veri yapısı
 */
export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  id: string;
  category?: NotificationCategory;
  actionLink?: string;
  actionText?: string;
}

// WebSocket mesaj tiplerini tanımla
export enum MessageType {
  PING = "ping",
  PONG = "pong",
  SYSTEM = "system",
  NOTIFICATION = "notification"
}

/**
 * WebSocket mesaj yapısı
 */
export interface WebSocketMessage {
  type: string;
  data: any;
}