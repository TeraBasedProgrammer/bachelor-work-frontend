import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

class InvalidLoginError extends CredentialsSignin {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { handlers, auth } = NextAuth({
  providers: [
    // 🔹 Credentials provider (email/password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      // @ts-expect-error credentials is not typed
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new InvalidLoginError(data.detail || 'Invalid credentials');
        }

        return {
          token: data.token,
          user: data.user, // 🔹 Return the full user object
        };
      },
    }),

    // 🔹 Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // @ts-expect-error profile is not typed
      async profile(profile, tokens) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/auth/login/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: tokens.id_token, // 🔹 Send Google's ID token to FastAPI
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.detail || 'Google authentication failed');
          }

          return {
            token: data.token,
            user: data.user, // 🔹 Return the full user object
          };
        } catch (error: any) {
          throw new Error(error.message || 'Something went wrong with Google login');
        }
      },
    }),
  ],

  // 🔹 Use JWT to store session token
  session: {
    strategy: 'jwt',
  },

  // 🔹 Custom callbacks for session and token
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        token.user = session.user;
      }

      if (user) {
        // @ts-expect-error user is not typed
        token.accessToken = user.token;
        // @ts-expect-error user is not typed
        token.user = user.user || null;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      // @ts-expect-error user is not typed
      session.user = token.user || session.user;
      return session;
    },
  },

  // 🔹 You can set a custom secret or use NEXTAUTH_SECRET from env
  secret: process.env.NEXTAUTH_SECRET,
});
