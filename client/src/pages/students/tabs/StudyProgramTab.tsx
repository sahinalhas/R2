import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Save, Trash2, CalendarDays, Clock, ListChecks, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";

// Types
type ScheduleBlock = {
  id: string;
  dayOfWeek: number; // 0=Pt .. 6=Pa (we'll use Monday as 0)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  course: string;    // e.g., "Matematik (TYT)"
};

type Topic = {
  name: string;
  minutes: number; // total minutes required
};

type TopicPlanEntry = {
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  course: string;
  topic: string;
  allocated: number; // minutes allocated in this slot
  remaining: number; // minutes remaining for the topic after this slot
};

interface StudyProgramTabProps {
  studentId: number;
}

const days = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"]; // Monday-first

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

const StudyProgramTab = ({ studentId }: StudyProgramTabProps) => {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [topicsByCourse, setTopicsByCourse] = useState<Record<string, Topic[]>>({});
  const [plan, setPlan] = useState<TopicPlanEntry[]>([]);
  const [saving, setSaving] = useState(false);

  // Load settings from server (userId=1)
  useEffect(() => {
    const load = async () => {
      try {
        const [studyRes, topicsRes, planRes] = await Promise.all([
          fetch(`/api/users/1/settings/studyPlan`),
          fetch(`/api/users/1/settings/studyTopics`),
          fetch(`/api/users/1/settings/topicPlan`),
        ]);

        if (studyRes.ok) {
          const settings = await studyRes.json();
          const key = `studyPlan:student:${studentId}`;
          const item = settings.find((s: any) => s.settingKey === key);
          if (item?.settingValue) setBlocks(JSON.parse(item.settingValue));
        }
        if (topicsRes.ok) {
          const settings = await topicsRes.json();
          const item = settings.find((s: any) => s.settingKey === "studyTopics");
          if (item?.settingValue) setTopicsByCourse(JSON.parse(item.settingValue));
        }
        if (planRes.ok) {
          const settings = await planRes.json();
          const key = `topicPlan:student:${studentId}`;
          const item = settings.find((s: any) => s.settingKey === key);
          if (item?.settingValue) setPlan(JSON.parse(item.settingValue));
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [studentId]);

  // Seed defaults if empty (Math/Fizik example)
  useEffect(() => {
    if (!topicsByCourse || Object.keys(topicsByCourse).length === 0) {
      const seed: Record<string, Topic[]> = {
        "Matematik (TYT)": [
          { name: "Sayılar", minutes: 60 },
          { name: "Problemler", minutes: 540 },
        ],
        "Fizik (AYT)": [
          { name: "Elektrik", minutes: 120 },
          { name: "Manyetizma", minutes: 90 },
        ],
      };
      setTopicsByCourse(seed);
    }
  }, [topicsByCourse]);

  // Validate overlaps per day
  const hasOverlap = useMemo(() => {
    const byDay: Record<number, ScheduleBlock[]> = {};
    blocks.forEach(b => {
      byDay[b.dayOfWeek] = byDay[b.dayOfWeek] || [];
      byDay[b.dayOfWeek].push(b);
    });
    for (const day in byDay) {
      const arr = byDay[day as any].slice().sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      for (let i = 1; i < arr.length; i++) {
        const prevEnd = timeToMinutes(arr[i - 1].endTime);
        const curStart = timeToMinutes(arr[i].startTime);
        if (curStart < prevEnd) return true;
      }
    }
    return false;
  }, [blocks]);

  // Handlers
  const addBlock = () => {
    const id = crypto.randomUUID();
    setBlocks(prev => [...prev, { id, dayOfWeek: 0, startTime: "09:00", endTime: "10:30", course: "Matematik (TYT)" }]);
  };
  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));
  const updateBlock = (id: string, patch: Partial<ScheduleBlock>) => setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));

  const saveAll = async () => {
    if (hasOverlap) {
      toast({ title: "Çakışma var", description: "Aynı günde saat çakışmaları var.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const settings = [
        { key: `studyPlan:student:${studentId}`, value: JSON.stringify(blocks) },
        { key: "studyTopics", value: JSON.stringify(topicsByCourse) },
        { key: `topicPlan:student:${studentId}`, value: JSON.stringify(plan) },
      ];
      const [r1, r2, r3] = await Promise.all([
        fetch(`/api/users/1/settings/studyPlan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings, category: "studyPlan" }) }),
        fetch(`/api/users/1/settings/studyTopics`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: [{ key: "studyTopics", value: JSON.stringify(topicsByCourse) }], category: "studyTopics" }) }),
        fetch(`/api/users/1/settings/topicPlan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: [{ key: `topicPlan:student:${studentId}`, value: JSON.stringify(plan) }], category: "topicPlan" }) }),
      ]);
      if (!r1.ok || !r2.ok || !r3.ok) throw new Error("Kaydetme başarısız");
      toast({ title: "Kaydedildi", description: "Çalışma programı ve konular kaydedildi." });
    } catch (e: any) {
      toast({ title: "Hata", description: e.message || "Kaydetme sırasında sorun oluştu", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Topic planning engine: map weekly schedule to next 14 days
  const generatePlan = () => {
    if (blocks.length === 0) {
      toast({ title: "Blok yok", description: "Önce haftalık ders blokları ekleyin.", variant: "destructive" });
      return;
    }
    // Deep clone topic backlog per course
    const backlog: Record<string, { name: string; remaining: number }[]> = {};
    Object.entries(topicsByCourse).forEach(([course, arr]) => {
      backlog[course] = arr.map(t => ({ name: t.name, remaining: t.minutes }));
    });

    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const horizon = 14; // next 14 days
    const result: TopicPlanEntry[] = [];

    for (let d = 0; d < horizon; d++) {
      const date = addDays(start, d);
      const dayOfWeek = (date.getDay() + 6) % 7; // convert Sunday(0)→6
      const todays = blocks.filter(b => b.dayOfWeek === dayOfWeek).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      todays.forEach(b => {
        const slotMinutes = timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
        if (slotMinutes <= 0) return;
        const queue = backlog[b.course] || [];
        let remaining = slotMinutes;
        while (remaining > 0 && queue.length > 0) {
          const current = queue[0];
          const alloc = Math.min(remaining, current.remaining);
          const entry: TopicPlanEntry = {
            date: format(date, "yyyy-MM-dd"),
            startTime: minutesToTime(timeToMinutes(b.startTime) + (slotMinutes - remaining)),
            endTime: minutesToTime(timeToMinutes(b.startTime) + (slotMinutes - remaining) + alloc),
            course: b.course,
            topic: current.name,
            allocated: alloc,
            remaining: current.remaining - alloc,
          };
          result.push(entry);
          current.remaining -= alloc;
          remaining -= alloc;
          if (current.remaining <= 0) queue.shift();
        }
      });
    }

    setPlan(result);
    toast({ title: "Plan oluşturuldu", description: "Sonraki 14 gün için konu yerleştirme tamamlandı." });
  };

  const resetPlan = () => setPlan([]);

  // UI
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="w-4 h-4"/>Haftalık Ders Çizelgesi (Takvim 1)</CardTitle>
            <CardDescription>Gün, saat ve ders atayın. Çakışmalar otomatik kontrol edilir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={addBlock} className="gap-2"><PlusCircle className="w-4 h-4"/>Blok Ekle</Button>
              <Button onClick={saveAll} disabled={saving || hasOverlap} className="gap-2"><Save className="w-4 h-4"/>{saving?"Kaydediliyor...":"Kaydet"}</Button>
            </div>
            {hasOverlap && (
              <div className="text-sm text-red-600">Aynı gün için saat çakışmaları var. Lütfen düzeltin.</div>
            )}
            <div className="space-y-3">
              {blocks.length === 0 && (
                <div className="text-sm text-gray-500">Henüz blok yok. "Blok Ekle" ile başlayın.</div>
              )}
              {blocks.sort((a,b)=> a.dayOfWeek-b.dayOfWeek || timeToMinutes(a.startTime)-timeToMinutes(b.startTime)).map(b => (
                <div key={b.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <Label>Gün</Label>
                    <select value={b.dayOfWeek} onChange={e=>updateBlock(b.id,{dayOfWeek:Number(e.target.value)})} className="w-full h-9 rounded-md border px-2">
                      {days.map((d,idx)=>(<option key={idx} value={idx}>{d}</option>))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label>Başlangıç</Label>
                    <Input type="time" value={b.startTime} onChange={e=>updateBlock(b.id,{startTime:e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <Label>Bitiş</Label>
                    <Input type="time" value={b.endTime} onChange={e=>updateBlock(b.id,{endTime:e.target.value})} />
                  </div>
                  <div className="col-span-5">
                    <Label>Ders</Label>
                    <Input value={b.course} onChange={e=>updateBlock(b.id,{course:e.target.value})} placeholder="Örn: Matematik (TYT)" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={()=>removeBlock(b.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="w-4 h-4"/>Konu Yerleştirme Motoru (Takvim 2)</CardTitle>
            <CardDescription>Derslere konu dağıtımını oluşturur, kalan süreyi bir sonraki bloğa taşır.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div className="text-xs text-gray-500">Kurs başına konular ve süreleri</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generatePlan} className="gap-2"><Clock className="w-4 h-4"/>Plan Oluştur (14 gün)</Button>
                <Button variant="ghost" onClick={resetPlan} className="gap-2"><RotateCcw className="w-4 h-4"/>Temizle</Button>
              </div>
            </div>
            {/* Topics editor (simple) */}
            <div className="space-y-3">
              {Object.entries(topicsByCourse).map(([course, arr]) => (
                <div key={course} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{course}</div>
                    <Badge variant="outline">{arr.reduce((a,c)=>a+c.minutes,0)} dk</Badge>
                  </div>
                  <div className="space-y-2">
                    {arr.map((t, idx) => (
                      <div key={idx} className="grid grid-cols-8 gap-2 items-center">
                        <div className="col-span-6"><Input value={t.name} onChange={e=>{
                          const v=e.target.value; setTopicsByCourse(prev=>({
                            ...prev,
                            [course]: prev[course].map((x,i)=> i===idx?{...x,name:v}:x)
                          }))
                        }} /></div>
                        <div className="col-span-2"><Input type="number" min={0} value={t.minutes} onChange={e=>{
                          const v=Number(e.target.value)||0; setTopicsByCourse(prev=>({
                            ...prev,
                            [course]: prev[course].map((x,i)=> i===idx?{...x,minutes:v}:x)
                          }))
                        }} /></div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="gap-2" onClick={()=>{
                        setTopicsByCourse(prev=>({
                          ...prev,
                          [course]: [...(prev[course]||[]), { name: "Yeni Konu", minutes: 30 }]
                        }))
                      }}>
                        <PlusCircle className="w-4 h-4"/>Konu Ekle
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="w-4 h-4"/>Oluşturulan Konu Planı (İlk 20 Kayıt)</CardTitle>
          <CardDescription>Takvim 2 çıktısı, tarih-saat bazında konu atamaları</CardDescription>
        </CardHeader>
        <CardContent>
          {plan.length === 0 ? (
            <div className="text-sm text-gray-500">Henüz plan oluşturulmadı.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Tarih</th>
                    <th className="py-2 pr-4">Saat</th>
                    <th className="py-2 pr-4">Ders</th>
                    <th className="py-2 pr-4">Konu</th>
                    <th className="py-2 pr-4 text-right">Dakika</th>
                    <th className="py-2 pr-4 text-right">Kalan</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.slice(0,20).map((p,i)=>(
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-4">{format(new Date(p.date+"T00:00:00"), 'd MMM yyyy EEE', { locale: tr })}</td>
                      <td className="py-2 pr-4">{p.startTime} - {p.endTime}</td>
                      <td className="py-2 pr-4">{p.course}</td>
                      <td className="py-2 pr-4">{p.topic}</td>
                      <td className="py-2 pr-4 text-right">{p.allocated}</td>
                      <td className="py-2 pr-4 text-right">{p.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyProgramTab;
