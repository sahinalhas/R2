import type { Express, Request, Response } from "express";
import { services } from "../services";

/**
 * Aktivite rotalarını kaydet
 * @param app Express uygulaması 
 */
export function registerActivityRoutes(app: Express): void {
  // Tüm aktiviteleri getir
  app.get("/api/activities", async (_req: Request, res: Response) => {
    try {
      const activities = await services.activity.getActivities();
      res.json(activities);
    } catch (error) {
      console.error("Aktiviteler alınırken hata:", error);
      res.status(500).json({ message: "Aktiviteler alınırken bir hata oluştu." });
    }
  });
}