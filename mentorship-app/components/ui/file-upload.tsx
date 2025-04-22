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
  useRef,
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

const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
  'image/avif',
];

export const imageInputValidation = (hasExistingImage: boolean) =>
  z
    .array(
      z
        .custom<File>((file) => file instanceof File, 'Invalid file format')
        .refine((file) => file.size <= 4 * 1024 * 1024, 'File must be under 4MB')
        .refine(
          (file) => allowedFileTypes.includes(file.type),
          'Allowed formats: SVG, PNG, JPG, WEBP, AVIF',
        ),
    )
    .optional();

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
      accept = {
        'image/*': ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.avif'],
      },
      maxFiles = maxFileCount ?? 1,
      maxSize = 4 * 1024 * 1024,
      multiple = true,
    } = dropzoneOptions;

    const reSelectAll = maxFiles === 1 ? true : reSelect;
    const direction: DirectionOptions = dir === 'rtl' ? 'rtl' : 'ltr';

    const removeFileFromSet = useCallback(
      (i: number) => {
        if (!value) {
          return;
        }
        const newFiles = value.filter((_, index) => index !== i);
        onValueChange(newFiles);
      },
      [value, onValueChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!value) {
          return;
        }

        const moveNext = () => {
          const nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex);
        };

        const movePrev = () => {
          const nextIndex = activeIndex - 1;
          setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex);
        };

        let prevKey: string;
        let nextKey: string;

        if (orientation === 'horizontal') {
          if (direction === 'ltr') {
            prevKey = 'ArrowLeft';
            nextKey = 'ArrowRight';
          } else {
            prevKey = 'ArrowRight';
            nextKey = 'ArrowLeft';
          }
        } else {
          prevKey = 'ArrowUp';
          nextKey = 'ArrowDown';
        }

        if (e.key === nextKey) {
          moveNext();
        } else if (e.key === prevKey) {
          movePrev();
        } else if (e.key === 'Enter' || e.key === 'Space') {
          if (activeIndex === -1) {
            dropzoneState.inputRef.current?.click();
          }
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (activeIndex !== -1) {
            removeFileFromSet(activeIndex);
            if (value.length - 1 === 0) {
              setActiveIndex(-1);
              return;
            }
            movePrev();
          }
        } else if (e.key === 'Escape') {
          setActiveIndex(-1);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [value, activeIndex, removeFileFromSet, orientation, direction],
    );

    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        if (!acceptedFiles || acceptedFiles.length === 0) {
          toast({
            title: 'Error',
            description: 'Uploaded files must be under 4mb',
            variant: 'destructive',
          });
          return;
        }

        // Filter files that match the allowed formats
        const validFiles = acceptedFiles.filter((file) => allowedFileTypes.includes(file.type));

        if (validFiles.length === 0) {
          toast({
            title: 'Incorrect file format',
            description: 'Allowed formats: SVG, PNG, JPG, WEBP, AVIF',
            variant: 'destructive',
          });
          return;
        }

        const newValues: File[] = value ? [...value] : [];

        if (reSelectAll) {
          newValues.splice(0, newValues.length);
        }

        validFiles.forEach((file) => {
          if (newValues.length < maxFiles) {
            newValues.push(file);
          }
        });

        onValueChange(newValues);

        rejectedFiles.forEach(({ errors, file }) => {
          if (errors.some((err) => err.code === 'file-too-large')) {
            toast({
              title: 'Error',
              description: `File ${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`,
              variant: 'destructive',
            });
          } else if (!allowedFileTypes.includes(file.type)) {
            toast({
              title: 'Error',
              description: `Invalid file type: ${file.name}. Allowed formats: JPG, PNG, JPEG, SVG, WEBP, AVIF`,
              variant: 'destructive',
            });
          } else if (errors.length > 0) {
            toast({
              title: 'Error',
              description: errors[0].message,
              variant: 'destructive',
            });
          }
        });
      },
      [reSelectAll, value, maxFiles, maxSize, onValueChange],
    );

    useEffect(() => {
      if (!value) {
        return;
      }
      if (value.length === maxFiles) {
        setIsLOF(true);
        return;
      }
      setIsLOF(false);
    }, [value, maxFiles]);

    const opts = dropzoneOptions || { accept, maxFiles, maxSize, multiple };

    const dropzoneState = useDropzone({
      ...opts,
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
          onKeyDownCapture={handleKeyDown}
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
    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <div
        className={cn('w-full px-1')}
        ref={containerRef}
        aria-describedby="file-holder-description">
        <span id="file-holder-description" className="sr-only">
          Content file holder
        </span>
        <div
          {...props}
          ref={ref}
          className={cn(
            'flex gap-1 rounded-xl',
            orientation === 'horizontal' ? 'flex-raw flex-wrap' : 'flex-col',
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
          className={cn('w-full rounded-lg duration-300 ease-in-out', borderColor, className)}
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
