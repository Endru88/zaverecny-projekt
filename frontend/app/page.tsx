'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link'; // Use Link
import styles from './page.module.css';
import Navbar from './templates/navbar/navbar'; // Reuse Navbar component
import Footer from './templates/footer/footer'; // Reuse Footer component

const Calendar = ({ lessons, onLessonClick }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8:00 to 22:00

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
              const startHour = start.getHours ()-1;
              const endHour = end.getHours()-1;

              // Check if lesson overlaps with the current time slot
              return (
                (startHour === parseInt(time) && start.getMinutes() > 0) ||
                (endHour === parseInt(time) && end.getMinutes() === 0) ||
                (startHour < parseInt(time) && endHour > parseInt(time))
              );
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
  const [reservations, setReservations] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [person, setPerson] = useState(null);

  useEffect(() => {
    const fetchLessonsAndReservations = async () => {
      try {
        const lessonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons?populate=trainer&populate=room`);
        const lessonData = await lessonResponse.json();
        let lessons = lessonData.data || [];
    
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
    
        lessons = lessons.filter((lesson) => {
          const lessonStart = new Date(lesson.attributes.Start);
          return lessonStart >= startOfWeek && lessonStart <= endOfWeek;
        });
    
        const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations?populate=lesson`);
        const reservationData = await reservationResponse.json();
        const reservations = reservationData.data || [];
    
        const reservationCounts = {};
        reservations.forEach((reservation) => {
          const lessonId = reservation.attributes.lesson.data.id;
          reservationCounts[lessonId] = (reservationCounts[lessonId] || 0) + 1;
        });
    
        setLessons(lessons);
        setReservations(reservationCounts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLessons([]);
        setReservations({});
      }
    };

    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('jwt');

      if (userId && token) {
        try {
          const personResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/people?filters[users_permissions_user]=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const personData = await personResponse.json();
          setPerson(personData.data[0]);

          const userData = {
            name: localStorage.getItem('username') || 'John Doe',
            telephone: personData.data[0]?.attributes.telephone || 'N/A',
            email: personData.data[0]?.attributes.email || 'N/A',
            address: personData.data[0]?.attributes.address || 'N/A',
            postal: personData.data[0]?.attributes.Postal || 'N/A',
            dateofbirth: personData.data[0]?.attributes.dateofbirth || new Date('2000-01-01').toISOString(),
            status: personData.data[0]?.attributes.status || 'N/A', // Add status
            type: personData.data[0]?.attributes.type || 'N/A' // Add type
          };
          
          setUser(userData);
          setIsLoggedIn(!!token);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchLessonsAndReservations();
    fetchUserData();
  }, []);

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const closeModal = () => {
    setSelectedLesson(null);
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.calendarContainer}>
          <h1 className={styles.heading}>Weekly Schedule</h1>
          <Calendar lessons={lessons} onLessonClick={handleLessonClick} />
        </div>

        <div className={styles.sidebar}>
        {isLoggedIn ? (
  <div className={styles.userInfo}>
    <h2 className={styles.userName}>
      {person ? person.attributes.name : 'Loading...'} {person ? person.attributes.surname : ''}
    </h2>
    {person ? (
      <>
        <p className={styles.userDetails}><strong>Telephone:</strong> {user.telephone}</p>
        <p className={styles.userDetails}><strong>Email:</strong> {user.email}</p>
        <p className={styles.userDetails}><strong>Address:</strong> {user.address}</p>
        <p className={styles.userDetails}><strong>Postal Code:</strong> {user.postal}</p>
        <p className={styles.userDetails}><strong>Date of Birth:</strong> {user.dateofbirth}</p>
        <p className={styles.userDetails}><strong>Status:</strong> {user.status}</p> {/* Display status */}
        <p className={styles.userDetails}><strong>Type:</strong> {user.type}</p> {/* Display type */}
        <Link href={`/osoby/${person.id}/edit`}>
          <button className={styles.editButton}>Edit Information</button>
        </Link>
      </>
    ) : (
      <p>Loading person data...</p>
    )}
  </div>
) : (
  <div className={styles.loginPrompt}>
    <p>To see your personal data, please log in.</p>
    <button className={styles.loginButton}>Log In</button>
  </div>
)}
        </div>

        {selectedLesson && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.close} onClick={closeModal}>&times;</span>
              <h2>{selectedLesson.attributes.Name}</h2>
              <p><strong>Start:</strong> {new Date(selectedLesson.attributes.Start).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(selectedLesson.attributes.End).toLocaleString()}</p>
              <p><strong>Description:</strong> {selectedLesson.attributes.Description || 'No description available.'}</p>
              <p><strong>Trainer:</strong> {selectedLesson.attributes.trainer.data.attributes.name} {selectedLesson.attributes.trainer.data.attributes.surname}</p>
              {selectedLesson.attributes.room.data ? (
                <>
                  <p><strong>Room:</strong> {selectedLesson.attributes.room.data.attributes.Name}</p>
                  <p><strong>Room Capacity:</strong> {selectedLesson.attributes.room.data.attributes.Capacity}</p>
                </>
              ) : (
                <p><strong>Room:</strong> Not assigned</p>
              )}
              <p><strong>Joined:</strong> {reservations[selectedLesson.id] || 0} / {selectedLesson.attributes.room.data ? selectedLesson.attributes.room.data.attributes.Capacity : 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;

