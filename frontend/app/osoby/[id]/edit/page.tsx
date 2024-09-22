'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../../templates/navbar/navbar';
import Footer from '../../../templates/footer/footer';
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
    status: string;
    Info: Info[];
  };
}

const EditOsoba = () => {
  const { id } = useParams();
  const router = useRouter();
  const [osoba, setOsoba] = useState<Osoba | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Osoba['attributes'] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/people/${id}`);
        setOsoba(response.data.data);
        setFormData(response.data.data.attributes);
      } catch (error: any) {
        console.error('Error fetching person:', error);
        setError(`Error fetching person: ${error.response ? error.response.data.message : error.message}`);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
    if (formData) {
      if (index !== undefined) {
        // Handle Info updates
        const updatedInfo = formData.Info.map((info, i) =>
          i === index ? { ...info, children: [{ type: 'text', text: e.target.value }] } : info
        );
        setFormData({ ...formData, Info: updatedInfo });
      } else {
        // Handle regular field updates
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/people/${id}`, {
          data: formData,
        });
        router.push(`/osoby/${id}`);
      } catch (error: any) {
        console.error('Error updating person:', error);
        setError(
          error.response && error.response.data
            ? `Error updating person: ${error.response.data.message || error.response.statusText}`
            : `Error updating person: ${error.message}`
        );
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Edit Person</h1>
        {error && <p className={styles.error}>{error}</p>}
        {formData ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name:</label>
              <input type="text" name="name" className={styles.input} value={formData.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Surname:</label>
              <input type="text" name="surname" className={styles.input} value={formData.surname} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Telephone:</label>
              <input type="tel" name="telephone" className={styles.input} value={formData.telephone} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email:</label>
              <input type="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Address:</label>
              <input name="text" className={`${styles.input} `} value={formData.address} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Postal Code:</label>
              <input type="text" name="Postal" className={styles.input} value={formData.Postal} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status:</label>
              <input type="text" name="status" className={styles.input} value={formData.status} onChange={handleChange} required />
            </div>

            {/* Info section */}
            <h3 className={styles.label}>Additional Information:</h3>
            {formData.Info.map((info, index) => (
              <div key={index} className={styles.formGroup}>
                <textarea
                  value={info.children[0]?.text || ''}
                  onChange={(e) => handleChange(e, index)}
                  className={`${styles.input} ${styles.textarea}`}
                  required
                />
              </div>
            ))}

            <button type="submit" className={styles.submitButton}>Save Changes</button>
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EditOsoba;
