'use client';

import { useParams, useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../templates/navbar/navbar';
import Footer from '../../templates/footer/footer';
import styles from './page.module.css';

interface Info {
  type: string;
  children: { type: string; text: string }[];
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
    Info: Info[];
    status: string;
  };
}

const OsobaDetails = () => {
  const { id } = useParams(); 
  const router = useRouter();
  const [osoba, setOsoba] = useState<Osoba | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/people/${id}`);
          setOsoba(response.data.data);
        } catch (error: any) {
          console.error('Error fetching person:', error.response ? error.response.data : error.message);
          setError(`Error fetching person: ${error.response ? error.response.data.message : error.message}`);
        }
      };
      fetchData();
    }
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Person Details</h1>
        {error && <p className={styles.error}>{error}</p>}
        {osoba ? (
          <div className={styles.details}>
            <h2 className={styles.name}>
              {osoba.attributes.name} {osoba.attributes.surname}
            </h2>
            <div className={styles.infoSection}>
              <p><strong>Telephone:</strong> {osoba.attributes.telephone}</p>
              <p><strong>Email:</strong> {osoba.attributes.email}</p>
              <p><strong>Address:</strong> {osoba.attributes.address}</p>
              <p><strong>Postal Code:</strong> {osoba.attributes.Postal}</p>
              <p><strong>Status:</strong> {osoba.attributes.status}</p>
            </div>

            {/* Render Info array */}
            {osoba.attributes.Info.length > 0 && (
              <div className={styles.infoList}>
                <h3>Additional Information</h3>
                <ul>
                  {osoba.attributes.Info.map((info, index) => (
                    <li key={index}>
                      {info.children.map((child, childIndex) => (
                        <p key={childIndex} className={styles.infoText}>{child.text}</p>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Edit button that redirects to the edit page */}
            <button
              className={styles.editButton}
              onClick={() => {
                router.push(`/osoby/${id}/edit`); 
              }}
            >
              Edit
            </button>
          </div>
        ) : (
          <p>Loading person details...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OsobaDetails;
