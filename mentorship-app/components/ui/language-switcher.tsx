'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { languageNames, languages } from '@/app/i18n/settings';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils/functions/styles';
import { CheckIcon } from '@radix-ui/react-icons';

import { ChevronDown } from 'lucide-react';

type Props = {
  lng: string;
  className?: string;
};

export function LangSwitcher({ lng, className }: Readonly<Props>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(lng);
  const router = useRouter();
  const pathName = usePathname();

  const handleLanguageSwitch = (selectedLang: string) => {
    const newPath = pathName.replace(`/${lng}/`, `/${selectedLang}/`);
    router.push(newPath);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`${cn(
            'max-w-[200px] border-0 hover:bg-transparent justify-between p-0 gap-1',
            className,
          )}`}>
          {value ? languageNames[value] : 'Select language...'}
          <ChevronDown className="ml-1 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-white">
        <Command>
          <CommandInput placeholder="Search language..." className="h-9" />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language}
                  value={language}
                  onSelect={(selectedLang) => {
                    setValue(selectedLang);
                    setOpen(false);
                    handleLanguageSwitch(selectedLang);
                  }}>
                  {languageNames[language]}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === language ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
