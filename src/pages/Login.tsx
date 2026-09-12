
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePageMeta } from '@/hooks/usePageMeta';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  usePageMeta({
    title: 'Sign in — KidMin Harmony',
    description: 'Sign in to your KidMin Harmony account.',
    noindex: true,
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4 animate-fade-in">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold animate-slide-up">
            Welcome back
          </h2>
          <p className="mt-2 text-muted-foreground animate-slide-up [animation-delay:200ms]">
            Sign in to your account
          </p>
        </div>

        <div className="glass-card p-8 shadow-lg rounded-lg animate-scale-in [animation-delay:400ms]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={cn(errors.email && 'border-destructive')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={cn(errors.password && 'border-destructive')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          {import.meta.env.DEV && (
          <div className="mt-6">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or try a demo account
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => login("admin@church.org", "admin123").then(() => navigate("/dashboard"))}
                disabled={isSubmitting}
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-purple-500" />
                <span className="font-medium">Admin</span>
                <span className="ml-auto text-xs text-muted-foreground">admin@church.org</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => login("teacher@church.org", "teacher123").then(() => navigate("/dashboard"))}
                disabled={isSubmitting}
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-medium">Teacher</span>
                <span className="ml-auto text-xs text-muted-foreground">teacher@church.org</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => login("parent@church.org", "parent123").then(() => navigate("/dashboard"))}
                disabled={isSubmitting}
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">Parent</span>
                <span className="ml-auto text-xs text-muted-foreground">parent@church.org</span>
              </Button>
            </div>
          </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground animate-slide-up [animation-delay:600ms]">
          Don't have an account?{' '}
          <Button
            variant="link"
            className="font-semibold p-0"
            onClick={() => navigate('/register')}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Login;
