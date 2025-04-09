"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { type VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import {
    LiaExclamationCircleSolid,
    LiaExclamationTriangleSolid,
} from "react-icons/lia";

import { WavingPersonIcon } from "@/components/icons/WavingPersonIcon";
import { cn } from "@/lib/utils/functions/styles";

const toastIcons = {
  default: <WavingPersonIcon width="20" height="20" />,
  info: <WavingPersonIcon width="20" height="20" />,
  destructive: <LiaExclamationCircleSolid size={20} />,
  success: <IoMdCheckmarkCircleOutline size={20} />,
  warning: <LiaExclamationTriangleSolid size={20} />,
};

const toastIconClasses = {
  default: "bg-teal-light text-gray-charcoal",
  info: "bg-blue-wave text-white",
  destructive: "bg-red-scarlet text-white",
  success: "bg-green-bright text-gray-charcoal",
  warning: "bg-yellow-amber text-gray-charcoal",
};

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "toast-root group pointer-events-auto relative flex w-full max-w-max items-center justify-between gap-x-2 overflow-hidden rounded-lg ml-auto p-3 transition-all duration-300 focus:outline-hidden focus:shadow-soft text-gray-charcoal data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-teal-mist dark:bg-teal-ice",
        info: "bg-blue-powder dark:bg-blue-crystal",
        destructive: "destructive group bg-pink-blush dark:bg-pink-strawberry",
        success: "bg-green-mint dark:bg-green-light",
        warning: "bg-yellow-pastel dark:bg-yellow-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    <div className="flex w-full items-start gap-x-4">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full px-2",
          toastIconClasses[variant ?? "default"],
        )}
      >
        {toastIcons[variant ?? "default"]}
      </div>
      {children}
    </div>
  </ToastPrimitives.Root>
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 font-medium text-sm transition-colors hover:bg-secondary focus:outline-hidden focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-gray-quartz/40 focus:group-[.destructive]:ring-destructive hover:group-[.destructive]:border-destructive/30 hover:group-[.destructive]:bg-destructive hover:group-[.destructive]:text-destructive-foreground",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "ml-auto text-gray-charcoal/70 opacity-0 transition-all duration-300 hover:text-black focus:opacity-100 focus:outline-hidden group-hover:opacity-100",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("font-semibold text-base", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-gray-graphite text-sm", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
    Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, type ToastActionElement, type ToastProps
};

