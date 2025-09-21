import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import ConversationTopicsSettings from "@/components/ConversationTopicsSettings";

const ConversationTopicsSettingsPage = () => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500/80" />
          <CardTitle>Görüşme Konuları</CardTitle>
        </div>
        <CardDescription>
          Görüşme oturumlarında kullanılacak konu başlıklarını tanımlayın
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ConversationTopicsSettings />
      </CardContent>
    </Card>
  );
};

export default ConversationTopicsSettingsPage;