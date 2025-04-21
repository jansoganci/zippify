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

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

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
  
  return (
    <header className="w-full h-16 flex items-center justify-between px-8 bg-background/90 border-b border-border shadow-sm">
      {/* Logo & Marka */}
      <div className="flex items-center gap-2">
        {/* Logo örnek: */}
        <div className="rounded-full bg-primary/80 text-white w-8 h-8 flex items-center justify-center font-bold text-lg">L</div>
        <span className="text-2xl font-bold tracking-tight text-primary">listify.digital</span>
      </div>

      {/* Orta Menü */}
      <nav className="flex-1 flex justify-center">
        <div className="flex gap-4 px-6 py-2 rounded-full border border-primary/40 bg-background/80 shadow-md">
          <NavLink to="/seo-keywords" className="font-medium px-3 py-1 rounded hover:bg-primary/10">SEO</NavLink>
          <NavLink to="/create" className="font-medium px-3 py-1 rounded hover:bg-primary/10">Listings</NavLink>
          <NavLink to="/edit-image" className="font-medium px-3 py-1 rounded hover:bg-primary/10">Images</NavLink>
        </div>
      </nav>

      {/* Profil Dropdown (Aynen kalacak) */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1 animate-fade-in">
            <div className="flex items-center justify-start gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
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
