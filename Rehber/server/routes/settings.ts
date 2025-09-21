import { Express, Request, Response } from "express";
import { getDB } from "../db";
import { userSettings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export function registerSettingsRoutes(app: Express): void {
  // Kullanıcı ayarlarını kategoriye göre getir
  app.get("/api/users/:userId/settings/:category", async (req: Request, res: Response) => {
    try {
      const { userId, category } = req.params;
      const db = await getDB();
      
      const settings = await db.select()
        .from(userSettings)
        .where(
          and(
            eq(userSettings.userId, Number(userId)),
            eq(userSettings.settingCategory, category)
          )
        );
      
      return res.status(200).json(settings);
    } catch (error: any) {
      console.error("Ayarlar getirilirken hata:", error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  });

  // Kullanıcı ayarını güncelle veya ekle
  app.post("/api/users/:userId/settings/:category", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { settings, category } = req.body;
      const db = await getDB();
      
      if (!settings || !Array.isArray(settings)) {
        return res.status(400).json({ error: "Geçersiz ayar verileri" });
      }
      
      // Var olan ayarları temizle ve yenilerini ekle
      // Silme işlemi burada yapılmayacak, sadece güncellenecek veya eklenecek
      const results = [];
      
      for (const setting of settings) {
        const { key, value } = setting;
        
        // NOT NULL hatalarını önlemek için boş değerleri kontrol et
        const settingValue = value === null || value === undefined || value === "" ? "-" : value;
        
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
              // SQLite'da updatedAt field'ını kaldırdığımız için burada kullanmıyoruz
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
      console.error("Ayarlar kaydedilirken hata:", error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  });
}