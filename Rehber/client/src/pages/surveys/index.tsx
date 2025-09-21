import { SurveyDetailLayout } from "./SurveyDetailLayout";
import { useRoute } from "wouter";

// Bu bileşen App.tsx'in içindeki Route componentlerle iki şekilde kullanılabilir:
// 1. <Route path="/anketler/:id" component={SurveyDetail} /> şeklinde - id parametresini kendisi çıkarır
// 2. <Route path="/anketler/:id">{(params) => <SurveyDetail id={parseInt(params.id)} />}</Route> şeklinde - id parametresi alır

// ID'yi direkt bileşene özellik olarak geçirebilme desteği
interface SurveyDetailProps {
  id?: number;
}

export const SurveyDetail = ({ id: propId }: SurveyDetailProps = {}) => {
  // URL'den anket ID'sini çıkar (eğer direkt özellik olarak verilmemişse)
  const [, params] = useRoute("/anketler/:id");
  const id = propId !== undefined ? propId : (params?.id ? parseInt(params.id, 10) : 0);

  return <SurveyDetailLayout id={id} />;
};