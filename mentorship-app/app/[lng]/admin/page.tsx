import UserVerifications from './components/UserVerifications';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <UserVerifications />
    </div>
  );
}
