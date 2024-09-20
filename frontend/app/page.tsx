'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Navbar from './templates/navbar/navbar';  // Reuse Navbar component
import Footer from './templates/footer/footer';  // Reuse Footer component

const Calendar = ({ lessons, onLessonClick }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8:00 to 22:00

  const getCellSpan = (start, end) => {
    const startHour = Math.floor(start.getHours() + start.getMinutes() / 60);
    const endHour = Math.ceil(end.getHours() + end.getMinutes() / 60);
    return { startHour, endHour };
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div className={styles.timeCell}></div>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.dayCell}>{day}</div>
        ))}
      </div>
      {timeSlots.map((time) => (
        <div key={time} className={styles.timeRow}>
          <div className={styles.timeCell}>{time}</div>
          {daysOfWeek.map((day) => {
            const lessonForCell = lessons.find((lesson) => {
              const start = new Date(lesson.attributes.Start);
              const end = new Date(lesson.attributes.End);
              const lessonDay = start.toLocaleDateString('en-US', { weekday: 'long' });

              // Check if the lesson belongs to the correct day
              if (lessonDay !== day) return false;

              // Calculate start and end hour indices
              const startHour = start.getHours();
              const endHour = end.getHours();

              // Check if lesson overlaps with the current time slot
              return (startHour === parseInt(time) && start.getMinutes() > 0) ||
                (endHour === parseInt(time) && end.getMinutes() === 0) ||
                (startHour < parseInt(time) && endHour > parseInt(time));
            });

            return (
              <div key={day} className={`${styles.lessonCell} ${lessonForCell ? styles.hasLesson : ''}`}>
                {lessonForCell && (
                  <div
                    className={styles.lessonContent}
                    onClick={() => onLessonClick(lessonForCell)} // Click handler
                  >
                    {lessonForCell.attributes.Name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null); // State for the selected lesson

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`);
        const data = await response.json();
        setLessons(data.data || []); // Ensure it's an array
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setLessons([]); // Fallback to empty array on error
      }
    };

    fetchLessons();
  }, []);

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson); // Set the selected lesson
  };

  const closeModal = () => {
    setSelectedLesson(null); // Clear the selected lesson
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>

        <h1 className={styles.heading}>Weekly Schedule</h1>
        <Calendar lessons={lessons} onLessonClick={handleLessonClick} />


        {/* Modal for lesson details */}
        {selectedLesson && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.close} onClick={closeModal}>&times;</span>
              <h2>{selectedLesson.attributes.Name}</h2>
              <p><strong>Start:</strong> {new Date(selectedLesson.attributes.Start).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(selectedLesson.attributes.End).toLocaleString()}</p>
              <p><strong>Description:</strong> {selectedLesson.attributes.Description || 'No description available.'}</p>
              <p><strong>Trainer:</strong> {selectedLesson.attributes.TrainerName}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
