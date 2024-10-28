'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../templates/navbar/navbar';
import Footer from '../../templates/footer/footer';
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

interface Lesson {
  id: number;
  attributes: {
    Name: string;
    Start: string;
    End: string;
    trainer: number ;
    room: number ;
  };
}

const LessonDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchLessonData = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}?populate=trainer&populate=room`);
          setLesson(response.data.data);
        } catch (error: any) {
          console.error('Error fetching lesson:', error.response ? error.response.data : error.message);
          setError(`Error fetching lesson: ${error.response ? error.response.data.message : error.message}`);
        }
      };
      fetchLessonData();
    }
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Lesson Details</h1>
        {error && <p className={styles.error}>{error}</p>}
        {lesson ? (
          <div className={styles.details}>
            <h2 className={styles.name}>{lesson.attributes.Name}</h2>
            <div className={styles.infoSection}>
              <p><strong>Start Time:</strong> {new Date(lesson.attributes.Start).toLocaleString()}</p>
              <p><strong>End Time:</strong> {new Date(lesson.attributes.End).toLocaleString()}</p>
            </div>
            
            <div className={styles.infoSection}>
              <h3><strong>Trainer Information</strong></h3>
              <p><strong>Name:</strong> {lesson.attributes.trainer.data.attributes.name} {lesson.attributes.trainer.data.attributes.surname}</p>
              <p><strong>Email:</strong> {lesson.attributes.trainer.data.attributes.email}</p>
              <p><strong>Telephone:</strong> {lesson.attributes.trainer.data.attributes.telephone}</p>
            </div>
            
            <div className={styles.infoSection}>
              <h3><strong>Room Details</strong></h3>
              <p><strong>Room:</strong> {lesson.attributes.room.data.attributes.Name}</p>
              <p><strong>Capacity:</strong> {lesson.attributes.room.data.attributes.Capacity}</p>
            </div>

            <button
              className={styles.editButton}
              onClick={() => router.push(`/lesson/${id}/edit`)}
            >
              Edit
            </button>
          </div>
        ) : (
          <p>Loading lesson details...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LessonDetails;
