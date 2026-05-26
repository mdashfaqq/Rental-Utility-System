/* App.css */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  /* Added a subtle background for the glass effect to be more visible */
  background-image: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  width: 90%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.glass {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

input {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  background-color: rgba(255, 255, 255, 0.8);
}

button {
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #667eea;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #5a67d8;
}

.link {
  text-align: center;
  color: #1a202c; /* Improved contrast */
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  text-decoration: underline;
}

.remember-reset {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #2d3748; /* Improved contrast */
}

.remember-reset label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}