
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'parent' | 'teacher' | 'volunteer' | 'cellLeader' | 'partner';
}

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>();

  // For the select component - role selection
  const [role, setRole] = React.useState<RegisterFormData['role']>('parent');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Registration would be handled here with actual auth
      toast.success(`Registration successful! Please sign in.`);
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
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
            Join KidMin Harmony
          </h2>
          <p className="mt-2 text-muted-foreground animate-slide-up [animation-delay:200ms]">
            Create your account to get started
          </p>
        </div>

        <div className="glass-card p-8 shadow-lg rounded-lg animate-scale-in [animation-delay:400ms]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                autoComplete="name"
                {...register('name', {
                  required: 'Name is required'
                })}
                className={cn(errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role}
                onValueChange={(value) => setRole(value as RegisterFormData['role'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="cellLeader">Cell Leader</SelectItem>
                  <SelectItem value="partner">Ministry Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => 
                    value === watch('password') || 'Passwords do not match'
                })}
                className={cn(errors.confirmPassword && 'border-destructive')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground animate-slide-up [animation-delay:600ms]">
          Already have an account?{' '}
          <Button
            variant="link"
            className="font-semibold p-0"
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Register;
