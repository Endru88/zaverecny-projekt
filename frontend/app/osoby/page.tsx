// app/osoby/page.tsx
'use client';
// app/osoby/page.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import Navbar from '../templates/navbar/navbar';
import Footer from '../templates/footer/footer';
import styles from './page.module.css';

interface Photo {
  data: {
    attributes: {
      url: string;
    };
  };
}

interface Osoba {
  id: number;
  attributes: {
    name: string;
    surname: string;
    telephone: string;
    email: string;
    address: string;
    Postal: string;
    Info: {
      type: string;
      children: {
        type: string;
        text: string;
      }[];
    }[];
    fotka?: Photo | null;
  };
}

const Osoby = () => {
  const [osoby, setOsoby] = useState<Osoba[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/people?populate=fotka`);
        console.log(response.data); // Log data to verify it
        setOsoby(response.data.data);
      } catch (error: any) {
        console.error('Error fetching people:', error.response ? error.response.data : error.message);
        setError(`Error fetching people: ${error.response ? error.response.data.message : error.message}`);
      }
    };
    fetchData();
  }, []);

  return (
<div>
      {/* Navbar at the top */}
      <Navbar />

      {/* Content below the navbar */}
    <div className={styles.container}>
      <h1 className={styles.heading}>People</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.grid}>
        {osoby.length > 0 ? (
          osoby.map((osoba) => (
            <div key={osoba.id} className={styles.card}>
              {osoba.attributes.fotka?.data ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${osoba.attributes.fotka.data.attributes.url}`}
                  alt={`${osoba.attributes.name} ${osoba.attributes.surname}`}
                  className={styles.photo}
                />
              ) : (
                <div className={styles.noPhoto}>No Photo Available</div>
              )}
              <div className={styles.details}>
                <h2 className={styles.name}>{osoba.attributes.name} {osoba.attributes.surname}</h2>
                <p>{osoba.attributes.telephone}</p>
                <p>{osoba.attributes.email}</p>
                <p>{osoba.attributes.address}</p>
                <p>{osoba.attributes.Postal}</p>
                <p>{osoba.attributes.Info[0]?.children[0]?.text}</p>
                <button>Contact</button>
              </div>
            </div>
          ))
        ) : (
          <p>No people found.</p>
        )}
      </div>
    </div>
    {/* Footer at the bottom */}
    <Footer />
    </div>
  );
};

export default Osoby;
