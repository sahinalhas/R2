import { BarChart4, FileText, Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Report } from "@shared/schema";
import { formatDate } from "../utils";
import { Plus, FileText, Calendar } from "lucide-react";

interface ReportsTabProps {
  reports: Report[];
  studentId: number;
}

const ReportsTab = ({ reports, studentId }: ReportsTabProps) => {
  // Raporları tarihe göre sırala (en yeniden en eskiye)
  const sortedReports = [...reports].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Öğrenci Raporları</h3>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Rapor Oluştur
        </Button>
      </div>
      
      {sortedReports.length === 0 ? (
        <Card className="border-dashed border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-700 mb-2">Henüz Rapor Yok</h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Bu öğrenci için henüz rapor oluşturulmamış. Yeni bir rapor eklemek için "Yeni Rapor Oluştur" butonunu kullanabilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedReports.map((report) => (
            <Card 
              key={report.id}
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200/75 hover:border-emerald-500/20"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-emerald-500" />
                    {report.title || "Genel Rapor"}
                  </CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    {report.type || "Genel"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{formatDate(report.createdAt)}</span>
                  </div>
                  
                  {report.content && (
                    <div className="bg-gray-50 rounded-md p-3 mt-2">
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {report.content}
                      </div>
                      <div className="text-xs text-right mt-2">
                        <span className="text-emerald-600 font-medium cursor-pointer hover:underline">
                          Tamamını Gör
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {report.tags && (
                    <div className="bg-blue-50 rounded-md p-3 mt-2">
                      <h5 className="font-medium text-blue-700 text-sm mb-1">Etiketler</h5>
                      <div className="text-sm text-blue-600 line-clamp-2">{report.tags}</div>
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

export default ReportsTab;
