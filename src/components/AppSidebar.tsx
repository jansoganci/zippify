
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  ListChecks, 
  User, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed: boolean;
};

const SidebarItem = ({ icon: Icon, label, href, isActive = false, isCollapsed }: SidebarItemProps) => {
  return (
    <Link 
      to={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-300 ease-in-out",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        isCollapsed && "justify-center"
      )}
    >
      <Icon size={22} />
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
};

type AppSidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const AppSidebar = ({ isCollapsed, toggleSidebar }: AppSidebarProps) => {
  const activeRoute = window.location.pathname;

  return (
    <aside 
      className={cn(
        "bg-sidebar h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="p-4 flex items-center">
        {!isCollapsed && (
          <span className="text-sidebar-foreground font-semibold text-xl tracking-tight">EtsyElevate</span>
        )}
      </div>
      
      <div className="mt-8 flex-1 px-2">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          href="/" 
          isActive={activeRoute === '/'} 
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={FilePlus} 
          label="Create Listing" 
          href="/create" 
          isActive={activeRoute === '/create'} 
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={ListChecks} 
          label="My Listings" 
          href="/listings" 
          isActive={activeRoute === '/listings'} 
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={User} 
          label="Profile" 
          href="/profile" 
          isActive={activeRoute === '/profile'} 
          isCollapsed={isCollapsed}
        />
      </div>
      
      <button 
        onClick={toggleSidebar}
        className="m-4 p-2 rounded-full bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors flex items-center justify-center self-end"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default AppSidebar;
