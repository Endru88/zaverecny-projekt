'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '../templates/navbar/navbar';
import Footer from '../templates/footer/footer';
import styles from './page.module.css';

interface Trainer {
  id: number;
  name: string;
  surname: string;
}

interface Room {
  id: number;
  Name: string;
  Capacity: number;
}

const CreateLesson = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    Name: '',
    Start: '',
    End: '',
    trainer: '',
    room: '',
  });
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/trainers`);
        setTrainers(response.data.data.map((t: any) => ({ id: t.id, name: t.attributes.name, surname: t.attributes.surname })));
      } catch (error: any) {
        console.error('Error fetching trainers:', error);
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`);
        setRooms(response.data.data.map((r: any) => ({ id: r.id, Name: r.attributes.Name, Capacity: r.attributes.Capacity })));
      } catch (error: any) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchTrainers();
    fetchRooms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted'); // Check if the function is called
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`, {
        data: {
          ...formData,
          trainer: parseInt(formData.trainer),
          room: parseInt(formData.room),
        },
      });
  
      console.log('API response:', response); // Log the API response
  
      if (response.status === 200) {
        const lessonId = response.data.data.id; // Check if this ID exists
        console.log('Redirecting to:', `/lesson/${lessonId}`); // Log redirection
        router.push(`/lesson/${lessonId}`);
      }
    } catch (error: any) {
      console.error('Error creating lesson:', error); // Log error
      setError(`Error creating lesson: ${error.message}`);
    }
  };
  
  

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Create Lesson</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Lesson Name:</label>
            <input 
              type="text" 
              name="Name" 
              className={styles.input} 
              value={formData.Name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date and Time:</label>
            <input 
              type="datetime-local" 
              name="Start" 
              className={styles.input} 
              value={formData.Start} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>End Date and Time:</label>
            <input 
              type="datetime-local" 
              name="End" 
              className={styles.input} 
              value={formData.End} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Trainer:</label>
            <select 
              name="trainer" 
              className={styles.input} 
              value={formData.trainer} 
              onChange={handleChange} 
              required
            >
              <option value="" disabled>Select a trainer</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name} {trainer.surname}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Room:</label>
            <select 
              name="room" 
              className={styles.input} 
              value={formData.room} 
              onChange={handleChange} 
              required
            >
              <option value="" disabled>Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.Name} (Capacity: {room.Capacity})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.submitButton}>Create Lesson</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateLesson;
