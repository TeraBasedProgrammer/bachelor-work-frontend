import axios from 'axios';
import NextAuth, { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Attempting login with:', credentials.email);
          // Call your FastAPI backend to authenticate
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/users/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            },
          );

          console.log('Login response:', response.data);

          if (response.data && response.data.token) {
            // Return user object with token
            return {
              id: '1', // We'll update this with user info in the session callback
              email: credentials.email,
              name: credentials.email, // We'll update this with user info in the session callback
              accessToken: response.data.token,
            } as User;
          }
          console.log('No token in response');
          return null;
        } catch (error: any) {
          console.error('Authentication error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For Google OAuth
        if (account.provider === 'google') {
          try {
            console.log('Exchanging Google token');
            // Exchange Google token for your backend JWT
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google`,
              {
                token: account.id_token,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 10000,
              },
            );

            console.log('Google token exchange response:', response.data);

            if (response.data && response.data.token) {
              token.accessToken = response.data.token;
            }
          } catch (error: any) {
            console.error('Google token exchange error:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
          }
        }
        // For credentials login
        else if (user.accessToken) {
          token.accessToken = user.accessToken;
        }

        // Try to fetch user info if we have a token
        if (token.accessToken) {
          try {
            const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            });
            if (userResponse.data) {
              token.userId = userResponse.data.id;
              token.name = userResponse.data.name;
              token.email = userResponse.data.email;
            }
          } catch (error) {
            console.error('Error fetching user info:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      if (token.userId) session.user.id = token.userId as string;
      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },
  pages: {
    signIn: '/en/login',
    error: '/en/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
