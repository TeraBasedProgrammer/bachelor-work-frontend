'use client';

import { LogOut, MessageCircle, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PiCoinVerticalFill } from 'react-icons/pi';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
export default function Header() {
  const { lng } = useParams();
  const { data: session } = useSession();

  return (
    <header className="bg-gray-100">
      <nav className="mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <div className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              className="h-8 w-auto"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              alt=""
            />
          </div>
        </div>
        <div className="flex gap-2 items-center justify-center mr-10">
          <span>Balance: </span>
          <span className="flex items-center gap-1">
            {session?.user?.balance} <PiCoinVerticalFill />
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={
                  session?.user?.profile_picture
                    ? `${session.user.profile_picture}?v=${new Date().getTime()}`
                    : 'https://github.com/shadcn.png'
                }
                alt="@shadcn"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-100">
            <DropdownMenuItem>
              <Link href={`/${lng}/login`} className="flex flex-row items-center gap-2">
                <User size={18} className="text-brand" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/${lng}/chats`} className="flex flex-row items-center gap-2">
                <MessageCircle size={18} className="text-brand" />
                <span>Chats</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                signOut({
                  callbackUrl: `/${lng}/login`,
                })
              }
              className="flex cursor-pointer flex-row gap-2 items-center">
              <LogOut size={18} className="text-brand" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
