import { Express, Request, Response } from "express";
import { getDB } from "../db";
import { userSettings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export function registerLessonHoursRoutes(app: Express): void {
  // Ders saati ayarlarını getir
  app.get("/api/users/:userId/settings/lessonHours", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const db = await getDB();
      
      const settings = await db.select()
        .from(userSettings)
        .where(
          and(
            eq(userSettings.userId, Number(userId)),
            eq(userSettings.settingCategory, "lessonHours")
          )
        );
      
      return res.status(200).json(settings);
    } catch (error: any) {
      console.error("Ders saati ayarları getirilirken hata:", error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  });

  // Ders saati ayarlarını güncelle veya ekle
  app.post("/api/users/:userId/settings/lessonHours", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { settings, category } = req.body;
      const db = await getDB();
      
      if (!settings || !Array.isArray(settings)) {
        return res.status(400).json({ error: "Geçersiz ayar verileri" });
      }
      
      // Var olan ayarları güncelle veya yenilerini ekle
      const results = [];
      
      for (const setting of settings) {
        const { key, value } = setting;
        
        // JSON verisi olduğu için string kontrolünü biraz daha farklı yapalım
        const settingValue = value !== undefined ? value : "[]";
        
        // Ayarın mevcut olup olmadığını kontrol et
        const existingSetting = await db.select()
          .from(userSettings)
          .where(
            and(
              eq(userSettings.userId, Number(userId)),
              eq(userSettings.settingKey, key),
              eq(userSettings.settingCategory, category)
            )
          );
        
        if (existingSetting.length > 0) {
          // Mevcut ayarı güncelle
          const updatedSetting = await db.update(userSettings)
            .set({ 
              settingValue: settingValue,
              createdAt: new Date().toISOString()
            })
            .where(
              and(
                eq(userSettings.userId, Number(userId)),
                eq(userSettings.settingKey, key),
                eq(userSettings.settingCategory, category)
              )
            )
            .returning();
          
          results.push(updatedSetting[0]);
        } else {
          // Yeni ayar ekle
          const newSetting = await db.insert(userSettings)
            .values({
              userId: Number(userId),
              settingKey: key,
              settingValue: settingValue,
              settingCategory: category,
              createdAt: new Date().toISOString()
            })
            .returning();
          
          results.push(newSetting[0]);
        }
      }
      
      return res.status(200).json(results);
    } catch (error: any) {
      console.error("Ders saati ayarları kaydedilirken hata:", error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  });
}