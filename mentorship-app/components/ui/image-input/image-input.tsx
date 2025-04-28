import { CloudUpload, Paperclip } from 'lucide-react';
import { MdOutlineCancel } from 'react-icons/md';
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '../file-upload';

export type FileInputComponentProps = {
  files: File[];
  onChange: (...event: unknown[]) => void;
  maxFiles?: number;
  inputId: string;
  onClose?: () => void;
  accept?: string; // NEW: accept specific file types
  placeholder?: string; // NEW: custom placeholder
  helpText?: string; // NEW: bottom label text
};

export const FileInputComponent = ({
  files,
  onChange,
  maxFiles,
  inputId,
  onClose,
  accept = 'image/*',
  placeholder = 'Click to upload or drag and drop',
  helpText = 'File (up to 4MB)',
}: FileInputComponentProps) => {
  const dropZoneConfig = {
    maxFiles: maxFiles ?? 1,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
    accept: { [accept]: [] },
  };

  return (
    <div className="relative">
      <FileUploader
        value={files ?? []}
        onValueChange={onChange}
        dropzoneOptions={dropZoneConfig}
        className="relative rounded-xl border-2 border-slate-500 border-dashed bg-background">
        <FileInput id={inputId}>
          <div className="justify-left flex h-11 max-h-11 w-full items-center gap-2 px-4">
            <CloudUpload className="h-6 w-6 text-blue-brand" />
            <div className="flex flex-col">
              <p className="mb-0.5 text-[13px]">{placeholder}</p>
              <p className="text-gray-quartz text-xs">{helpText}</p>
            </div>
          </div>
        </FileInput>
        <FileUploaderContent>
          {files &&
            files.length > 0 &&
            files.map((file, i) => (
              <FileUploaderItem key={`${file.name}-${i}`} index={i}>
                <Paperclip className="h-4 w-4 stroke-current" />
                <span>{file.name}</span>
              </FileUploaderItem>
            ))}
        </FileUploaderContent>
      </FileUploader>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center">
          <MdOutlineCancel className="h-6 w-6 text-slate-500 hover:text-slate-600" />
        </button>
      )}
    </div>
  );
};
