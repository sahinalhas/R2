/**
 * Genel aktivite işlevlerini içeren modül
 */

/**
 * Aktivite türüne göre ikon ve renk bilgisi sağlayan fonksiyon
 */
export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'Yeni görüşme':
      return {
        iconName: 'MessageSquare',
        color: 'text-indigo-500',
        bgGradient: 'from-indigo-500 to-blue-500',
        bgLight: 'bg-indigo-50',
        border: 'border-indigo-100'
      };
    case 'Yeni rapor':
    case 'Rapor güncelleme':
      return {
        iconName: 'ClipboardList',
        color: 'text-emerald-500',
        bgGradient: 'from-emerald-500 to-green-500',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-100'
      };
    case 'Yeni öğrenci':
    case 'Öğrenci güncelleme':
      return {
        iconName: 'UserPlus',
        color: 'text-purple-500',
        bgGradient: 'from-purple-500 to-fuchsia-500',
        bgLight: 'bg-purple-50',
        border: 'border-purple-100'
      };
    case 'Yeni randevu':
    case 'Randevu güncelleme':
      return {
        iconName: 'Calendar',
        color: 'text-blue-500',
        bgGradient: 'from-blue-500 to-sky-400',
        bgLight: 'bg-blue-50',
        border: 'border-blue-100'
      };
    default:
      return {
        iconName: 'MessageSquare',
        color: 'text-primary',
        bgGradient: 'from-primary to-primary/80',
        bgLight: 'bg-primary/5',
        border: 'border-primary/10'
      };
  }
};