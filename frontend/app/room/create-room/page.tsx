'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '../../templates/navbar/navbar';
import Footer from '../../templates/footer/footer';
import styles from './page.module.css';

const AddRoom = () => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        data: { Name: name, Capacity: capacity },
      });
      router.push('/room'); // Redirect to rooms list after successful creation
    } catch (error: any) {
      setError(`Error creating room: ${error.message}`);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Add New Room</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Room Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Capacity:</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>Add Room</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AddRoom;
