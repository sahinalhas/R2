import React from "react";
import { ArrowUpRight } from "lucide-react";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "purple" | "amber" | "emerald" | "primary";
  onClick?: () => void;
}

// Renkler ve gradientlerin tanımları
const colorScheme = {
  blue: {
    gradient: "from-blue-600 to-blue-400",
    light: "bg-blue-50",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-300",
    shadow: "shadow-blue-200/40",
    hoverShadow: "hover:shadow-blue-200/60",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-400",
    darkText: "text-blue-700",
    lightText: "text-blue-600"
  },
  purple: {
    gradient: "from-purple-600 to-fuchsia-500",
    light: "bg-purple-50",
    border: "border-purple-100",
    hoverBorder: "hover:border-purple-300",
    shadow: "shadow-purple-200/40",
    hoverShadow: "hover:shadow-purple-200/60",
    iconBg: "bg-gradient-to-br from-purple-500 to-fuchsia-400",
    darkText: "text-purple-700",
    lightText: "text-purple-600"
  },
  amber: {
    gradient: "from-amber-500 to-orange-400",
    light: "bg-amber-50",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-300",
    shadow: "shadow-amber-100/40", 
    hoverShadow: "hover:shadow-amber-200/60",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-400",
    darkText: "text-amber-700",
    lightText: "text-amber-600"
  },
  emerald: {
    gradient: "from-emerald-500 to-green-400",
    light: "bg-emerald-50",
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
    shadow: "shadow-emerald-100/40",
    hoverShadow: "hover:shadow-emerald-200/60",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-400",
    darkText: "text-emerald-700",
    lightText: "text-emerald-600"
  },
  primary: {
    gradient: "from-primary to-primary/80",
    light: "bg-primary/5",
    border: "border-primary/10",
    hoverBorder: "hover:border-primary/30",
    shadow: "shadow-primary/20",
    hoverShadow: "hover:shadow-primary/40",
    iconBg: "bg-gradient-to-br from-primary to-primary/80",
    darkText: "text-primary-700",
    lightText: "text-primary"
  }
};

const ActionCard = React.forwardRef<HTMLButtonElement, ActionCardProps>(({
  icon,
  title,
  description,
  color,
  onClick
}, ref) => {
  // Seçilen renk şemasını al
  const scheme = colorScheme[color];
  
  return (
    <button 
      ref={ref}
      className={`
        group relative w-full rounded-2xl bg-white/90 backdrop-blur-sm p-0 overflow-hidden z-10
        border ${scheme.border} ${scheme.hoverBorder}
        shadow-lg ${scheme.shadow} hover:shadow-xl ${scheme.hoverShadow}
        hover:scale-[1.02] hover:-translate-y-1
        transition-all duration-500 ease-out
      `}
      onClick={onClick}
    >
      {/* Decorative background blob */}
      <div className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-gradient-to-r ${scheme.gradient} opacity-5 blur-xl transform transition-all duration-700 ease-out group-hover:scale-125 group-hover:opacity-10`}></div>
      
      <div className="flex items-center p-5 relative z-10">
        {/* İkon */}
        <div className={`
          ${scheme.iconBg} text-white p-3.5 rounded-xl shadow-lg 
          transform group-hover:scale-110 group-hover:rotate-6
          transition-all duration-500 ease-out-expo relative
        `}>
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          <div className="relative">{icon}</div>
        </div>
        
        {/* İçerik */}
        <div className="ml-5 text-left flex-1">
          <h3 className="text-base font-bold text-gray-900 tracking-tight group-hover:translate-x-1 transition-transform duration-500">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 group-hover:translate-x-1 transition-transform duration-500 delay-75">{description}</p>
        </div>
        
        {/* Arrow icon with animation */}
        <div className={`
          ${scheme.lightText} transform translate-x-2 opacity-0 
          group-hover:translate-x-0 group-hover:opacity-100
          transition-all duration-500 ease-out
        `}>
          <ArrowUpRight className="w-6 h-6 stroke-[1.5]" />
        </div>
      </div>
      
      {/* Bottom gradient bar */}
      <div className={`
        h-1.5 w-full bg-gradient-to-r ${scheme.gradient} transform scale-x-0 origin-left
        group-hover:scale-x-100 transition-transform duration-700 ease-out
      `}></div>
    </button>
  );
});

ActionCard.displayName = "ActionCard";

export default ActionCard;