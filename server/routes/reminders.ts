import type { Express, Request, Response } from "express";
import { services } from "../services";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertReminderSchema } from "@shared/schema";

export function registerReminderRoutes(app: Express): void {
  // Tüm hatırlatıcıları getir
  app.get("/api/reminders", async (_req: Request, res: Response) => {
    try {
      const reminders = await services.reminder.getReminders();
      res.json(reminders);
    } catch (error) {
      console.error("Hatırlatıcılar alınırken hata:", error);
      res.status(500).json({ message: "Hatırlatıcılar alınırken bir hata oluştu." });
    }
  });

  // Belirli bir randevu için hatırlatıcıları getir
  app.get("/api/reminders/appointment/:appointmentId", async (req: Request, res: Response) => {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const reminders = await services.reminder.getRemindersByAppointment(appointmentId);
      res.json(reminders);
    } catch (error) {
      console.error("Hatırlatıcılar alınırken hata:", error);
      res.status(500).json({ message: "Hatırlatıcılar alınırken bir hata oluştu." });
    }
  });

  // Yeni hatırlatıcı oluştur
  app.post("/api/reminders", async (req: Request, res: Response) => {
    try {
      const result = insertReminderSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      const newReminder = await services.reminder.createReminder(result.data);
      res.status(201).json(newReminder);
    } catch (error) {
      res.status(500).json({ message: "Hatırlatıcı oluşturulurken bir hata oluştu." });
    }
  });

  // Hatırlatıcı durumunu güncelle
  app.put("/api/reminders/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Durum (status) alanı gereklidir." });
      }
      
      // Servis katmanı üzerinden hatırlatıcı durumunu güncelle
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const updatedReminder = await services.reminder.updateReminderStatus(id, status);
      
      if (!updatedReminder) {
        return res.status(404).json({ message: "Hatırlatıcı bulunamadı." });
      }
      
      res.json(updatedReminder);
    } catch (error) {
      res.status(500).json({ message: "Hatırlatıcı durumu güncellenirken bir hata oluştu." });
    }
  });

  // Hatırlatıcıyı sil
  app.delete("/api/reminders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Servis katmanı üzerinden hatırlatıcı sil
      // Bu, aktivite kaydı ve bildirim gönderme işlemlerini de içerir
      const success = await services.reminder.deleteReminder(id);
      
      if (!success) {
        return res.status(404).json({ message: "Hatırlatıcı bulunamadı." });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Hatırlatıcı silinirken bir hata oluştu." });
    }
  });
}
