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
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Show loader
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/people`);
        setOsoby(response.data.data);
      } catch (error: any) {
        console.error('Error fetching people:', error.response ? error.response.data : error.message);
        setError(`Error fetching people: ${error.response ? error.response.data.message : error.message}`);
      } finally {
        setLoading(false); // Hide loader after fetching data
      }
    };
    fetchData();
  }, []);

  // Filter people based on search query
  const filteredOsoby = osoby.filter((osoba) =>
    `${osoba.attributes.name} ${osoba.attributes.surname}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>People</h1>
        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Search by name or surname"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input
          className={styles.searchInput}
        />

        {/* Loader */}
        {loading ? (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredOsoby.length > 0 ? (
              filteredOsoby.map((osoba) => (
                <div key={osoba.id} className={styles.card}>
                  <div className={styles.details}>
                    <span className={styles.name}>
                      {osoba.attributes.name} {osoba.attributes.surname}
                    </span>
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Osoby;
