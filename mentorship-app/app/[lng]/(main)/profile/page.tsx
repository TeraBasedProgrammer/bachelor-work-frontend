import Profile from './components/Profile';

export default async function ProfilePage() {
  return (
    <div className="bg-[url('/profile-bg.jpg')] bg-cover bg-center bg-no-repeat h-full">
      <Profile />
    </div>
  );
}
