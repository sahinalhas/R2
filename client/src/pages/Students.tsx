import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Container } from "@/components/ui/container";
import StudentTable from "@/components/students/StudentTable";
import StudentForm from "@/components/students/StudentForm";

const Students = () => {
  const [location] = useLocation();
  const [, params] = useRoute("/ogrenciler/duzenle/:id");
  const [newMode, setNewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // URL'deki parametreleri yakala
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      
      // "new" parametresini kontrol et
      const hasNewParam = url.searchParams.has("new");
      setNewMode(hasNewParam);
      
      // "q" arama parametresini kontrol et
      const searchParam = url.searchParams.get("q");
      if (searchParam) {
        setSearchQuery(searchParam);
      } else {
        setSearchQuery("");
      }
    } catch (error) {
      console.error("URL parsing error:", error);
    }
  }, [location]);
  
  // Düzenleme modunda öğrenci ID'si
  const studentId = params?.id ? parseInt(params.id) : undefined;
  
  return (
    <Container>
      <div className="py-6">
        {newMode ? (
          // Yeni öğrenci ekleme formu
          <StudentForm />
        ) : studentId ? (
          // Öğrenci düzenleme formu
          <StudentForm studentId={studentId} />
        ) : (
          // Öğrenci listesi
          <StudentTable initialSearchTerm={searchQuery} />
        )}
      </div>
    </Container>
  );
};

export default Students;
