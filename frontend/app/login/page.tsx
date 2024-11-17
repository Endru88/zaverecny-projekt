'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const Login = () => {
  const [identifier, setIdentifier] = useState<string>(''); // email or username
  const [password, setPassword] = useState<string>(''); // password
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // OAuth login handler
  const handleOAuthLogin = (provider: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'; // Ensure API URL is set
    window.location.href = `${apiUrl}/api/connect/${provider}`; // Redirect to Strapi OAuth endpoint
  };

  // Standard login handler
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
        // Store JWT, user ID, and username
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);

        // Fetch user data including their role
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${data.user.id}?populate=role`, {
          headers: {
            Authorization: `Bearer ${data.jwt}`,
          },
        });
        const userData = await userRes.json();
        localStorage.setItem('userRole', userData.role.name);

        // Step 1: Check if the user has a person profile
        const peopleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/people?filters[users_permissions_user]=${data.user.id}`, {
          headers: {
            Authorization: `Bearer ${data.jwt}`,
          },
        });
        const peopleData = await peopleRes.json();

        // Step 2: Check if a person profile exists
        if (peopleData.data && peopleData.data.length > 0) {
          // User has a person profile, redirect to home or dashboard
          router.push('/');
        } else {
          // No person found, redirect to the profile creation page
          router.push('/create-person');
        }
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

        <p className={styles.oauthText}>Or login with:</p>
        <div className={styles.oauthButtons}>
        <button
  type="button"
  onClick={() => handleOAuthLogin('google')}
  className={styles.oauthButton}
>
  <img src="http://localhost:1337/uploads/small_Google_G_logo_svg_87d661439b.png
" alt="Google logo" 
className={styles.googleLogo} />
  Google
</button>

        </div>

        <p className={styles.registerPrompt}>
          Don't have an account? <a href="/register" className={styles.link}>Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
