import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { BulkActionProvider } from '../contexts/BulkActionContext';
import BulkActionBar from '../components/common/BulkActionBar';

export const AdminLayout = () => {
  return (
    <BulkActionProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader /> 
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet /> 
            </div>
          </main>
        </div>
        <BulkActionBar />
      </div>
    </BulkActionProvider>
  );
};