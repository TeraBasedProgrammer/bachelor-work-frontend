'use client';

import { useToast } from '@/hooks/useToast';
import { ToastViewportProps } from '@radix-ui/react-toast';
import { FC } from 'react';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

interface IToasterProps {
  viewportClassName?: ToastViewportProps['className'];
}

export const Toaster: FC<IToasterProps> = ({ viewportClassName }) => {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className={viewportClassName} />
    </ToastProvider>
  );
};
