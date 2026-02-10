import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      {/* Add top padding on mobile for the fixed header, left margin on desktop for sidebar */}
      <main className="pt-20 px-4 pb-6 lg:pt-8 lg:pl-72 lg:pr-8">{children}</main>
    </div>
  );
}
