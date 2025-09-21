import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import LessonHoursSettings from "@/components/LessonHoursSettings";

const LessonHoursSettingsPage = () => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500/80" />
          <CardTitle>Okul Ders Saatleri</CardTitle>
        </div>
        <CardDescription>
          Okul ders saatleri başlangıç ve bitiş zamanlarını düzenleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <LessonHoursSettings />
      </CardContent>
    </Card>
  );
};

export default LessonHoursSettingsPage;