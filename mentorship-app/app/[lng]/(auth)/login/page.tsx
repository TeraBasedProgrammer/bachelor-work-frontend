import LoginForm from './form';

export default async function LoginPage({ params }: { params: Promise<{ lng: string }> }) {
  const { lng } = await params;
  return <LoginForm lng={lng} />;
}
