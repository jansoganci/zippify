import { useState, ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import Header from './Header';
import Footer from '@/components/layout/Footer';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  return (
  <div className="min-h-screen w-full bg-background flex flex-col">
    <Header />
    <div className="flex flex-1 w-full h-full min-h-screen">
      <AppSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main 
        className="flex-1 pt-4 pb-6 px-6 transition-all duration-300"
        style={{ width: '100%' }}
      >
        <div className="max-w-7xl mx-auto w-full page-transition flex flex-col min-h-[calc(100%-2rem)]">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
    <footer className="w-full h-8 bg-background border-t py-1">
      <Footer variant="compact" />
    </footer>
  </div>
);
};

export default DashboardLayout;
