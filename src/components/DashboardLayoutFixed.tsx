import { ReactNode } from 'react';
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import Footer from '@/components/layout/Footer';
import AppSidebar from '@/components/AppSidebar';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayoutFixed = ({ children }: DashboardLayoutProps) => {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
          <footer className="border-t p-4">
            <Footer variant="compact" />
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayoutFixed; 