'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../templates/navbar/navbar';
import Footer from '../../templates/footer/footer';
import styles from './page.module.css';

type Person = {
  id: string;
  attributes: {
    name: string;
    surname: string;
    email: string;
    telephone: string;
    status: string;
    type: string;
  };
};

type Reservation = {
  id: string;
  attributes: {
    person: {
      data: Person | null; // Person data could be null
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
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [searchResults, setSearchResults] = useState<Person[]>([]); // State for search results
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null); // State for selected person
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState<string | null>(null); // State for errors

  useEffect(() => {
    if (id) {
      const fetchLessonDetails = async () => {
        try {
          const lessonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}?populate=trainer&populate=room`);
          const lessonData = await lessonResponse.json();
          setLessonDetails(lessonData.data);

          const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations?filters[lesson]=${id}&populate=person`);
          const reservationData = await reservationResponse.json();
          setReservations(reservationData.data || []);

          setLoading(false);
        } catch (error) {
          console.error('Error fetching lesson details or reservations:', error);
          setError('There was an error loading the lesson details or reservations.');
          setLoading(false); // Stop loading in case of error
        }
      };

      fetchLessonDetails();
    }
  }, [id]);

  // Function to handle deleting a reservation
  const deleteReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReservations((prevReservations) =>
          prevReservations.filter((reservation) => reservation.id !== reservationId)
        );
      } else {
        console.error('Failed to delete reservation');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  // Function to search for existing people by name
  const searchPeople = async (query: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/people?filters[name][$contains]=${query}`);
      const data = await response.json();
      console.log('Search Results:', data.data); // Log the response to debug
  
      // Get IDs of already reserved people
      const reservedIds = reservations.map((reservation) => reservation.attributes.person.data?.id);
  
      // Filter out people who are already reserved
      const filteredResults = data.data.filter((person: Person) => !reservedIds.includes(person.id));
  
      setSearchResults(filteredResults || []);
    } catch (error) {
      console.error('Error searching for people:', error);
    }
  };

  // Function to handle adding a selected person to the lesson
  const addReservation = async () => {
    if (!selectedPerson) {
      alert('Please select a person to add.');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations?populate=person`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            person: selectedPerson.id,
            lesson: id,
          },
        }),
      });
  
      if (response.ok) {
        const newReservation = await response.json();
        console.log('New Reservation:', newReservation); // Log to inspect the structure
        
        // Add the new reservation to the existing reservations without reloading the page
        setReservations((prevReservations) => [...prevReservations, newReservation.data]);
        setSelectedPerson(null);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        console.error('Failed to add reservation');
      }
    } catch (error) {
      console.error('Error adding reservation:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        {loading ? (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <>
            {lessonDetails ? (
              <>
                <h1 className={styles.heading}>{lessonDetails.attributes.Name}</h1>
                <div className={styles.detailsSection}>
                  <p className={styles.detailItem}><strong>Start:</strong> <span className={styles.data}>{new Date(lessonDetails.attributes.Start).toLocaleString()}</span></p>
                  <p className={styles.detailItem}><strong>End:</strong> <span className={styles.data}>{new Date(lessonDetails.attributes.End).toLocaleString()}</span></p>
                  <p className={styles.detailItem}><strong>Trainer:</strong> <span className={styles.data}>{lessonDetails.attributes.trainer.data?.attributes.name} {lessonDetails.attributes.trainer.data?.attributes.surname}</span></p>
                  <p className={styles.detailItem}><strong>Room:</strong> <span className={styles.data}>{lessonDetails.attributes.room.data ? lessonDetails.attributes.room.data.attributes.Name : 'Not assigned'}</span></p>
                </div>
                <h2 className={styles.subheading}>Add Person</h2>
                <div className={styles.searchForm}>
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchPeople(e.target.value);
                    }}
                  />
                  <ul className={styles.searchResults}>
                    {searchResults.map((person) => (
                      <li
                        key={person.id}
                        className={styles.searchItem}
                        onClick={() => setSelectedPerson(person)}
                      >
                        {person.attributes.name} {person.attributes.surname}
                      </li>
                    ))}
                  </ul>
                  {selectedPerson && (
                    <div className={styles.selectedPerson}>
                      <p>
                        Selected: {selectedPerson.attributes.name} {selectedPerson.attributes.surname}
                      </p>
                      <button onClick={addReservation}>Add to Lesson</button>
                    </div>
                  )}
                </div>
                <h2 className={styles.subheading}>People Reserved</h2>
                <ul className={styles.list}>
                  {reservations.length > 0 ? (
                    reservations.map((reservation) => {
                      const person = reservation.attributes.person.data;
                      if (!person) {
                        return (
                          <li key={reservation.id} className={styles.card}>
                            <div className={styles.details}>
                              <span className={styles.name}>No Person Info Available</span>
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li key={reservation.id} className={styles.card}>
                          <div className={styles.details}>
                            <span className={styles.name}>
                              {person.attributes.name} {person.attributes.surname}
                            </span>
                            <button
                              className={styles.deleteButton}
                              onClick={() => deleteReservation(reservation.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <p>No reservations yet.</p>
                  )}
                </ul>
              </>
            ) : (
              <p>Loading lesson details...</p>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LessonDetails;
