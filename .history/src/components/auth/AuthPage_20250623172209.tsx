// // import { useState } from 'react';
// // import { Login } from './Login'; // adjust path based on your project
// // import { Register } from './Register';

// // export const AuthScreen = () => {
// //   const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

// //   const handleLogin = (username: string, password: string) => {
// //     // 🔐 Handle login logic (API call, context auth, etc.)
// //     console.log('Login:', { username, password });
// //   };

// //   const handleRegister = (userData: any) => {
// //     // 📝 Handle register logic (API call, user validation, etc.)
// //     console.log('Register:', userData);
// //     // Optional: Automatically switch to login after registration
// //     setAuthMode('login');
// //   };

// //   return authMode === 'login' ? (
// //     <Login
// //       onLogin={handleLogin}
// //       onSwitchToRegister={() => setAuthMode('register')}
// //     />
// //   ) : (
// //     <Register
// //       onRegister={handleRegister}
// //       onSwitchToLogin={() => setAuthMode('login')}
// //     />
// //   );
// // };

// // src/pages/AuthPage.tsx (or wherever you want to place it)

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

