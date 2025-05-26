'use client';

import { Home, LogOut, MessageCircle, Pencil, User } from 'lucide-react';
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
import { LangSwitcher } from './language-switcher';

export default function Header() {
  const { lng } = useParams();
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <nav
        className="mx-auto flex items-center justify-between p-4 sm:px-6 lg:px-8"
        aria-label="Global">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href={`/${lng}`}>
            <div className="flex items-center gap-2">
              <img
                className="h-8 w-auto"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                alt="Logo"
              />
              <span className="font-bold text-lg text-gray-800 hidden sm:block">MyApp</span>
            </div>
          </Link>
        </div>

        {/* Centered navigation links */}
        <div className="hidden md:flex gap-8 items-center text-gray-700 font-medium">
          <Link href={`/${lng}`} className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href={`/${lng}/my-posts`} className="hover:text-blue-600 transition-colors">
            My Posts
          </Link>
          <Link href={`/${lng}/chats`} className="hover:text-blue-600 transition-colors">
            Chats
          </Link>
          <Link href={`/${lng}/profile`} className="hover:text-blue-600 transition-colors">
            Profile
          </Link>
          <Link href={`/${lng}/invoices`} className="hover:text-blue-600 transition-colors">
            Invoices
          </Link>
        </div>

        {/* Right part */}
        <div className="flex items-center gap-6">
          <LangSwitcher lng={lng as string} />
          {/* Balance */}
          <div className="flex items-center gap-2 text-gray-600">
            <PiCoinVerticalFill className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{session?.user?.balance ?? 0}</span>
          </div>

          {/* Avatar menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-10 h-10 cursor-pointer">
                <AvatarImage
                  src={
                    session?.user?.profile_picture
                      ? `${session.user.profile_picture}?v=${new Date().getTime()}`
                      : 'https://github.com/shadcn.png'
                  }
                  alt="User avatar"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-white shadow-md rounded-md">
              <DropdownMenuItem asChild>
                <Link href={`/${lng}`} className="flex items-center gap-2">
                  <Home size={18} />
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lng}/my-posts`} className="flex items-center gap-2">
                  <Pencil size={18} />
                  My Posts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lng}/chats`} className="flex items-center gap-2">
                  <MessageCircle size={18} />
                  Chats
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lng}/profile`} className="flex items-center gap-2">
                  <User size={18} />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  signOut({
                    callbackUrl: `/${lng}/login`,
                  })
                }
                className="flex cursor-pointer flex-row gap-2 items-center text-red-500">
                <LogOut size={18} />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
