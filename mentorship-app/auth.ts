import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid identifier or password';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // 🔹 Credentials provider (email/password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
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

        if (!res.ok && data) {
          return { status: res.status, error: data.detail.message };
        }

        return {
          id: data.user?.id || credentials?.email,
          email: data.user?.email || credentials?.email,
          token: data.token,
        };
      },
    }),

    // 🔹 Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            token: data.token,
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
    async jwt({ token, user }) {
      if (user?.token) {
        token.accessToken = user.token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },

  // 🔹 You can set a custom secret or use NEXTAUTH_SECRET from env
  secret: process.env.NEXTAUTH_SECRET,
});
