'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../../templates/navbar/navbar';
import Footer from '../../../templates/footer/footer';
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

interface LessonDetails {
  id: number;
  attributes: {
    Name: string;
    Start: string;
    End: string;
    trainer: number;
    room: number;
  };
}

const EditLesson = () => {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetails | null>(null);
  const [formData, setFormData] = useState<LessonDetails['attributes'] | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}?populate=trainer&populate=room`);
          const lessonData = response.data.data;
          setLesson(lessonData);
          setFormData({
            Name: lessonData.attributes.Name,
            Start: lessonData.attributes.Start,
            End: lessonData.attributes.End,
            trainer: lessonData.attributes.trainer?.data?.id || '', // Use the trainer ID or empty string if null
            room: lessonData.attributes.room?.data?.id || '', // Use the room ID or empty string if null
          });
        } catch (error: any) {
          setError(`Error fetching lesson: ${error.message}`);
        }
      };
      

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

    if (id) {
      fetchLessonData();
      fetchTrainers();
      fetchRooms();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      // Check if the form data has changed
      const originalLesson = lesson?.attributes;
  
      // Create an object to hold the updated data
      const updatedData = {
        ...formData,
        trainer: parseInt(formData.trainer as any),
        room: parseInt(formData.room as any),
      };
  
      // Check if any field has changed
      const hasChanged = 
        updatedData.Name !== originalLesson?.Name || 
        updatedData.Start !== originalLesson?.Start || 
        updatedData.End !== originalLesson?.End || 
        updatedData.trainer !== originalLesson?.trainer || 
        updatedData.room !== originalLesson?.room;
  
      // If there are changes, proceed with the PUT request
      if (hasChanged) {
        try {
          await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}`, {
            data: updatedData,
          });
          router.push(`/lesson/${id}`);
        } catch (error: any) {
          setError(`Error updating lesson: ${error.message}`);
        }
      } else {
        // If no changes, you might want to notify the user or simply do nothing
        setError('No changes made to the lesson.');
      }
    }
  };
  

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Edit Lesson</h1>
        {error && <p className={styles.error}>{error}</p>}
        {formData ? (
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
                value={formData.Start.substring(0, 16)} // Adjust for datetime-local format
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
                value={formData.End.substring(0, 16)} // Adjust for datetime-local format
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
                
              >
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
                
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.Name} (Capacity: {room.Capacity})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={styles.submitButton}>Save Changes</button>
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EditLesson;
