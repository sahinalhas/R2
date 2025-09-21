import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useStudents, useDeleteStudent } from "@/hooks/use-api-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Edit, Trash2, MoreVertical, Search, FileText, Calendar, User } from "lucide-react";

// Tip tanımlaması
interface StudentTableProps {
  initialSearchTerm?: string;
}

const StudentTable = ({ initialSearchTerm = "" }: StudentTableProps) => {
  const { data: students, isLoading } = useStudents();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  
  // initialSearchTerm değiştiğinde searchTerm'i güncelle
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);
  
  // Öğrenciyi sil
  const deleteMutation = useDeleteStudent();
  
  // Başarılı/başarısız durumda çalışacak ek işlevler
  const handleDeleteSuccess = () => {
    toast({
      title: "Öğrenci silindi",
      description: "Öğrenci başarıyla silindi.",
    });
    setStudentToDelete(null);
  };
  
  const handleDeleteError = (error: any) => {
    toast({
      title: "Hata",
      description: `Öğrenci silinirken bir hata oluştu: ${error.message}`,
      variant: "destructive",
    });
  };
  
  // Arama filtresine göre öğrencileri filtrele
  const filteredStudents = students?.filter((student: any) => {
    if (searchTerm === "") return true;
    
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return (
      fullName.includes(term) ||
      student.studentClass.toLowerCase().includes(term) ||
      student.studentNumber.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="mb-10 relative">
        {/* Dekoratif arka plan elementleri */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl opacity-60"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/70" />
              <Input
                placeholder="Öğrenci ara (isim, sınıf veya numara...)"
                className="pl-11 pr-4 py-6 border-0 bg-transparent font-medium placeholder:text-gray-400 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl px-5 py-6 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => window.location.href = "/ogrenciler?new=true"}
          >
            <span className="mr-2">Yeni Öğrenci</span>
            <span className="relative w-5 h-5">
              <span className="absolute w-full h-0.5 bg-white top-1/2 -translate-y-1/2"></span>
              <span className="absolute h-full w-0.5 bg-white left-1/2 -translate-x-1/2"></span>
            </span>
          </Button>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden transition-all duration-500 hover:shadow-2xl relative">
          {/* Tablo başlık gradientı */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/80 via-blue-500/80 to-purple-500/80"></div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/90">
                  <TableHead className="font-bold text-gray-700">Öğrenci No</TableHead>
                  <TableHead className="font-bold text-gray-700">Adı Soyadı</TableHead>
                  <TableHead className="font-bold text-gray-700">Sınıf</TableHead>
                  <TableHead className="font-bold text-gray-700">Veli Adı</TableHead>
                  <TableHead className="font-bold text-gray-700">Veli Telefon</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Yükleniyor durumu
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredStudents && filteredStudents.length > 0 ? (
                  // Öğrenci listesi
                  filteredStudents.map((student: any, index: number) => (
                    <TableRow key={student.id} className="transition-colors duration-300 hover:bg-gray-50/80 group">
                      <TableCell className="font-mono text-sm text-gray-600">{student.studentNumber}</TableCell>
                      <TableCell className="font-medium text-gray-900">{student.firstName} {student.lastName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {student.studentClass}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">{student.parentName || "-"}</TableCell>
                      <TableCell className="text-gray-700">{student.parentPhone || "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 opacity-80 group-hover:opacity-100 transition-all duration-300">
                              <MoreVertical className="h-4.5 w-4.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl overflow-hidden border border-gray-100/80 shadow-lg backdrop-blur-sm bg-white/95">
                            <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary cursor-pointer">
                              <Link href={`/ogrenciler/detay/${student.id}`}>
                                <div className="flex items-center w-full py-1.5">
                                  <User className="mr-2 h-4 w-4" />
                                  <span>Detaylar</span>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary cursor-pointer">
                              <Link href={`/ogrenciler/duzenle/${student.id}`}>
                                <div className="flex items-center w-full py-1.5">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Düzenle</span>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="focus:bg-blue-50 focus:text-blue-600 cursor-pointer">
                              <Link href={`/gorusmeler?studentId=${student.id}`}>
                                <div className="flex items-center w-full py-1.5">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Görüşmeler</span>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="focus:bg-purple-50 focus:text-purple-600 cursor-pointer">
                              <Link href={`/randevular?studentId=${student.id}`}>
                                <div className="flex items-center w-full py-1.5">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Randevular</span>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer py-1.5"
                              onClick={() => setStudentToDelete(student.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Sil</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Öğrenci bulunamadı
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative w-20 h-20 mb-4">
                          <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
                          <div className="relative bg-primary/10 text-primary rounded-full w-full h-full flex items-center justify-center">
                            <Search className="w-7 h-7" />
                          </div>
                        </div>
                        <p className="text-lg font-medium text-gray-800">
                          {searchTerm ? 
                            `"${searchTerm}" ile eşleşen öğrenci bulunamadı.` : 
                            "Henüz öğrenci kaydı bulunmuyor."}
                        </p>
                        <p className="text-gray-500 mt-2 max-w-md text-center">
                          {searchTerm ? 
                            "Farklı bir arama kriteri deneyin veya yeni öğrenci ekleyin." : 
                            "Öğrencilerinizi eklemek için 'Yeni Öğrenci' butonunu kullanabilirsiniz."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Silme Onay Dialog */}
      <Dialog open={studentToDelete !== null} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-100/80 rounded-2xl max-w-md">
          <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-red-500/5 to-transparent rounded-2xl"></div>
          
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100/80 flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse blur-md"></div>
            <Trash2 className="h-7 w-7 text-red-500 relative" />
          </div>
          
          <DialogHeader className="text-center mb-2">
            <DialogTitle className="text-xl font-bold text-gray-900">Öğrenci Silme</DialogTitle>
            <DialogDescription className="text-gray-700 mt-2 text-center max-w-sm mx-auto">
              Bu öğrenciyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve öğrenciye ait tüm veriler sistemden kaldırılacaktır.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setStudentToDelete(null)}
              className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-5 font-medium transition-all duration-300"
            >
              Vazgeç
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (studentToDelete) {
                  deleteMutation.mutate(studentToDelete, {
                    onSuccess: handleDeleteSuccess,
                    onError: handleDeleteError
                  });
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl py-5 font-medium shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300"
            >
              {deleteMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  <span>Siliniyor...</span>
                </div>
              ) : (
                <span>Öğrenciyi Sil</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentTable;
