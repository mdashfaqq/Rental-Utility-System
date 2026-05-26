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


