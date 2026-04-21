import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import useAuth from '../hooks/useAuth'; // Import useAuth hook
import { BulkActionProvider } from '../contexts/BulkActionContext'; // Import BulkActionProvider
import BulkActionBar from '../components/common/BulkActionBar'; // Import BulkActionBar

export const AdminLayout = () => {
  const { logout } = useAuth(); // Destructure logout from useAuth

  return (
    <BulkActionProvider> {/* Wrap AdminLayout content with BulkActionProvider */}
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Truyền hàm logout xuống Header */}
          <AdminHeader onLogout={logout} /> 
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet /> 
            </div>
          </main>
        </div>
        <BulkActionBar /> {/* Render BulkActionBar here */}
      </div>
    </BulkActionProvider>
  );
};