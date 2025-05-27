import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
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
  LogOut,
  TrendingUp
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/contexts/ProfileContext';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Advanced Keywords",
    url: "/advanced-keywords",
    icon: TrendingUp,
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
    title: "My Listings",
    url: "/listings",
    icon: ListChecks,
  },
];

const AppSidebar = () => {
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
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex h-16 items-center justify-center border-b px-4 theme-transition">
          <Link to="/" className="flex items-center justify-center focus-enhanced rounded-lg">
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
              <button className="flex items-center gap-2 p-2 rounded-md bg-sidebar hover:bg-sidebar-accent hover:text-sidebar-accent-foreground theme-transition outline-none ring-sidebar-ring focus-visible:ring-2 group-data-[collapsible=icon]:hidden transition-[width,height,padding]">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30 font-semibold text-sm">
                    {getUserInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid text-left text-sm leading-tight min-w-0 flex-1">
                  <span className="truncate font-medium text-sidebar-foreground">{getFullName()}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{getUserEmail()}</span>
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
  );
};

export default AppSidebar;