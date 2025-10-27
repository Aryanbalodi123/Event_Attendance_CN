import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Remove 'flex' and the Sidebar component
    <div className="dark min-h-screen bg-black text-gray-300">
      {/* Center the content with max-width and padding */}
      <main className="w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
