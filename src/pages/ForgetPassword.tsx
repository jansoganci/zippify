import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../services/api/apiClient";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ForgetPasswordFormValues {
  email: string;
}

export default function ForgetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<ForgetPasswordFormValues>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur"
  });
  
  const onSubmit = async (data: ForgetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsSuccess(false);
    
    try {
      // Call the forgot password API endpoint
      await api.forgotPassword(data.email);
      
      // Show success message
      setIsSuccess(true);
      form.reset(); // Clear the form
    } catch (error: any) {
      // Log error appropriately - these duplicate logs were redundant
      // Enhanced error handling for backend messages
      let msg = "Failed to process your request. Please try again.";
      if (error?.response?.data) {
        msg = error.response.data.userMessage || error.response.data.message || error.message || msg;
      } else if (error?.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {isSuccess && (
              <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
                <CheckCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Password reset instructions have been sent to your email address.
                  Please check your inbox and follow the instructions.
                </AlertDescription>
              </Alert>
            )}
            
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
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <a 
                href="/login" 
                className="text-primary font-medium hover:underline"
              >
                Back to Login
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
