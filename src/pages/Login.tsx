import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api/apiClient";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { error } from '../utils/logger';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { UnifiedError } from '@/components/ui/unified-error';
import { UnifiedLoading } from '@/components/ui/unified-loading';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const loginOperation = useAsyncOperation({
    successMessage: 'Login successful!',
    errorPrefix: 'Login failed',
    showSuccessToast: false, // We'll handle navigation instead
    showErrorToast: false    // We'll show error in form instead
  });
  
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onBlur"
  });
  

const onSubmit = async (data: LoginFormValues) => {
    const result = await loginOperation.execute(async () => {
      // Call the login API endpoint
      const response = await api.login(data.email, data.password);
      
      // Store token in localStorage
      localStorage.setItem("zippify_token", response.token);
      
      // Store user info if returned
      if (response.user) {
        localStorage.setItem("zippify_user", JSON.stringify(response.user));
      }
      
      return response;
    });

    if (result) {
      // Redirect to dashboard on success
      navigate("/dashboard");
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Login to Zippify</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnifiedError 
              error={loginOperation.error}
              variant="alert"
              className="mb-4"
            />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="••••••••" 
                            type={showPassword ? "text" : "password"} 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <UnifiedLoading
                  variant="button"
                  type="submit"
                  className="w-full"
                  isLoading={loginOperation.isLoading}
                  loadingText="Logging in..."
                  defaultText="Login"
                  disabled={loginOperation.isLoading}
                >
                  {!loginOperation.isLoading && <LogIn className="mr-2 h-4 w-4" />}
                </UnifiedLoading>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-primary font-medium hover:underline"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
