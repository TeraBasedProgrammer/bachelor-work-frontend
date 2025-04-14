// app/[lng]/profile/page.tsx or similar
import { auth } from '@/auth';
import ProfileForm from './form';

export default async function ProfilePage() {
  const session = await auth();

  return <ProfileForm session={session} />;
}
