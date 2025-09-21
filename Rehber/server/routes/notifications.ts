import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { createAndSendNotification } from "../websocket";

export function registerNotificationRoutes(app: Express): void {
  // Bildirim gönder
  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notificationSchema = z.object({
        type: z.string(),
        title: z.string(),
        message: z.string(),
        category: z.string().optional(),
        link: z.string().optional(),
        linkText: z.string().optional()
      });
      
      const result = notificationSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const { type, title, message, category, link, linkText } = result.data;
      
      // Bildirim gönder
      const notificationData = createAndSendNotification(
        type,
        title,
        message,
        category || "system",
        link,
        linkText
      );
      
      // Aktivite olarak kaydedilebilir
      if (category && title && message) {
        await storage.createActivity({
          type: category,
          description: `${title}: ${message}`
        });
      }
      
      res.status(201).json(notificationData);
    } catch (error) {
      console.error("Bildirim gönderirken hata:", error);
      res.status(500).json({ message: "Bildirim gönderilirken bir hata oluştu." });
    }
  });
}