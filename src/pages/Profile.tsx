import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Save, User, Store, AlertCircle, Mail, Building, Sun, Moon } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';

// Helper to extract user-friendly error messages
function getUserFriendlyError(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    (error as any).response?.data
  ) {
    const data = (error as any).response.data;
    return data.userMessage || data.message || (error as any).message || 'There was a problem loading your profile information.';
  }
  return (error as any)?.message || 'There was a problem loading your profile information.';
}

const Profile = () => {
  const {
    formData,
    handleChange,
    handleThemeChange,
    handleSubmit,
    isLoading,
    isUpdating,
    error
  } = useProfile();
  
  const { setTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6 page-transition">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile Settings</h1>
          </div>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted/30 dark:border-muted/10">
            Manage your account information and Etsy store details.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40"></div>
              <CardHeader className="bg-muted/10 dark:bg-muted/5">
                <CardTitle className="text-xl font-semibold text-foreground">Personal Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your personal information and store name.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {getUserFriendlyError(error)}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 group">
                    <Label htmlFor="firstName" className="flex items-center gap-2 text-foreground">
                      <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Your first name"
                      value={formData.firstName ?? ""}
                      onChange={handleChange}
                      className="border-input/60 focus-visible:ring-primary/20 bg-background"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="lastName" className="flex items-center gap-2 text-foreground">
                      <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Your last name"
                      value={formData.lastName ?? ""}
                      onChange={handleChange}
                      className="border-input/60 focus-visible:ring-primary/20 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                    <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={formData.email ?? ""}
                    disabled
                    className="border-input/60 bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Your email address cannot be changed here.</p>
                </div>

                <div className="h-px w-full my-4 bg-border/60 dark:bg-border/40" />
                
                <div className="space-y-2 group">
                  <Label htmlFor="storeName" className="flex items-center gap-2 text-foreground">
                    <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                      <Store className="h-4 w-4 text-primary" />
                    </div>
                    Store Name
                  </Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    placeholder="Your Etsy store name"
                    value={formData.storeName ?? ""}
                    onChange={handleChange}
                    className="border-input/60 focus-visible:ring-primary/20 bg-background"
                  />
                </div>
                
                <div className="h-px w-full my-4 bg-border/60 dark:bg-border/40" />
                
                <div className="space-y-2 group">
                  <Label htmlFor="theme" className="flex items-center gap-2 text-foreground">
                    <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                      {formData.theme === 'dark' ? (
                        <Moon className="h-4 w-4 text-primary" />
                      ) : (
                        <Sun className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    Theme Preference
                  </Label>
                  
                  <div className="mt-2">
                    <RadioGroup 
                      id="theme"
                      value={formData.theme || 'light'} 
                      onValueChange={(value) => {
                        handleThemeChange(value);
                        setTheme(value); // Apply theme immediately
                      }}
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <div className="flex items-center space-x-2 rounded-md border border-input/60 px-3 py-2 bg-background">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light" className="flex items-center gap-2 cursor-pointer">
                          <Sun className="h-4 w-4" />
                          Light Theme
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 rounded-md border border-input/60 px-3 py-2 bg-background">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark" className="flex items-center gap-2 cursor-pointer">
                          <Moon className="h-4 w-4" />
                          Dark Theme
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t border-border/40 bg-muted/5 dark:bg-muted/10">
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex items-center gap-2 shadow-sm"
                  variant="default"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
