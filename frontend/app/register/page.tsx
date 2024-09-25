// app/register/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // Adjust the path as necessary

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const userData = { username, email, password };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login'); // Redirect to login after successful registration
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" className={styles.button}>Register</button>
        <p className={styles.registerPrompt}>
          Already have an account? <a href="/login" className={styles.link}>Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
