
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
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

          <div className="mt-6">
            <p className="text-center text-sm text-muted-foreground">
              Demo Account Credentials:
            </p>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>Admin: admin@church.org / admin123</p>
              <p>Teacher: teacher@church.org / teacher123</p>
              <p>Parent: parent@church.org / parent123</p>
            </div>
          </div>
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
