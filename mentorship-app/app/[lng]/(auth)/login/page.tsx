import LoginForm from './form';

export default function LoginPage({ params: { lng } }: { params: { lng: string } }) {
  return <LoginForm lng={lng} />;
}
