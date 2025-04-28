'use client';

import { Trash2 as RemoveIcon } from 'lucide-react';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DropzoneOptions, DropzoneState, FileRejection, useDropzone } from 'react-dropzone';

import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/useToast';
import { cn } from '@/lib/utils/functions/styles';
import * as z from 'zod';

type DirectionOptions = 'rtl' | 'ltr' | undefined;

type FileUploaderContextType = {
  dropzoneState: DropzoneState;
  isLOF: boolean;
  isFileTooBig: boolean;
  removeFileFromSet: (index: number) => void;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  orientation: 'horizontal' | 'vertical';
  direction: DirectionOptions;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const fileInputValidation = (
  allowedMimeTypes: string[],
  hasExistingFile: boolean,
  maxSizeMB = 4,
) =>
  z
    .array(
      z
        .custom<File>((file) => file instanceof File, 'Invalid file format')
        .refine((file) => file.size <= maxSizeMB * 1024 * 1024, `File must be under ${maxSizeMB}MB`)
        .refine(
          (file) => allowedMimeTypes.includes(file.type),
          `Allowed formats: ${allowedMimeTypes.join(', ')}`,
        ),
    )
    .optional()
    .or(z.literal(undefined))
    .refine((value) => hasExistingFile || (value && value.length > 0), 'File is required');

export const useFileUpload = () => {
  const context = useContext(FileUploaderContext);
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploaderProvider');
  }
  return context;
};

type FileUploaderProps = {
  value: File[] | null;
  reSelect?: boolean;
  onValueChange: (value: File[] | null) => void;
  dropzoneOptions: DropzoneOptions;
  orientation?: 'horizontal' | 'vertical';
  maxFileCount?: number;
};

export const FileUploader = forwardRef<
  HTMLDivElement,
  FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,
      dropzoneOptions,
      value,
      onValueChange,
      reSelect,
      orientation = 'vertical',
      children,
      dir,
      maxFileCount,
      ...props
    },
    ref,
  ) => {
    const [isFileTooBig, setIsFileTooBig] = useState(false);
    const [isLOF, setIsLOF] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const {
      accept = { '*/*': [] },
      maxFiles = maxFileCount ?? 1,
      maxSize = 4 * 1024 * 1024,
      multiple = true,
    } = dropzoneOptions;

    const reSelectAll = maxFiles === 1 ? true : reSelect;
    const direction: DirectionOptions = dir === 'rtl' ? 'rtl' : 'ltr';

    const removeFileFromSet = useCallback(
      (i: number) => {
        if (!value) return;
        const newFiles = value.filter((_, index) => index !== i);
        onValueChange(newFiles);
      },
      [value, onValueChange],
    );

    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        if (!acceptedFiles.length) {
          toast({
            title: 'Upload failed',
            description: 'No accepted files',
            variant: 'destructive',
          });
          return;
        }

        const newValues: File[] = value ? [...value] : [];

        if (reSelectAll) {
          newValues.splice(0, newValues.length);
        }

        acceptedFiles.forEach((file) => {
          if (newValues.length < maxFiles) {
            newValues.push(file);
          }
        });

        onValueChange(newValues);

        rejectedFiles.forEach(({ file, errors }) => {
          errors.forEach((error) => {
            toast({
              title: `Error: ${file.name}`,
              description: error.message,
              variant: 'destructive',
            });
          });
        });
      },
      [reSelectAll, value, maxFiles, onValueChange],
    );

    useEffect(() => {
      if (!value) return;
      setIsLOF(value.length >= maxFiles);
    }, [value, maxFiles]);

    const dropzoneState = useDropzone({
      ...dropzoneOptions,
      onDrop,
      onDropRejected: () => setIsFileTooBig(true),
      onDropAccepted: () => setIsFileTooBig(false),
    });

    const contextObject = useMemo(
      () => ({
        dropzoneState,
        isLOF,
        isFileTooBig,
        removeFileFromSet,
        activeIndex,
        setActiveIndex,
        orientation,
        direction,
      }),
      [dropzoneState, isLOF, isFileTooBig, removeFileFromSet, activeIndex, orientation, direction],
    );

    return (
      <FileUploaderContext.Provider value={contextObject}>
        <div
          ref={ref}
          className={cn('grid w-full overflow-hidden focus:outline-hidden', className, {
            'gap-2': value && value.length > 0,
          })}
          dir={dir}
          {...props}>
          {children}
        </div>
      </FileUploaderContext.Provider>
    );
  },
);

FileUploader.displayName = 'FileUploader';

export const FileUploaderContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    const { orientation } = useFileUpload();
    return (
      <div className={cn('w-full px-1')} ref={ref} {...props}>
        <div
          className={cn(
            'flex gap-1 rounded-xl',
            orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
            className,
          )}>
          {children}
        </div>
      </div>
    );
  },
);

FileUploaderContent.displayName = 'FileUploaderContent';

export const FileUploaderItem = forwardRef<
  HTMLDivElement,
  { index: number } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, children, ...props }, ref) => {
  const { removeFileFromSet, activeIndex, direction } = useFileUpload();
  const isSelected = index === activeIndex;
  return (
    <div
      ref={ref}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'relative h-6 cursor-pointer justify-between p-1',
        className,
        isSelected ? 'bg-muted' : '',
      )}
      {...props}>
      <div className="flex h-full w-full items-center gap-1.5 font-medium leading-none tracking-tight">
        {children}
      </div>
      <button
        type="button"
        className={cn('absolute', direction === 'rtl' ? 'top-1 left-1' : 'top-1 right-1')}
        onClick={() => removeFileFromSet(index)}>
        <span className="sr-only">remove item {index}</span>
        <RemoveIcon className="h-4 w-4 duration-200 ease-in-out hover:stroke-destructive" />
      </button>
    </div>
  );
});

FileUploaderItem.displayName = 'FileUploaderItem';

export const FileInput = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { dropzoneState, isFileTooBig, isLOF } = useFileUpload();
    const rootProps = isLOF ? {} : dropzoneState.getRootProps();
    let borderColor = 'border-gray-300';

    if (dropzoneState.isDragAccept) {
      borderColor = 'border-green-500';
    } else if (dropzoneState.isDragReject || isFileTooBig) {
      borderColor = 'border-red-500';
    }

    return (
      <div
        ref={ref}
        {...props}
        className={`relative w-full ${
          isLOF ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer '
        }`}>
        <div
          className={cn('w-full rounded-xl border-dashed bg-background', borderColor, className)}
          {...rootProps}>
          {children}
        </div>
        <Input
          ref={dropzoneState.inputRef}
          disabled={isLOF}
          {...dropzoneState.getInputProps()}
          className={`${isLOF ? 'cursor-not-allowed' : ''}`}
        />
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';
