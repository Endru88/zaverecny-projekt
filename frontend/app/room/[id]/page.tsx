'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '../../templates/navbar/navbar';
import Footer from '../../templates/footer/footer';
import styles from './page.module.css';

const EditRoom = () => {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${id}`);
        const roomData = response.data.data.attributes;
        setName(roomData.Name);
        setCapacity(roomData.Capacity);
      } catch (error: any) {
        setError(`Error fetching room: ${error.message}`);
      }
    };

    if (id) fetchRoom();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${id}`, {
        data: { Name: name, Capacity: capacity },
      });
      router.push('/room'); // Redirect after successful update
    } catch (error: any) {
      setError(`Error updating room: ${error.message}`);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Edit Room</h1>
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
          <button type="submit" className={styles.submitButton}>Save Changes</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditRoom;
