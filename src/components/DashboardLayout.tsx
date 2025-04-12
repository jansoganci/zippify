
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
    <div className="flex h-screen w-full bg-background">
      <AppSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main 
          className="flex-1 overflow-y-auto pt-16 pb-6 px-6 transition-all duration-300"
          style={{ 
            marginLeft: sidebarCollapsed ? 0 : 0,
            width: '100%'
          }}
        >
          <div className="max-w-7xl mx-auto w-full page-transition flex flex-col min-h-[calc(100%-2rem)]">
            <div className="flex-1">
              {children}
            </div>
            
            <footer className="w-full mt-auto h-8 bg-background border-t py-1">
              <Footer variant="compact" />
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
