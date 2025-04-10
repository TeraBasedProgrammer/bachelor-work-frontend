import React from 'react';

function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat">
      <div className="w-1/3 mx-auto px-4 text-white">{children}</div>
    </div>
  );
}

export default Layout;
