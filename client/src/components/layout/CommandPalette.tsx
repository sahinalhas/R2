import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  BarChart2,
  ClipboardCheck,
  Settings,
  Search,
  ChevronRight,
  User,
  Hash,
} from "lucide-react";
import { useStudents } from "@/features/students/hooks/useStudentApi";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [_, navigate] = useLocation();

  // Global kısayol: Ctrl/Cmd + K ve özel event ile açma
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && (e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpenEvent = (e: Event) => {
      // @ts-ignore - CustomEvent detail mevcut olabilir
      const detail = (e as CustomEvent)?.detail;
      if (detail === "toggle") setOpen((v) => !v);
      else setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpenEvent as EventListener);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenEvent as EventListener);
    };
  }, []);

  // Öğrenciler
  const { data: students = [] } = useStudents();
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return students
      .filter((s: any) => {
        const full = `${s.firstName || ""} ${s.lastName || ""}`.trim().toLowerCase();
        return (
          full.includes(q) ||
          String(s.studentNumber || "").toLowerCase().includes(q) ||
          String(s.className || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [students, query]);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Ara veya komut yazın..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı</CommandEmpty>

        <CommandGroup heading="Hızlı Erişim">
          <CommandItem onSelect={() => go("/")}> 
            <Home className="mr-2 h-4 w-4" />
            <span>Ana Sayfa</span>
            <CommandShortcut>G</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/ogrenciler")}> 
            <Users className="mr-2 h-4 w-4" />
            <span>Öğrenciler</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/randevular")}> 
            <Calendar className="mr-2 h-4 w-4" />
            <span>Randevular</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/gorusmeler")}> 
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Görüşmeler</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/raporlar")}> 
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Raporlar</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/anketler")}> 
            <ClipboardCheck className="mr-2 h-4 w-4" />
            <span>Anketler</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/ayarlar")}> 
            <Settings className="mr-2 h-4 w-4" />
            <span>Ayarlar</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Öğrenciler">
          {filteredStudents.length === 0 ? (
            <CommandItem disabled>
              <Search className="mr-2 h-4 w-4" />
              <span>İsme, numaraya veya sınıfa göre ara</span>
            </CommandItem>
          ) : (
            filteredStudents.map((s: any) => (
              <CommandItem
                key={s.id}
                onSelect={() => go(`/ogrenciler/detay/${s.id}`)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{`${s.firstName || ""} ${s.lastName || ""}`.trim()}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                {s.studentNumber ? (
                  <span className="ml-2 inline-flex items-center text-xs text-muted-foreground">
                    <Hash className="mr-1 h-3 w-3" />{s.studentNumber}
                  </span>
                ) : null}
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
