import { useState } from "react";
import { 
  Search,
  Check,
  ArrowDown,
  ArrowUp,
  Users,
  Send
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { useSurveyAssignments, Student, SurveyAssignment } from "@/features/surveys/hooks/useSurveyAssignments";

interface AssignmentTabProps {
  surveyId: number;
}

export const AssignmentTab = ({ surveyId }: AssignmentTabProps) => {
  const [assignmentTab, setAssignmentTab] = useState("yeniAtama");
  
  const {
    students,
    studentsLoading,
    assignments,
    assignmentsLoading,
    completedAssignments,
    pendingAssignments,
    selectedStudents,
    studentSearchQuery,
    setStudentSearchQuery,
    assignmentSortOrder,
    setAssignmentSortOrder,
    assignmentStatusFilter,
    setAssignmentStatusFilter,
    toggleStudentSelection,
    selectAllStudents,
    assignSurveyToSelectedStudents,
    filteredAssignableStudents,
    filteredAssignments,
    isAssigning
  } = useSurveyAssignments(surveyId);

  // Öğrenci adını getir
  const getStudentName = (studentId: number): string => {
    if (!students) return "...";
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "...";
  };

  // Öğrenci avatar başharflerini getir
  const getStudentInitials = (studentId: number): string => {
    if (!students) return "...";
    const student = students.find(s => s.id === studentId);
    if (!student) return "...";
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;
  };

  // Yanıtlanma oranını hesapla
  const completionRate = assignments && assignments.length > 0
    ? Math.round((completedAssignments.length / assignments.length) * 100)
    : 0;

  return (
    <Tabs value={assignmentTab} onValueChange={setAssignmentTab}>
      <TabsList className="grid grid-cols-2 mb-6 w-full sm:w-80">
        <TabsTrigger value="yeniAtama">
          Yeni Atama
        </TabsTrigger>
        <TabsTrigger value="atananlar">
          Atananlar
          {assignments && assignments.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {assignments.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="yeniAtama">
        <Card>
          <CardHeader>
            <CardTitle>Öğrencilere Anket Ata</CardTitle>
            <CardDescription>
              Anketi yanıtlaması için öğrencilere atayın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="select-all"
                    checked={filteredAssignableStudents.length > 0 && selectedStudents.length === filteredAssignableStudents.length}
                    onCheckedChange={selectAllStudents}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Tümünü Seç / Kaldır
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Öğrenci ara..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full max-w-xs h-8 text-sm"
                  />
                </div>
              </div>
              <Separator className="my-2" />
            </div>

            {studentsLoading ? (
              <div className="text-center py-8">
                <p>Öğrenciler yükleniyor...</p>
              </div>
            ) : filteredAssignableStudents.length === 0 ? (
              <div className="text-center py-8">
                <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Atanabilecek Öğrenci Bulunamadı
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {studentSearchQuery 
                    ? "Arama kriterlerine uygun öğrenci bulunamadı. Lütfen farklı bir arama yapın."
                    : "Tüm öğrencilere bu anket zaten atanmış. Yeni öğrenci ekleyebilir veya mevcut atamaları görüntüleyebilirsiniz."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filteredAssignableStudents.map((student) => (
                  <div 
                    key={student.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 border border-gray-100"
                  >
                    <Checkbox 
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.photoUrl || undefined} alt={`${student.firstName} ${student.lastName}`} />
                      <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{student.firstName} {student.lastName}</div>
                      <div className="text-gray-500 text-xs">{student.class} • {student.studentNumber}</div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={assignSurveyToSelectedStudents} 
                disabled={selectedStudents.length === 0 || isAssigning}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isAssigning ? "Atanıyor..." : `${selectedStudents.length} Öğrenciye Anketi Ata`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="atananlar">
        <Card>
          <CardHeader>
            <CardTitle>Anket Atanan Öğrenciler</CardTitle>
            <CardDescription>
              Bu anketi yanıtlaması için atanan öğrencilerin listesi ve yanıtlama durumları.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex gap-4">
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Toplam</div>
                      <div className="text-lg font-semibold text-blue-700">{assignments?.length || 0}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-emerald-50 border-emerald-100">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm text-emerald-600">Tamamlanan</div>
                      <div className="text-lg font-semibold text-emerald-700">
                        {completedAssignments.length} ({completionRate}%)
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={assignmentStatusFilter} onValueChange={(value: 'all' | 'completed' | 'pending') => setAssignmentStatusFilter(value)}>
                  <SelectTrigger className="w-full sm:w-[150px] h-9">
                    <SelectValue placeholder="Tüm Durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={assignmentSortOrder}
                  onValueChange={(value: 'name' | 'status' | 'date') => setAssignmentSortOrder(value)}
                >
                  <SelectTrigger className="w-full sm:w-[150px] h-9">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">İsme Göre</SelectItem>
                    <SelectItem value="status">Duruma Göre</SelectItem>
                    <SelectItem value="date">Tarihe Göre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {assignmentsLoading ? (
              <div className="text-center py-8">
                <p>Atamalar yükleniyor...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <p>Atanan öğrenci bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filteredAssignments.map((assignment) => (
                  <div 
                    key={assignment.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={getStudentName(assignment.studentId)} />
                        <AvatarFallback>{getStudentInitials(assignment.studentId)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{getStudentName(assignment.studentId)}</div>
                        <div className="text-gray-500 text-xs">
                          Atama: {new Date(assignment.assignedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={assignment.status === "Tamamlandı" 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                        : "bg-amber-100 text-amber-800 border-amber-200"
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};