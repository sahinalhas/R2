import React, { useState, useEffect, useCallback } from "react";
import { X, Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const notificationVariants = cva(
  "group relative pointer-events-auto flex w-full max-w-md items-center justify-between overflow-hidden rounded-lg p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200",
        success: "bg-white border-l-4 border-green-500",
        error: "bg-white border-l-4 border-red-500",
        warning: "bg-white border-l-4 border-amber-500",
        info: "bg-white border-l-4 border-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface NotificationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof notificationVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const getIconForVariant = (variant: string | undefined | null) => {
  if (variant === null) return <Bell className="h-5 w-5 text-gray-500" />;
  
  switch (variant) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  (
    {
      className,
      variant,
      title,
      description,
      actionIcon,
      onAction,
      onClose,
      autoClose = true,
      autoCloseDelay = 5000,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    const handleClose = useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        setShouldRender(false);
        if (onClose) onClose();
      }, 300); // Geçiş animasyonu için bekle
    }, [onClose]);

    useEffect(() => {
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }, [autoClose, autoCloseDelay, handleClose]);

    if (!shouldRender) return null;

    const icon = getIconForVariant(variant);

    return (
      <div
        ref={ref}
        className={cn(
          notificationVariants({ variant }),
          isVisible
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform -translate-y-2",
          "transition-all duration-300 ease-in-out backdrop-blur-sm bg-white/90 shadow-xl",
          "border border-white/20 shadow-xl",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-4 w-full">
          <div className="shrink-0">{icon}</div>
          <div className="flex-1 space-y-1">
            {title && <div className="font-medium text-gray-900">{title}</div>}
            {description && <div className="text-sm text-gray-500">{description}</div>}
          </div>
          <div className="flex space-x-1">
            {actionIcon && (
              <button
                className="rounded-md p-1 text-gray-500 transition-colors hover:text-gray-900 hover:bg-gray-100/50"
                onClick={onAction}
              >
                {actionIcon}
              </button>
            )}
            <button
              className="rounded-md p-1 text-gray-500 transition-colors hover:text-gray-900 hover:bg-gray-100/50"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Notification.displayName = "Notification";

export { Notification, notificationVariants };