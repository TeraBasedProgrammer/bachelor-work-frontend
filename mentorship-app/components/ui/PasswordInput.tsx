import { Input } from '@/components/ui/input';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';

interface PasswordInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PasswordInput({
  control,
  name,
  disabled,
  placeholder = 'Password',
}: Readonly<PasswordInputProps>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 pr-3 top-1/2 -translate-y-1/2 flex items-center text-sm leading-5">
            {showPassword ? <EyeClosedIcon className="w-4" /> : <EyeOpenIcon className="w-4" />}
          </button>
        </div>
      )}
    />
  );
}
