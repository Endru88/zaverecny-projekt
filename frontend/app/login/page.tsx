// Login.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // Ensure you have styles here

const Login = () => {
  const [identifier, setIdentifier] = useState<string>(''); // email or username
  const [password, setPassword] = useState<string>(''); // password
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier, // email or username
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store the JWT token and username
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('userName', data.user.username); // Assuming user object has username
        router.push('/'); // Redirect to the profile or home page
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label>Email or Username</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.button}>Login</button>
        <p className={styles.registerPrompt}>
          Don't have an account? <a href="/register" className={styles.link}>Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
