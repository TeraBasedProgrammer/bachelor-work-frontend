import Header from '@/components/ui/header';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[url('/profile-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <Header />
      {children}
    </div>
  );
}
