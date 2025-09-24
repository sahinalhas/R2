import { useEffect, useMemo, useRef, useState } from "react";
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

  // Haftalık takvim ızgarası konfigürasyonu
  const startHour = 7;
  const endHour = 24;
  const step = 30; // dakika
  const slotHeight = 24; // piksel / 30 dakika
  const totalMinutes = (endHour - startHour) * 60;
  const totalSlots = totalMinutes / step;
  const hourLabels = useMemo(() => Array.from({ length: endHour - startHour + 1 }, (_, i) => `${String(startHour + i).padStart(2,'0')}:00`), []);

  // Gün kolon referansları (drop ve sürükle sırasında konum hesaplamak için)
  const dayRefsRef = useRef<(HTMLDivElement | null)[]>([]);

  function snap(m: number) { return Math.round(m / step) * step; }
  function clamp(m: number, min: number, max: number) { return Math.max(min, Math.min(max, m)); }

  // Sürükleme/yeniden boyutlandırma durumu
  const [dragState, setDragState] = useState<{
    id: string;
    type: 'move' | 'resize';
    startY: number;
    day: number;
    startRel: number; // 07:00'dan itibaren dakika
    endRel: number;
  } | null>(null);

  // Üstten ders etiketini takvime bırakma
  function handleDrop(day: number, ev: any) {
    ev.preventDefault();
    const course = (ev.dataTransfer?.getData('text/plain') as string) || '';
    const col = dayRefsRef.current?.[day];
    if (!col) return;
    const rect = col.getBoundingClientRect();
    const y = ev.clientY - rect.top;
    const relMin = clamp(snap(Math.floor(y / slotHeight) * step), 0, totalMinutes - step);
    const startAbs = startHour * 60 + relMin;
    const endAbs = clamp(startAbs + step, startHour * 60 + step, endHour * 60);
    const id = crypto.randomUUID();
    setBlocks(prev => [...prev, {
      id,
      dayOfWeek: day,
      startTime: minutesToTime(startAbs),
      endTime: minutesToTime(endAbs),
      course: course || (Object.keys(topicsByCourse || {})[0] || 'Ders')
    }]);
  }

  function startMove(e: any, id: string) {
    e.preventDefault();
    const blk = blocks.find(b => b.id === id);
    if (!blk) return;
    setDragState({
      id,
      type: 'move',
      startY: e.clientY,
      day: blk.dayOfWeek,
      startRel: timeToMinutes(blk.startTime) - startHour * 60,
      endRel: timeToMinutes(blk.endTime) - startHour * 60,
    });
  }

  function startResize(e: any, id: string) {
    e.preventDefault(); e.stopPropagation();
    const blk = blocks.find(b => b.id === id);
    if (!blk) return;
    setDragState({
      id,
      type: 'resize',
      startY: e.clientY,
      day: blk.dayOfWeek,
      startRel: timeToMinutes(blk.startTime) - startHour * 60,
      endRel: timeToMinutes(blk.endTime) - startHour * 60,
    });
  }

  // Global hareket/bitir dinleyicileri
  useEffect(() => {
    function onMove(ev: PointerEvent) {
      if (!dragState) return;
      const dy = ev.clientY - dragState.startY;
      const deltaSlots = Math.round(dy / slotHeight);

      if (dragState.type === 'move') {
        // Hangi gün kolonunun üzerindeyiz?
        let overDay = dragState.day;
        for (let i = 0; i < 7; i++) {
          const el = dayRefsRef.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (ev.clientX >= r.left && ev.clientX <= r.right) { overDay = i; break; }
        }
        const duration = dragState.endRel - dragState.startRel;
        let newStart = clamp(snap(dragState.startRel + deltaSlots * step), 0, totalMinutes - duration);
        let newEnd = newStart + duration;
        setBlocks(prev => prev.map(b => b.id === dragState.id ? {
          ...b,
          dayOfWeek: overDay,
          startTime: minutesToTime(startHour * 60 + newStart),
          endTime: minutesToTime(startHour * 60 + newEnd)
        } : b));
      } else {
        // resize
        let newEndRel = clamp(snap(dragState.endRel + deltaSlots * step), dragState.startRel + step, totalMinutes);
        setBlocks(prev => prev.map(b => b.id === dragState.id ? {
          ...b,
          endTime: minutesToTime(startHour * 60 + newEndRel)
        } : b));
      }
    }
    function onUp() { setDragState(null); }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragState]);

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

            {/* Dersler (üstte sürüklenebilir) */}
            <div className="flex flex-wrap gap-2 items-center">
              {Object.keys(topicsByCourse || {}).map((c)=> (
                <Badge
                  key={c}
                  variant="secondary"
                  draggable
                  onDragStart={(e)=>{ e.dataTransfer.setData('text/plain', c); }}
                  className="cursor-grab select-none"
                >{c}</Badge>
              ))}
              {Object.keys(topicsByCourse || {}).length === 0 && (
                <div className="text-xs text-gray-500">Önce sağdaki Konu Yerleştirme Motoru bölümünde ders ekleyin.</div>
              )}
            </div>

            {/* Haftalık 7x zaman ızgarası (07:00 - 24:00, 30 dk) */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-8 gap-2">
                  {/* Saat sütunu */}
                  <div className="relative">
                    <div style={{ height: totalSlots*slotHeight }} className="relative">
                      {hourLabels.map((label, i)=> (
                        <div key={i} className="absolute -translate-y-2 text-xs text-gray-500 select-none" style={{ top: i*2*slotHeight }}>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gün sütunları */}
                  {days.map((d, dayIdx)=> (
                    <div key={dayIdx} className="relative border rounded bg-white/50"
                         ref={(el)=>{ dayRefsRef.current[dayIdx] = el }}
                         onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>handleDrop(dayIdx, e)}
                         style={{ height: totalSlots*slotHeight }}>
                      {/* 30dk çizgileri */}
                      {Array.from({ length: totalSlots+1 }).map((_,i)=> (
                        <div key={i} className={i%2===0?"absolute left-0 right-0 border-t border-gray-200":"absolute left-0 right-0 border-t border-gray-100"} style={{ top: i*slotHeight }} />
                      ))}
                      {/* Gün başlığı */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-700">{d}</div>

                      {/* Bloklar */}
                      {blocks.filter(b=> b.dayOfWeek===dayIdx).map(b=>{
                        const startRel = timeToMinutes(b.startTime) - startHour*60;
                        const endRel = timeToMinutes(b.endTime) - startHour*60;
                        const top = (startRel/step)*slotHeight;
                        const height = Math.max(slotHeight, ((endRel - startRel)/step)*slotHeight);
                        return (
                          <div key={b.id}
                               className="absolute left-1 right-1 rounded bg-blue-600/80 text-white text-[11px] leading-tight shadow cursor-grab select-none"
                               style={{ top, height }}
                               onPointerDown={(e)=> startMove(e, b.id)}
                          >
                            <div className="px-2 py-1">
                              <div className="font-medium truncate">{b.course}</div>
                              <div className="opacity-90">{b.startTime} - {b.endTime}</div>
                            </div>
                            {/* Resize handle */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize" onPointerDown={(e)=> startResize(e, b.id)} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
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
