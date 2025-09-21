import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = "xl", ...props }, ref) => {
    // Convert maxWidth values to appropriate classes
    const maxWidthClass = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full"
    }[maxWidth];

    return (
      <div
        ref={ref}
        className={cn(
          "container mx-auto px-4 sm:px-6 md:px-8 relative overflow-x-hidden", 
          maxWidthClass,
          "before:absolute before:inset-0 before:bg-transparent before:bg-gradient-radial before:from-gray-100/40 before:via-transparent before:to-transparent before:opacity-0 before:pointer-events-none before:z-[-1]",
          "transition-all duration-300 ease-out",
          "hover:before:opacity-80",
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export { Container };