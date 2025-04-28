import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user.is_admin) {
    redirect('/en/profile');
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="container mx-auto py-8">{children}</div>
    </div>
  );
}
