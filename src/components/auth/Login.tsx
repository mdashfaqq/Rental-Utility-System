import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface LoginProps {
  onLogin?: (username: string, password: string) => Promise<boolean> | boolean | void;
  onSwitchToRegister?: () => void;
}

export const Login = ({ onLogin, onSwitchToRegister }: LoginProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoLoginAttempted = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    const demoParam = searchParams.get('demo');
    const isDemo = demoParam === 'true' || demoParam === '1';

    if (isDemo && !autoLoginAttempted.current && !loading) {
      autoLoginAttempted.current = true;

      const demoUsername = (
        import.meta.env.DEMO_USERNAME ||
        import.meta.env.DEMO_EMAIL ||
        import.meta.env.APP_DEMO_USERNAME ||
        import.meta.env.APP_DEMO_EMAIL ||
        import.meta.env.VITE_DEMO_USERNAME ||
        import.meta.env.VITE_DEMO_EMAIL ||
        'admin'
      ) as string;
      const demoPassword = (
        import.meta.env.DEMO_PASSWORD ||
        import.meta.env.APP_DEMO_PASSWORD ||
        import.meta.env.VITE_DEMO_PASSWORD ||
        'password'
      ) as string;

      setFormData({
        username: demoUsername,
        password: demoPassword,
      });

      const triggerAutoLogin = async () => {
        setSubmitting(true);
        try {
          const handler = onLogin || login;
          const result = await handler(demoUsername, demoPassword);
          const success = result !== false;
          if (success) {
            navigate('/');
          }
        } catch (error) {
          console.error('Demo login error:', error);
        } finally {
          setSubmitting(false);
        }
      };

      triggerAutoLogin();
    }
  }, [isAuthenticated, loading, navigate, onLogin, login, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const handler = onLogin || login;
      const result = await handler(formData.username, formData.password);
      const success = result !== false;
      if (success) {
        navigate('/');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                required
              />
            </div>

<div>
  <Label htmlFor="password">Password</Label>

  <div className="relative">
  <Input
    id="password"
    type="password" // ❗ no toggle logic
    value={formData.password}
    onChange={(e) =>
      setFormData({ ...formData, password: e.target.value })
    }
    placeholder="Enter your password"
    required
    autoComplete="current-password"
  />

  </div>
</div>

            <Button type="submit" className="w-full" disabled={submitting}>
              <LogIn className="h-4 w-4 mr-2" />
              {submitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {onSwitchToRegister && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
