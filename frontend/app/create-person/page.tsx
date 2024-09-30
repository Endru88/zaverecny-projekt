// app/create-person/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // Adjust path as necessary

const CreatePerson = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postal, setPostal] = useState('');
  const [info, setInfo] = useState(''); // Text info field
  const [status, setStatus] = useState('Client'); // Default status
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Get the current user's ID from local storage
    const userId = localStorage.getItem('userId');

    // Check if user ID is present
    if (!userId) {
      setError('User not found. Please log in.');
      return;
    }

    const personData = {
      name,
      surname,
      telephone,
      email,
      address,
      Postal: postal,
      Info: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: info,
            },
          ],
        },
      ],
      locale: 'cs-CZ',
      status, // Use the status from state
      users_permissions_user: userId // Set user ID here to link the person with the user
    };

    try {
      // Retrieve JWT from local storage
      const jwt = localStorage.getItem('jwt'); 
      if (!jwt) {
        setError('User not authenticated. Please log in.');
        return;
      }
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`, // Include the JWT token
        },
        body: JSON.stringify({ data: personData }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        router.push('/'); // Redirect on success
      } else {
        console.error('API Error:', data); // Log API errors
        setError(data.error.message || 'Person creation failed. Please try again.');
      }
    } catch (err) {
      console.error('Network or server error:', err); // Log network/server errors
      setError('Person creation failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Create Person</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Surname</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Telephone</label>
          <input
            type="text"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Postal Code</label>
          <input
            type="text"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Info</label>
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        <button type="submit" className={styles.button}>
          Create Person
        </button>
      </form>
    </div>
  );
};

export default CreatePerson;
