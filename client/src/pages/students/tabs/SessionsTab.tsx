import { MessageSquare, Calendar, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Session } from "@shared/schema";
import { formatDateTime } from "../utils";

interface SessionsTabProps {
  sessions: Session[];
  studentId: number;
}

const SessionsTab = ({ sessions, studentId }: SessionsTabProps) => {
  // Görüşmeleri tarihe göre sırala (en yeniden en eskiye)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Öğrenci Görüşmeleri</h3>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Görüşme Ekle
        </Button>
      </div>
      
      {sortedSessions.length === 0 ? (
        <Card className="border-dashed border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-700 mb-2">Henüz Görüşme Yok</h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Bu öğrenci ile henüz kayıtlı bir görüşme yapılmamış. Yeni bir görüşme eklemek için "Yeni Görüşme Ekle" butonunu kullanabilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedSessions.map((session) => (
            <Card 
              key={session.id}
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200/75 hover:border-blue-500/20"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                    {session.sessionType || "Genel Görüşme"}
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    30 dakika
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{formatDateTime(session.date)}</span>
                  </div>
                  
                  {session.summary && (
                    <div className="bg-gray-50 rounded-md p-3 mt-2">
                      <h5 className="font-medium text-gray-700 mb-1">Görüşme Özeti</h5>
                      <div className="text-sm text-gray-600">{session.summary}</div>
                    </div>
                  )}
                  
                  {session.problems && (
                    <div className="bg-blue-50 rounded-md p-3 mt-2">
                      <h5 className="font-medium text-blue-700 mb-1">Belirlenen Problemler</h5>
                      <div className="text-sm text-blue-600">{session.problems}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsTab;