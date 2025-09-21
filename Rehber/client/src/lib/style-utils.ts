/**
 * UI bileşenleri için ortak stil sınıfları ve yardımcı fonksiyonlar
 */

// Animasyon stil sınıfları
// Tüm bileşenlerde kullanılabilecek ortak animasyon stilleri
export const animationStyles = {
  fadeIn: "data-[state=open]:animate-in data-[state=open]:fade-in-0",
  fadeOut: "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
  zoomIn: "data-[state=open]:zoom-in-95",
  zoomOut: "data-[state=closed]:zoom-out-95",
  slideInTop: "data-[state=open]:slide-in-from-top-[48%]",
  slideOutTop: "data-[state=closed]:slide-out-to-top-[48%]",
  slideInLeft: "data-[state=open]:slide-in-from-left-1/2",
  slideOutLeft: "data-[state=closed]:slide-out-to-left-1/2",
  dropdownSlideIn: "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
};

// Dialog ve AlertDialog için ortak stil sınıfları
export const dialogContentStyles = 
  `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 ${animationStyles.fadeIn} ${animationStyles.fadeOut} ${animationStyles.zoomIn} ${animationStyles.zoomOut} ${animationStyles.slideInLeft} ${animationStyles.slideOutLeft} ${animationStyles.slideInTop} ${animationStyles.slideOutTop} sm:rounded-lg`;

// Dialog ve AlertDialog için header stili
export const dialogHeaderStyles = 
  "flex flex-col space-y-1.5 text-center sm:text-left";

// Dialog ve AlertDialog için footer stili
export const dialogFooterStyles = 
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2";

// Dialog ve AlertDialog için başlık stili
export const dialogTitleStyles = 
  "text-lg font-semibold leading-none tracking-tight";

// Dialog ve AlertDialog için açıklama stili
export const dialogDescriptionStyles = 
  "text-sm text-muted-foreground";

// Dropdown menu içerik stili
export const dropdownMenuContentStyles = 
  `z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${animationStyles.fadeIn} ${animationStyles.fadeOut} ${animationStyles.zoomIn} ${animationStyles.zoomOut} ${animationStyles.dropdownSlideIn} origin-[--radix-dropdown-menu-content-transform-origin]`;

// Form item için ortak stiller
export const formItemStyles = "space-y-2";

// Form label için ortak stiller
export const formLabelStyles = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

// Form açıklama için ortak stiller
export const formDescriptionStyles = "text-sm text-muted-foreground";

// Form hata mesajı için ortak stiller  
export const formMessageStyles = "text-sm font-medium text-destructive";

// Input container için ortak stiller
export const inputContainerStyles = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Kart geçiş efekti stili
export const cardHoverEffectStyles =
  "hover:shadow-xl transition-all duration-300 hover:-translate-y-1";

// Kart stili
export const cardStyles = "rounded-lg border bg-card text-card-foreground shadow-sm";

// Kart başlık stili  
export const cardTitleStyles = "text-2xl font-semibold leading-none tracking-tight";

// Kart içerik stili
export const cardContentStyles = "p-6 pt-0";

// Kart footer stili
export const cardFooterStyles = "flex items-center p-6 pt-0";

// Kart header stili
export const cardHeaderStyles = "flex flex-col space-y-1.5 p-6";

// Kart açıklama stili
export const cardDescriptionStyles = "text-sm text-muted-foreground";

// Gradient arka plan stilleri
export const gradientBackgroundStyles = {
  primary: "bg-gradient-to-br from-primary to-primary/80",
  blue: "bg-gradient-to-br from-blue-500 to-blue-400",
  purple: "bg-gradient-to-br from-purple-500 to-purple-400",
  green: "bg-gradient-to-br from-emerald-500 to-green-400",
  orange: "bg-gradient-to-br from-orange-500 to-amber-400",
  red: "bg-gradient-to-br from-red-500 to-rose-400",
};

// Işıltı arka plan efekti
export const glowEffectStyles = (color: string) => `absolute -top-10 -right-10 w-32 md:w-48 h-32 md:h-48 opacity-15 rounded-full ${color} blur-3xl transform transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-25`;

// Tipografi stilleri
export const typographyStyles = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight", 
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  blockquote: "mt-6 border-l-2 pl-6 italic",
  table: "w-full p-4",
  tableHeader: "border px-4 py-2 text-left font-bold",
  tableCell: "border px-4 py-2 text-left",
  list: "my-6 ml-6 list-disc [&>li]:mt-2"
};