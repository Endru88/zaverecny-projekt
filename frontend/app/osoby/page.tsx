'use client';

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '../templates/navbar/navbar';
import Footer from '../templates/footer/footer';
import styles from './page.module.css';

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
  };
}

const Osoby = () => {
  const [osoby, setOsoby] = useState<Osoba[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/people`);
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
  <div className={styles.list}>
    {osoby.length > 0 ? (
      osoby.map((osoba) => (
        <div key={osoba.id} className={styles.card}>
          <div className={styles.details}>
            <span className={styles.name}>{osoba.attributes.name} {osoba.attributes.surname}</span>
            <span>{osoba.attributes.status}</span>
          </div>
          <Link href={`/osoby/${osoba.id}`} passHref>
  <button className={styles.detailsButton}>Details</button>
</Link>
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