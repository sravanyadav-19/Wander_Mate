import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Compass, AlertCircle } from "lucide-react";
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/lib/validations";
import { toast } from "sonner";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", fullName: "" });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginFormData>>({});
  const [signupErrors, setSignupErrors] = useState<Partial<SignupFormData>>({});
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    
    // Validate form data
    const validation = loginSchema.safeParse(loginForm);
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setLoginErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (!error) {
      navigate("/");
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
    // Validate form data
    const validation = signupSchema.safeParse(signupForm);
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setSignupErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
        fullName: errors.fullName?.[0],
      });
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative">
              <MapPin className="h-8 w-8 text-white" />
              <Compass className="h-4 w-4 text-secondary absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="text-2xl font-bold text-white">WanderMate</span>
          </div>
          <p className="text-white/80 text-sm">Your intelligent travel companion</p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => {
                        setLoginForm({...loginForm, email: e.target.value});
                        setLoginErrors({...loginErrors, email: undefined});
                      }}
                      className={loginErrors.email ? "border-destructive" : ""}
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {loginErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => {
                        setLoginForm({...loginForm, password: e.target.value});
                        setLoginErrors({...loginErrors, password: undefined});
                      }}
                      className={loginErrors.password ? "border-destructive" : ""}
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {loginErrors.password}
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.fullName}
                      onChange={(e) => {
                        setSignupForm({...signupForm, fullName: e.target.value});
                        setSignupErrors({...signupErrors, fullName: undefined});
                      }}
                      className={signupErrors.fullName ? "border-destructive" : ""}
                    />
                    {signupErrors.fullName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {signupErrors.fullName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => {
                        setSignupForm({...signupForm, email: e.target.value});
                        setSignupErrors({...signupErrors, email: undefined});
                      }}
                      className={signupErrors.email ? "border-destructive" : ""}
                    />
                    {signupErrors.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {signupErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password (8+ chars, upper, lower, number)"
                      value={signupForm.password}
                      onChange={(e) => {
                        setSignupForm({...signupForm, password: e.target.value});
                        setSignupErrors({...signupErrors, password: undefined});
                      }}
                      className={signupErrors.password ? "border-destructive" : ""}
                    />
                    {signupErrors.password && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {signupErrors.password}
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;