import { useState, useEffect } from 'react';
import { User, Moon, Sun, Globe, LogOut } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { NavLink, useNavigate } from "react-router-dom";
import { useProfile } from '@/hooks/useProfile';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { profileData, isLoading } = useProfile();

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

  // Kullanıcı adının ilk harfini al
  const getUserInitial = () => {
    if (isLoading) return '...';
    if (profileData?.firstName) {
      return profileData.firstName.charAt(0).toUpperCase();
    }
    return 'U'; // fallback
  };

  // Tam kullanıcı adını al
  const getFullName = () => {
    if (isLoading) return 'Loading...';
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return 'User'; // fallback
  };

  // Email'i al
  const getUserEmail = () => {
    if (isLoading) return 'Loading...';
    return profileData?.email || 'user@example.com'; // fallback
  };
  
  return (
    <header className="w-full h-20 flex items-center justify-between px-8 bg-background/90 border-b border-border/60 dark:border-border/30 shadow-sm">
      {/* Logo & Marka */}
      <div className="flex items-center gap-2">
        <NavLink to="/" className="flex items-center">
          {/* Logo görsel */}
          <div>
            <img 
              src="/images/logo.seffaf.webp" 
              alt="Listify Logo" 
              style={{ height: '80px', width: 'auto' }}
            />
          </div>
        </NavLink>
      </div>

      {/* Orta Menü */}
      <nav className="flex-1 flex justify-center">
        <div className="flex gap-4 px-6 py-2 rounded-full border border-primary/40 dark:border-primary/30 bg-background/80 dark:bg-background/60 shadow-md">
          <NavLink to="/seo-keywords" className="font-medium px-3 py-1 rounded hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">SEO</NavLink>
          <NavLink to="/create" className="font-medium px-3 py-1 rounded hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">Listings</NavLink>
          <NavLink to="/edit-image" className="font-medium px-3 py-1 rounded hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">Images</NavLink>
        </div>
      </nav>

      {/* Profil Dropdown (Güncellenmiş) */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>{getUserInitial()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1 animate-fade-in border-border/60 dark:border-border/30">
            <div className="flex items-center justify-start gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>{getUserInitial()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{getFullName()}</p>
                <p className="text-xs text-muted-foreground">{getUserEmail()}</p>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
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
            
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2"
              onClick={() => navigate('/profile')}
            >
              <User size={16} />
              <span>Profile</span>
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
      </div>
    </header>
  );
};

export default Header;
