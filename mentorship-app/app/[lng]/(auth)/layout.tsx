import React from 'react';

function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-center py-44">
      <div className="w-1/2 flex items-center justify-center">{children}</div>
    </div>
  );
}

export default Layout;
