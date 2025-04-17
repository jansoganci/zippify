import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { User, Moon, Sun, Globe, LogOut, List } from 'lucide-react';
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
    <header className="h-14 bg-background shadow-sm fixed inset-x-0 top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center">
          <div className="flex items-center gap-2 cursor-pointer group">
            <List size={24} className="text-primary transition-transform duration-200 group-hover:scale-105" />
            <span className="text-2xl font-semibold tracking-tight text-primary transition-transform duration-200 group-hover:scale-105 border-b-2 border-transparent group-hover:border-primary">
              Listify
            </span>
          </div>
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
      </div>
    </header>
  );
};

export default Header;
