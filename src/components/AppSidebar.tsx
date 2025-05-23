import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  ListChecks, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Image,
  Sparkles,
  Moon,
  Sun,
  Globe,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/contexts/ProfileContext';

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
        "flex items-center gap-3 px-3 py-3 my-1 rounded-lg theme-transition focus-enhanced",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent/60",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon size={20} />
      {!isCollapsed && <span className="font-medium text-sm">{label}</span>}
    </Link>
  );
};

type AppSidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const AppSidebar = ({ isCollapsed, toggleSidebar }: AppSidebarProps) => {
  const activeRoute = window.location.pathname;
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { profileData, isLoading } = useProfile();

  // Theme functionality from Header
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // User info functions from Header
  const getUserInitial = () => {
    if (isLoading || !profileData) return '...';
    if (profileData?.firstName) {
      return profileData.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (isLoading || !profileData) return 'Loading...';
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    if (profileData?.firstName) {
      return profileData.firstName;
    }
    return 'User';
  };

  const getUserEmail = () => {
    if (isLoading || !profileData) return 'Loading...';
    return profileData?.email || 'No email set';
  };

  return (
    <aside 
      className={cn(
        "bg-sidebar h-screen fixed top-0 left-0 flex flex-col theme-transition border-r border-sidebar-border/60 dark:border-sidebar-border/30 z-50 shadow-enhanced-dark",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border/30 dark:border-sidebar-border/20">
        <Link to="/" className="flex items-center justify-center">
          <div className="flex-shrink-0">
            <img 
              src="/images/logo.svg" 
              alt="Listify Logo" 
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "h-8 w-auto" : "h-12 w-auto"
              )}
            />
          </div>
        </Link>
      </div>
      
      {/* Navigation Section */}
      <div className="flex-1 px-3 py-4">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          href="/" 
          isActive={activeRoute === '/'} 
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Search} 
          label="SEO & Keywords" 
          href="/seo-keywords" 
          isActive={activeRoute === '/seo-keywords'} 
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
          icon={Image} 
          label="Edit Image" 
          href="/edit-image" 
          isActive={activeRoute === '/edit-image'} 
          isCollapsed={isCollapsed}
        />
        {/* New Feature - Only show in development */}
        {import.meta.env.DEV && (
          <SidebarItem 
            icon={Sparkles} 
            label="New Feature" 
            href="/edit-image-gpt" 
            isActive={activeRoute === '/edit-image-gpt'} 
            isCollapsed={isCollapsed}
          />
        )}
        <SidebarItem 
          icon={ListChecks} 
          label="My Listings" 
          href="/listings" 
          isActive={activeRoute === '/listings'} 
          isCollapsed={isCollapsed}
        />
      </div>
      
      {/* User Profile Section */}
      <div className="border-t border-sidebar-border/30 dark:border-sidebar-border/20 p-4">
        {!isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30 font-semibold">
                    {getUserInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <p className="text-sm font-medium">{getFullName()}</p>
                  <p className="text-xs text-sidebar-foreground/70">{getUserEmail()}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="right" 
              align="end" 
              className="w-56 ml-2"
            >
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <User size={16} />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Globe size={16} />
                <span>Language</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={toggleTheme} 
                className="cursor-pointer flex items-center gap-2"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={() => {
                  localStorage.removeItem('zippify_token');
                  localStorage.removeItem('theme'); 
                  navigate('/login');
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Collapsed state - just avatar
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full h-12">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30 font-semibold">
                    {getUserInitial()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="right" 
              align="end" 
              className="w-56 ml-2"
            >
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30 font-semibold">{getUserInitial()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{getFullName()}</p>
                  <p className="text-xs text-muted-foreground">{getUserEmail()}</p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <User size={16} />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Globe size={16} />
                <span>Language</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={toggleTheme} 
                className="cursor-pointer flex items-center gap-2"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={() => {
                  localStorage.removeItem('zippify_token');
                  localStorage.removeItem('theme'); 
                  navigate('/login');
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Collapse Button */}
      <div className="p-4 border-t border-sidebar-border/30 dark:border-sidebar-border/20">
        <button 
          onClick={toggleSidebar}
          className="w-full p-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 dark:bg-sidebar-accent/20 dark:hover:bg-sidebar-accent/40 transition-colors flex items-center justify-center shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;