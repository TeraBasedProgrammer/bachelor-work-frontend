import Profile from './components/Profile';

export default async function ProfilePage({ params }: { params: Promise<{ lng: string }> }) {
  const { lng } = await params;
  return (
    <div className="bg-[url('/profile-bg.jpg')] bg-cover bg-center bg-no-repeat h-full">
      <Profile lng={lng} />
    </div>
  );
}
