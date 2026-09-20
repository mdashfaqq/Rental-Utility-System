import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner } from '@/components/ui/loading';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-accent/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-champagne blur-3xl" />
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Premier Rentals</p>
          <CardTitle className="font-display text-4xl font-normal text-foreground">
            Welcome back
          </CardTitle>
          <p className="text-muted-foreground">Sign in to your workspace</p>
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
    type="password"
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

            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? <Spinner size="sm" className="mr-1" /> : <LogIn className="h-4 w-4" />}
              {submitting ? 'Signing in' : 'Sign In'}
            </Button>
          </form>

          {onSwitchToRegister && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-foreground font-medium underline underline-offset-4"
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
