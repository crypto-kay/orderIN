import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Coffee, Lock, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { LoginFormSchema, type LoginForm } from '../schemas';
import { useAuthStore } from '../stores/authStore';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.pin);
      if (!success) {
        setError('root', { message: 'Invalid username or PIN' });
      }
    } catch {
      setError('root', { message: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Coffee className="h-8 w-8 text-primary-600" />
            </div>
            <CardTitle className="font-slab text-2xl">OrderIN</CardTitle>
            <CardDescription>
              Sign in to access your OrderIN dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10"
                    autoComplete="username"
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium">
                  PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Enter your PIN"
                    className="pl-10"
                    autoComplete="current-password"
                    {...register('pin')}
                  />
                </div>
                {errors.pin && (
                  <p className="text-sm text-red-600">{errors.pin.message}</p>
                )}
              </div>

              {errors.root && (
                <p className="text-sm text-red-600">{errors.root.message}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-secondary-600">
              <p>Demo credentials:</p>
              <p>Admin: admin / 1234</p>
              <p>Staff: staff / 1234</p>
              <p>Kitchen: kitchen / 1234</p>
              {import.meta.env.MODE === 'development' && (
                <p>Dev: admin@orderin.test / password</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;