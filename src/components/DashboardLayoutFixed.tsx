import { ReactNode } from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FilePlus, 
  ListChecks, 
  User, 
  Search,
  Image,
  Sparkles,
  Moon,
  Sun,
  Globe,
  LogOut
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

type DashboardLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "SEO & Keywords",
    url: "/seo-keywords",
    icon: Search,
  },
  {
    title: "Create Listing",
    url: "/create",
    icon: FilePlus,
  },
  {
    title: "Edit Image",
    url: "/edit-image",
    icon: Image,
  },
  {
    title: "New Feature",
    url: "/edit-image-gpt",
    icon: Sparkles,
  },
  {
    title: "My Listings",
    url: "/listings",
    icon: ListChecks,
  },
];

const DashboardLayoutFixed = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { profileData, isLoading } = useProfile();

  // Theme functionality
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

  // User info functions
  const getUserInitial = () => {
    if (isLoading) return '...';
    if (profileData?.firstName) {
      return profileData.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (isLoading) return 'Loading...';
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return 'User';
  };

  const getUserEmail = () => {
    if (isLoading) return 'Loading...';
    return profileData?.email || 'user@example.com';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <div className="flex h-16 items-center justify-center border-b px-4">
              <Link to="/" className="flex items-center justify-center">
                <img 
                  src="/images/logo.svg" 
                  alt="Listify Logo" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            {/* Hidden accessibility elements for mobile sidebar dialog */}
            <VisuallyHidden.Root asChild>
              <h2>Navigation Menu</h2>
            </VisuallyHidden.Root>
            <VisuallyHidden.Root asChild>
              <p>Access all application features and pages from this navigation menu</p>
            </VisuallyHidden.Root>
            
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:hidden">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback className="rounded-lg">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{getFullName()}</span>
                      <span className="truncate text-xs text-muted-foreground">{getUserEmail()}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
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
                <SidebarTrigger className="h-8 w-8" />
              </div>
          </SidebarFooter>
        </Sidebar>
        
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