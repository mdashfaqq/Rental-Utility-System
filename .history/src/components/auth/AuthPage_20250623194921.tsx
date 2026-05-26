// import { useState } from 'react';
// import { Login } from './Login'; // adjust path based on your project
// import { Register } from './Register';

// export const AuthScreen = () => {
//   const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

//   const handleLogin = (username: string, password: string) => {
//     // 🔐 Handle login logic (API call, context auth, etc.)
//     console.log('Login:', { username, password });
//   };

//   const handleRegister = (userData: any) => {
//     // 📝 Handle register logic (API call, user validation, etc.)
//     console.log('Register:', userData);
//     // Optional: Automatically switch to login after registration
//     setAuthMode('login');
//   };

//   return authMode === 'login' ? (
//     <Login
//       onLogin={handleLogin}
//       onSwitchToRegister={() => setAuthMode('register')}
//     />
//   ) : (
//     <Register
//       onRegister={handleRegister}
//       onSwitchToLogin={() => setAuthMode('login')}
//     />
//   );
// };

// src/pages/AuthPage.tsx (or wherever you want to place it)

// import { useState } from 'react';
// import { Login } from '@/components/auth/Login';
// import { Register } from '@/components/auth/Register';

// export const AuthPage = () => {
//   // true for Login view, false for Register view
//   const [isLoginView, setIsLoginView] = useState(true);

//   // --- Handlers ---
//   // These functions will contain your actual API calls in a real application

//   const handleLogin = (username: string, password: string, rememberMe: boolean) => {
//     console.log("Attempting to log in with:");
//     console.log({ username, password, rememberMe });
//     // Example: await api.login(username, password);
//     alert(`Login successful for ${username}! Remember Me: ${rememberMe}`);
//   };

//   const handleRegister = (username: string, password: string) => {
//     console.log("Attempting to register with:");
//     console.log({ username, password });
//     // Example: await api.register(username, password);
//     alert(`Registration successful for ${username}! Please log in.`);
//     setIsLoginView(true); // Switch to login view after successful registration
//   };

//   // --- View Switchers ---

//   const switchToRegister = () => setIsLoginView(false);
//   const switchToLogin = () => setIsLoginView(true);

//   // Conditionally render the correct component
//   return (
//     <>
//       {isLoginView ? (
//         <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
//       ) : (
//         <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
//       )}
//     </>
//   );
// };

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';

// export const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { login, register } = useAuth();
//   const navigate = useNavigate();

//   const [loginData, setLoginData] = useState({
//     username: '',
//     password: ''
//   });

//   const [registerData, setRegisterData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'cashier'
//   });

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const success = await login(loginData.username, loginData.password);
//     if (success) {
//       navigate('/');
//     }
//     setLoading(false);
//   };

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (registerData.password !== registerData.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     const success = await register({
//       username: registerData.username,
//       email: registerData.email,
//       password: registerData.password,
//       role: registerData.role
//     });
    
//     if (success) {
//       setIsLogin(true);
//       setRegisterData({
//         username: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//         role: 'cashier'
//       });
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-bold text-gray-800">
//             {isLogin ? 'Welcome Back' : 'Create Account'}
//           </CardTitle>
//           <p className="text-gray-600">
//             {isLogin ? 'Sign in to your Grocery POS account' : 'Join Grocery POS today'}
//           </p>
//         </CardHeader>
//         <CardContent>
//           {isLogin ? (
//             <form onSubmit={handleLogin} className="space-y-4">
//               <div>
//                 <Label htmlFor="username">Username</Label>
//                 <Input
//                   id="username"
//                   type="text"
//                   value={loginData.username}
//                   onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
//                   placeholder="Enter your username"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     value={loginData.password}
//                     onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                     placeholder="Enter your password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>

//               <Button type="submit" className="w-full" disabled={loading}>
//                 <LogIn className="h-4 w-4 mr-2" />
//                 {loading ? 'Signing In...' : 'Sign In'}
//               </Button>
//             </form>
//           ) : (
//             <form onSubmit={handleRegister} className="space-y-4">
//               <div>
//                 <Label htmlFor="reg-username">Username</Label>
//                 <Input
//                   id="reg-username"
//                   type="text"
//                   value={registerData.username}
//                   onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
//                   placeholder="Choose a username"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={registerData.email}
//                   onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="role">Role</Label>
//                 <Select value={registerData.role} onValueChange={(value) => setRegisterData({ ...registerData, role: value })}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="admin">Admin</SelectItem>
//                     <SelectItem value="cashier">Cashier</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="reg-password">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="reg-password"
//                     type={showPassword ? 'text' : 'password'}
//                     value={registerData.password}
//                     onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
//                     placeholder="Create a password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="confirmPassword">Confirm Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="confirmPassword"
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     value={registerData.confirmPassword}
//                     onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
//                     placeholder="Confirm your password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>

//               <Button type="submit" className="w-full" disabled={loading}>
//                 <UserPlus className="h-4 w-4 mr-2" />
//                 {loading ? 'Creating Account...' : 'Create Account'}
//               </Button>
//             </form>
//           )}

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
//               <button
//                 onClick={() => setIsLogin(!isLogin)}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 {isLogin ? 'Sign up' : 'Sign in'}
//               </button>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };