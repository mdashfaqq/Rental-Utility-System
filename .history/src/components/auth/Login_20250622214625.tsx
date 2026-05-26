// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Eye, EyeOff, LogIn } from 'lucide-react';

// interface LoginProps {
//   onLogin: (username: string, password: string) => void;
//   onSwitchToRegister: () => void;
// }

// export const Login = ({ onLogin, onSwitchToRegister }: LoginProps) => {
//   const [formData, setFormData] = useState({
//     username: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onLogin(formData.username, formData.password);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-bold text-gray-800">
//             Welcome Back
//           </CardTitle>
//           <p className="text-gray-600">Sign in to your Grocery POS account</p>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="username">Username</Label>
//               <Input
//                 id="username"
//                 type="text"
//                 value={formData.username}
//                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                 placeholder="Enter your username"
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//             </div>

//             <Button type="submit" className="w-full">
//               <LogIn className="h-4 w-4 mr-2" />
//               Sign In
//             </Button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <button
//                 onClick={onSwitchToRegister}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Sign Up
//               </button>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


import { useState } from 'react';
import { Login } from './Login'; // adjust path if needed
import { Register } from './Register';
import { useToast } from '@/components/ui/use-toast';

export const LoginScreen = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { toast } = useToast();

  // 🔐 Mock Login Handler (replace with real API call)
  const handleLogin = (username: string, password: string) => {
    // Example logic, replace this with actual authentication
    if (username === 'admin' && password === 'admin123') {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${username}!`,
        duration: 3000,
      });
      // Proceed to dashboard or home screen here
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // 📝 Mock Register Handler (replace with real API call)
  const handleRegister = (userData: any) => {
    // Assume registration always succeeds
    toast({
      title: 'Account Created',
      description: `User "${userData.username}" registered successfully.`,
      duration: 3000,
    });

    setAuthMode('login'); // switch to login after signup
  };

  return authMode === 'login' ? (
    <Login
      onLogin={handleLogin}
      onSwitchToRegister={() => setAuthMode('register')}
    />
  ) : (
    <Register
      onRegister={handleRegister}
      onSwitchToLogin={() => setAuthMode('login')}
    />
  );
};
