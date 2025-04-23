import { UserData } from '@/app/types';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: UserData;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    user: UserData;
  }
}
