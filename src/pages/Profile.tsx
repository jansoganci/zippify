import React, { useState, useEffect } from 'react';
import DashboardLayoutFixed from '@/components/DashboardLayoutFixed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Save, User, Store, AlertCircle, Mail, Building, Sun, Moon, Crown, TrendingUp, Star, ArrowUpRight, Settings, Globe, Bell, BellOff, Shield, Lock, Key, Smartphone } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const { profileData, isLoading, isUpdating, error, updateProfile } = useProfile();
  
  // Local form state
  const [formData, setFormData] = useState({
    fullName: '',
    storeName: '',
    email: '',
    theme: 'light',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
  });

  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Usage data based on user plan
  const usageStats = React.useMemo(() => {
    const isPremium = profileData?.plan === 'premium';
    const limit = isPremium ? 100 : 10;
    
    return {
      listings: { used: isPremium ? 12 : 3, limit },
      seoAnalysis: { used: isPremium ? 8 : 2, limit },
      advancedKeywords: { used: isPremium ? 5 : 1, limit },
      imageEdits: { used: isPremium ? 3 : 1, limit },
    };
  }, [profileData?.plan]);
  
  // Update form data when profile data changes
  useEffect(() => {
    if (profileData) {
      const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
      setFormData({
        fullName: fullName,
        storeName: profileData.storeName || '',
        email: profileData.email || '',
        theme: profileData.theme || 'light'
      });
    }
  }, [profileData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleThemeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      theme: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse full name into firstName and lastName
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    updateProfile({
      firstName: firstName,
      lastName: lastName,
      storeName: formData.storeName,
      theme: formData.theme
    });
  };
  
  const { setTheme } = useTheme();

  return (
    <DashboardLayoutFixed>
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
            <p className="text-sm text-muted-foreground mt-4">Loading your profile...</p>
          </div>
        ) : error ? (
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Unable to load profile</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {getUserFriendlyError(error)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Personal Information Card */}
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

                  <div className="space-y-2 group">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-foreground">
                      <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    Full Name
                    </Label>
                    <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Your full name"
                    value={formData.fullName ?? ""}
                      onChange={handleChange}
                      className="border-input/60 focus-visible:ring-primary/20 bg-background"
                    />
                  <p className="text-xs text-muted-foreground">Enter your first and last name separated by a space.</p>
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

            {/* Account Overview Card */}
            <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="bg-muted/10 dark:bg-muted/5">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-green-500/10 dark:bg-green-500/20">
                    <Crown className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Account Overview
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your current plan and usage statistics.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Plan Section */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {profileData?.plan === 'premium' ? (
                        <Star className="h-5 w-5 text-primary" />
                      ) : (
                        <Crown className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Current Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.plan === 'premium' ? 'Premium features unlocked' : 'Basic features included'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={profileData?.plan === 'premium' ? 'default' : 'secondary'}
                    className="font-semibold"
                  >
                    {profileData?.plan === 'premium' ? 'Premium' : 'Free'}
                  </Badge>
                </div>

                {/* Usage Stats */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Today's Usage
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Listings */}
                    <div className="space-y-2 p-3 rounded-lg border border-border/40 bg-background">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Listings</span>
                        <span className="text-xs text-muted-foreground">
                          {usageStats.listings.used}/{usageStats.listings.limit}
                        </span>
                      </div>
                      <Progress 
                        value={(usageStats.listings.used / usageStats.listings.limit) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* SEO Analysis */}
                    <div className="space-y-2 p-3 rounded-lg border border-border/40 bg-background">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">SEO Analysis</span>
                        <span className="text-xs text-muted-foreground">
                          {usageStats.seoAnalysis.used}/{usageStats.seoAnalysis.limit}
                        </span>
                      </div>
                      <Progress 
                        value={(usageStats.seoAnalysis.used / usageStats.seoAnalysis.limit) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Advanced Keywords */}
                    <div className="space-y-2 p-3 rounded-lg border border-border/40 bg-background">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Advanced Keywords</span>
                        <span className="text-xs text-muted-foreground">
                          {usageStats.advancedKeywords.used}/{usageStats.advancedKeywords.limit}
                        </span>
                      </div>
                      <Progress 
                        value={(usageStats.advancedKeywords.used / usageStats.advancedKeywords.limit) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Image Edits */}
                    <div className="space-y-2 p-3 rounded-lg border border-border/40 bg-background">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Image Edits</span>
                        <span className="text-xs text-muted-foreground">
                          {usageStats.imageEdits.used}/{usageStats.imageEdits.limit}
                        </span>
                      </div>
                      <Progress 
                        value={(usageStats.imageEdits.used / usageStats.imageEdits.limit) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Upgrade Section (only for free plan) */}
                {profileData?.plan !== 'premium' && (
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-foreground">Upgrade to Premium</h4>
                        <p className="text-sm text-muted-foreground">
                          Unlock 10x more daily usage and advanced features
                        </p>
                      </div>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Upgrade Now
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="bg-muted/10 dark:bg-muted/5">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20">
                    <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Preferences
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize your language and notification settings.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Language Selection */}
                <div className="space-y-2 group">
                  <Label htmlFor="language" className="flex items-center gap-2 text-foreground">
                    <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Language
                  </Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="border-input/60 focus-visible:ring-primary/20 bg-background">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="tr">Türkçe</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose your preferred language for the interface.</p>
                </div>

                <div className="h-px w-full bg-border/60 dark:bg-border/40" />

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Notifications
                  </h3>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email Notifications</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your listings and account via email
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {preferences.pushNotifications ? (
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">Push Notifications</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get instant notifications about important updates
                      </p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-border/60 dark:bg-border/40" />

                {/* Theme Selection (moved from Personal Info) */}
                <div className="space-y-2 group">
                  <Label htmlFor="theme" className="flex items-center gap-2 text-foreground">
                    <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                      {formData.theme === 'dark' ? (
                        <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Sun className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                  variant="default"
                  className="flex items-center gap-2 shadow-sm"
                  onClick={() => {
                    // Save preferences logic here
                    console.log('Saving preferences:', preferences);
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>

            {/* Security Card */}
            <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <CardHeader className="bg-muted/10 dark:bg-muted/5">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-red-500/10 dark:bg-red-500/20">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  Security
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account security and password settings.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Change Password Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    Change Password
                  </h3>

                  <div className="space-y-4 p-4 rounded-lg border border-border/40 bg-background">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="flex items-center gap-2 text-foreground">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        placeholder="Enter your current password"
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="border-input/60 focus-visible:ring-primary/20 bg-background"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="flex items-center gap-2 text-foreground">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          placeholder="Enter new password"
                          value={securitySettings.newPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="border-input/60 focus-visible:ring-primary/20 bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-foreground">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="border-input/60 focus-visible:ring-primary/20 bg-background"
                        />
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        // Change password logic here
                        console.log('Changing password:', securitySettings);
                      }}
                      disabled={!securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="h-px w-full bg-border/60 dark:bg-border/40" />

                {/* Two-Factor Authentication Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    Two-Factor Authentication
                  </h3>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Enable 2FA</span>
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                      }
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-border/60 dark:bg-border/40" />

                {/* Active Sessions Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    Active Sessions
                  </h3>

                  <div className="space-y-3">
                    {/* Current Session */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Current Session</span>
                          <Badge variant="secondary" className="text-xs">
                            This Device
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Chrome on macOS • Last active: Now
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" disabled>
                        Current
                      </Button>
                    </div>

                    {/* Future: Other sessions will be listed here */}
                    <div className="p-4 rounded-lg border border-dashed border-border/40 bg-muted/20 text-center">
                      <p className="text-sm text-muted-foreground">
                        Session management will be available in a future update
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t border-border/40 bg-muted/5 dark:bg-muted/10">
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="opacity-50 cursor-not-allowed"
                  disabled
                >
                  Delete Account
                </Button>
                <Button 
                  variant="default"
                  className="flex items-center gap-2 shadow-sm"
                  onClick={() => {
                    // Save security settings logic here
                    console.log('Saving security settings:', securitySettings);
                  }}
                >
                      <Save className="h-4 w-4" />
                      Save Changes
                </Button>
              </CardFooter>
            </Card>


          </div>
        )}
      </div>
    </DashboardLayoutFixed>
  );
};

export default Profile;
