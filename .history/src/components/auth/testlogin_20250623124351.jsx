// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// =================================================================
//  CRITICAL FIX: Replace the object below with your actual
//  Firebase project configuration from the Firebase Console.
// =================================================================
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY', // <--- REPLACE
  authDomain: 'YOUR_AUTH_DOMAIN', // <--- REPLACE
  projectId: 'YOUR_PROJECT_ID', // <--- REPLACE
  storageBucket: 'YOUR_STORAGE_BUCKET', // <--- REPLACE
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', // <--- REPLACE
  appId: 'YOUR_APP_ID' // <--- REPLACE
};

// This line will now work correctly after you update firebaseConfig
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Registered successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert('Enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent.');
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem('rememberEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  if (user) {
    return (
      <div className="container glass">
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="container glass">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {!isRegistering && (
        <div className="remember-reset">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button onClick={handleResetPassword} className="link">Forgot Password?</button>
        </div>
      )}
      <button onClick={isRegistering ? handleRegister : handleLogin}>
        {isRegistering ? 'Register' : 'Login'}
      </button>
      <p className="link" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </p>
    </div>
  );
}

export default App;
