
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
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

const Header = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleLogout = () => {
    // Remove auth tokens from localStorage
    localStorage.removeItem('zippify_token');
    localStorage.removeItem('zippify_user');
    
    // Redirect to login page
    navigate('/login');
  };
  
  return (
    <header className="h-16 bg-background/80 backdrop-blur-sm border-b border-[hsl(var(--border))] fixed top-0 right-0 left-0 z-50 header-shadow flex items-center justify-between px-6">
      <div className="flex items-center">
        <div className="text-2xl font-semibold tracking-tight text-primary">Zippify</div>
      </div>
      
      <div className="flex items-center gap-4">
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
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === "dark" ? 'Light Mode' : 'Dark Mode'}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="cursor-pointer flex items-center gap-2"
            >
              <User size={16} />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
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
