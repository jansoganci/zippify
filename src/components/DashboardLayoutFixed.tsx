import { ReactNode } from 'react';
import { 
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
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
          {/* Mobile Header with Sidebar Trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:hidden border-b">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <img 
                src="/images/logo.svg" 
                alt="Listify Logo" 
                className="h-8 w-auto"
              />
            </div>
          </header>
          
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