'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../templates/navbar/navbar';
import Footer from '../../templates/footer/footer';
import styles from './page.module.css';

type Reservation = {
  id: string;
  attributes: {
    person: {
      data: {
        attributes: {
          name: string;
          surname: string;
          email: string;
          telephone: string;
          status: string;
          type: string;
        };
      };
    };
  };
};

type Lesson = {
  id: string;
  attributes: {
    Name: string;
    Start: string;
    End: string;
    trainer: {
      data: {
        attributes: {
          name: string;
          surname: string;
        };
      };
    };
    room: {
      data: {
        attributes: {
          Name: string;
        };
      };
    };
  };
};

const LessonDetails = () => {
  const { id } = useParams(); // Access 'id' from the URL
  const [reservations, setReservations] = useState<Reservation[]>([]); // State to store reservation data
  const [lessonDetails, setLessonDetails] = useState<Lesson | null>(null); // State to store lesson details

  useEffect(() => {
    console.log('id:', id);
    if (id) {
      const fetchLessonDetails = async () => {
        try {
          const lessonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}?populate=trainer&populate=room`);
          const lessonData = await lessonResponse.json();
          console.log('Lesson Data:', lessonData);
          setLessonDetails(lessonData.data);

          const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations?filters[lesson]=${id}&populate=person`);
          const reservationData = await reservationResponse.json();
          console.log('Reservation Data:', reservationData);
          setReservations(reservationData.data || []);
        } catch (error) {
          console.error('Error fetching lesson details or reservations:', error);
        }
      };

      fetchLessonDetails();
    }
  }, [id]);

  // Function to handle deleting a reservation
  const deleteReservation = async (reservationId: string) => {
    try {
      // Send DELETE request to the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted reservation from the state
        setReservations((prevReservations) =>
          prevReservations.filter((reservation) => reservation.id !== reservationId)
        );
        console.log(`Reservation with id ${reservationId} deleted successfully.`);
      } else {
        console.error('Failed to delete reservation');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        {lessonDetails ? (
          <>
            <h1 className={styles.heading}>{lessonDetails.attributes.Name}</h1>
            <div className={styles.detailsSection}>
              <p className={styles.detailItem}><strong>Start:</strong> <span className={styles.data}>{new Date(lessonDetails.attributes.Start).toLocaleString()}</span></p>
              <p className={styles.detailItem}><strong>End:</strong> <span className={styles.data}>{new Date(lessonDetails.attributes.End).toLocaleString()}</span></p>
              <p className={styles.detailItem}><strong>Trainer:</strong> <span className={styles.data}>{lessonDetails.attributes.trainer.data.attributes.name} {lessonDetails.attributes.trainer.data.attributes.surname}</span></p>
              <p className={styles.detailItem}><strong>Room:</strong> <span className={styles.data}>{lessonDetails.attributes.room.data ? lessonDetails.attributes.room.data.attributes.Name : 'Not assigned'}</span></p>
            </div>
            <h2 className={styles.subheading}>People Reserved</h2>
            <ul className={styles.list}>
              {reservations.length > 0 ? (
                reservations.map((reservation) => (
                  <li key={reservation.id} className={styles.card}>
                    <div className={styles.details}>
                      <span className={styles.name}>
                        {reservation.attributes.person.data.attributes.name} {reservation.attributes.person.data.attributes.surname}
                      </span>
                      <span className={styles.detailItem}><strong>Email:</strong> {reservation.attributes.person.data.attributes.email}</span>
                      <span className={styles.detailItem}><strong>Telephone:</strong> {reservation.attributes.person.data.attributes.telephone}</span>
                      <span className={styles.detailItem}><strong>Status:</strong> {reservation.attributes.person.data.attributes.status}</span>
                      <span className={styles.detailItem}><strong>Type:</strong> {reservation.attributes.person.data.attributes.type}</span>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteReservation(reservation.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p>No reservations yet.</p>
              )}
            </ul>
          </>
        ) : (
          <p>Loading lesson details...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LessonDetails;
