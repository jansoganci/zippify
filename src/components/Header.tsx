import { useState } from 'react';
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
  // This would come from a theme context in a real app
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd update the theme here
  };
  
  return (
    <header 
      className="
        sticky top-0 z-50 
        w-full 
        backdrop-blur-sm 
        bg-white/80 dark:bg-gray-900/80 
        border-b border-gray-200 dark:border-gray-700
      "
    >
      <div className="h-16 flex items-center justify-between px-6 max-w-7xl mx-auto">
        <div className="flex items-center">
          <div className="text-2xl font-semibold tracking-tight text-primary">EtsyElevate</div>
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
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <User size={16} />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive">
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
