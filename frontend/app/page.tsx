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
              const startHour = start.getHours() - 1;
              const endHour = end.getHours() - 1;
              console.log(`Lesson: ${lesson.attributes.Name}, Day: ${lessonDay}, Time: ${startHour}-${endHour}`);
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userLessons, setUserLessons] = useState([]);
  const [userReservationStatus, setUserReservationStatus] = useState(null); // null until checked
  const [imageLoaded, setImageLoaded] = useState(false);

  

  useEffect(() => {
    const img = new Image();
    img.src = '../../backend/public/uploads/pexels_muhammad_khairul_iddin_adnan_267454_808510_1_618a8a6ae7.jpg';
    img.onload = () => setImageLoaded(true);  // Set state once the image is loaded
  }, []);

  

  useEffect(() => {
    const fetchUserLessons = async () => {
      const token = localStorage.getItem('jwt');
      const personId = person?.id;
  
      if (!personId || !token) return;
  
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservations?filters[person]=${personId}&populate=lesson`
        );
        const data = await response.json();
        const reservations = data.data || [];
  
        const lessons = reservations.map(reservation => reservation.attributes.lesson.data);
  
        // Sort lessons by the start date (newest first)
        const sortedLessons = lessons.sort((a, b) => {
          const startA = new Date(a.attributes.Start);
          const startB = new Date(b.attributes.Start);
          return startB - startA; // Sort in descending order
        });
  
        // Get the top 6 most recent lessons
        setUserLessons(sortedLessons.slice(0, 6)); // Slice to get only the 6 most recent lessons
      } catch (error) {
        console.error('Error fetching user lessons:', error);
      }
    };
  
    if (person) {
      fetchUserLessons();
    }
  }, [person]);
  


  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
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

  const handleReservation = async (lessonId) => {
    const token = localStorage.getItem('jwt');
    const personId = person?.id;
  
    if (!personId || !token) {
      alert('Please log in to make a reservation.');
      return;
    }
  
    try {
      // Check if the user already has a reservation for this lesson
      const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations?filters[person]=${personId}&filters[lesson]=${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const reservationData = await reservationResponse.json();
      const existingReservation = reservationData.data?.[0];
  
      if (existingReservation) {
        // User is already reserved, so cancel the reservation
        const cancelResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${existingReservation.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (cancelResponse.ok) {
          // Successfully canceled the reservation, update the button state
          alert('Reservation successfully canceled!');
          setReservations(prev => {
            const updatedReservations = { ...prev };
            // Decrease the reservation count by 1
            updatedReservations[lessonId] = Math.max((updatedReservations[lessonId] || 0) - 1, 0); // Ensure count doesn't go negative
            return updatedReservations;
          });
          setUserLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));
          
          // Update the reservation status to reflect that there is no reservation
          setUserReservationStatus(false);
        } else {
          console.error('Failed to cancel reservation:', cancelResponse.statusText);
          alert('Failed to cancel reservation. Please try again.');
        }
      } else {
        // User is not reserved, so create a new reservation
        if (reservations[selectedLesson.id] >= selectedLesson.attributes.room.data?.attributes.Capacity) {
          alert('This lesson is full.');
          return;
        }
  
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              lesson: lessonId,
              person: personId,
            },
          }),
        });
  
        if (createResponse.ok) {
          alert('Reservation successfully made!');
          setReservations(prev => ({
            ...prev,
            [lessonId]: (prev[lessonId] || 0) + 1, // Increase reservation count
          }));
          setUserLessons(prevLessons => [
            ...prevLessons,
            lessons.find(lesson => lesson.id === lessonId),
          ]);
          
          // Update the reservation status to reflect that the user has a reservation
          setUserReservationStatus(true);
        } else {
          console.error('Failed to create reservation:', createResponse.statusText);
          alert('Failed to create reservation. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error handling reservation:', error);
      alert('An error occurred while managing the reservation.');
    }
  };
  
  

  useEffect(() => {
    const fetchUserReservation = async () => {
      if (!selectedLesson || !isLoggedIn) return; // Exit if no lesson or user not logged in
  
      const token = localStorage.getItem('jwt');
      const personId = person?.id;
  
      if (!token || !personId) return; // Ensure the user is logged in
  
      try {
        // Fetch reservation status for this lesson
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations?filters[person]=${personId}&filters[lesson]=${selectedLesson.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const reservationData = await response.json();
        if (reservationData.data?.length > 0) {
          // User has a reservation
          setUserReservationStatus(true);
        } else {
          // User does not have a reservation
          setUserReservationStatus(false);
        }
      } catch (error) {
        console.error('Error fetching reservation:', error);
        setUserReservationStatus(false); // Assume no reservation if error occurs
      }
    };
  
    fetchUserReservation();
  }, [selectedLesson, isLoggedIn, person?.id]); // Re-fetch whenever the lesson or login state changes
  
  
  
  
  
  


  return (
    <div>
      <div
      className={`background ${imageLoaded ? 'loaded' : ''}`}
      style={{
        backgroundImage: `url(${imageLoaded ? '../../backend/public/uploads/pexels_muhammad_khairul_iddin_adnan_267454_808510_1_618a8a6ae7.jpg' : ''})`,
      }}
    ></div>
      <Navbar />
      
      <div>
      <div className={styles.container}>
        <div className={styles.calendarContainer}>
          <h1 className={styles.heading}>Weekly Schedule</h1>
          <Calendar lessons={lessons} onLessonClick={handleLessonClick} />
        </div>
        <div className={styles.sidebarContainer}>
  <div className={styles.sidebar}>
    {/* User Info Section */}
    <div className={styles.userInfo}>
      {isLoggedIn ? (
        <>
          <h2 className={styles.userName}>
            {person ? person.attributes.name : 'Loading...'} {person ? person.attributes.surname : ''}
          </h2>
          <p className={styles.userDetails}><strong>Telephone:</strong> {user.telephone}</p>
          <p className={styles.userDetails}><strong>Email:</strong> {user.email}</p>
          <p className={styles.userDetails}><strong>Address:</strong> {user.address}</p>
          <p className={styles.userDetails}><strong>Postal Code:</strong> {user.postal}</p>
          <p className={styles.userDetails}><strong>Date of Birth:</strong> {user.dateofbirth}</p>
          <p className={styles.userDetails}><strong>Status:</strong> {user.status}</p>
          <p className={styles.userDetails}><strong>Type:</strong> {user.type}</p>
          <Link href={`/osoby/${person.id}/edit`}>
            <button className={styles.editButton}>Edit Information</button>
          </Link>
        </>
      ) : (
        <div className={styles.loginPrompt}>
          <p>Please log in to view your information.</p>
          <button className={styles.loginButton}>Log In</button>
        </div>
      )}
    </div>
  </div>

  <div className={styles.sidebar}>
    {/* Lessons Section */}
    <div className={styles.userLessons}>
      <h3 className={styles.sectionHeading}>Your Lessons</h3>
      {userLessons.length > 0 ? (
        <ul className={styles.lessonList}>
          {userLessons.map((lesson) => (
            <li key={lesson.id} className={styles.lessonItem}>
              <p><strong>{lesson.attributes.Name}</strong></p>
              <p>
                <strong>Time:</strong>{' '}
                {new Date(lesson.attributes.Start).toLocaleString()} -{' '}
                {new Date(lesson.attributes.End).toLocaleString()}
                
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.loginPrompt}>
        <p>You are not enrolled in any lessons yet.</p>
        </div>
      )}
    </div>
  </div>
</div>




        {selectedLesson && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.close} onClick={closeModal}>&times;</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{selectedLesson.attributes.Name}</h2>
              <p><strong>Start:</strong> {new Date(selectedLesson.attributes.Start).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(selectedLesson.attributes.End).toLocaleString()}</p>
              <p><strong>Trainer:</strong> {selectedLesson.attributes.trainer.data.attributes.name} {selectedLesson.attributes.trainer.data.attributes.surname}</p>
              {selectedLesson.attributes.room.data ? (
                <>
                  <p><strong>Room:</strong> {selectedLesson.attributes.room.data.attributes.Name}</p>
                  <p><strong>Room Capacity:</strong> {selectedLesson.attributes.room.data.attributes.Capacity}</p>
                </>
              ) : (
                <p><strong>Room:</strong> Not assigned</p>
              )}
              <div className={styles.progressContainer}>
  <span className={styles.progressLabel}>Joined:</span>
  <div className={styles.progressBar}>
    <div
      className={styles.progressFill}
      style={{
        width: reservations[selectedLesson.id]
          ? `${(reservations[selectedLesson.id] / (selectedLesson.attributes.room.data?.attributes.Capacity || 1)) * 100}%`
          : '0%', // Default to 0% if no reservation
      }}
    />
    <span className={styles.progressText}>
      {reservations[selectedLesson.id] || 0} / {selectedLesson.attributes.room.data?.attributes.Capacity || 'N/A'}
    </span>
  </div>
</div>
              <span>
                <Link href={``}>
                <button
  className={`${styles.addButton} ${
    (userReservationStatus === false && reservations[selectedLesson.id] >= selectedLesson.attributes.room.data?.attributes.Capacity) ||
    !isLoggedIn
      ? styles.disabledButton
      : ''
  }`}
  onClick={() => handleReservation(selectedLesson.id)}
  disabled={
    !isLoggedIn || (userReservationStatus === false && reservations[selectedLesson.id] >= selectedLesson.attributes.room.data?.attributes.Capacity)
  }
>
  {userReservationStatus ? 'Cancel Reservation' : 'Add to Lesson'}
</button>

                </Link>
              </span>
              <span>
                {userRole === 'admin' && ( // Check if user is Admin
                  <Link href={`/lesson-list/${selectedLesson.id}`}>
                    <button className={styles.addButton}>Lesson list</button>
                  </Link>
                )}
              </span>
            </div>
          </div>
        )}


      </div>
      <Footer />
      </div>
       
    </div>
    
  );
  
};

export default HomePage;

