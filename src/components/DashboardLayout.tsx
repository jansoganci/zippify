import { useState, ReactNode } from 'react';
import AppSidebar from './AppSidebar';
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
  <div className="min-h-screen w-full bg-background dark:bg-background flex">
    <AppSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div 
      className="flex flex-col flex-1 transition-all duration-300"
      style={{ 
        marginLeft: sidebarCollapsed ? '72px' : '260px',
        width: `calc(100% - ${sidebarCollapsed ? '72px' : '260px'})`
      }}
    >
      <main className="flex-1 pt-6 pb-6 px-6">
        <div className="max-w-7xl mx-auto w-full page-transition">
          {children}
        </div>
      </main>
      <footer className="w-full h-8 bg-background border-t border-border/60 dark:border-border/30 py-1">
        <Footer variant="compact" />
      </footer>
    </div>
  </div>
);
};

export default DashboardLayout;
