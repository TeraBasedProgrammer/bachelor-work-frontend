import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function MyPostsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect('/en/login');
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="container mx-auto py-8">{children}</div>
    </div>
  );
}
