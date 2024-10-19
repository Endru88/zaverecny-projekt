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
    dateofbirth: string;
    type: string;
    Info: Info[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
  };
}

const EditOsoba = () => {
  const { id } = useParams();
  const router = useRouter();
  const [osoba, setOsoba] = useState<Osoba | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Osoba['attributes'] | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (formData) {
      const updatedInfo = e.target.value.split(', ').map(text => ({
        type: 'paragraph',
        children: [{ type: 'text', text }],
      }));
      setFormData({ ...formData, Info: updatedInfo });
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
              <input name="address" className={styles.input} value={formData.address} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Postal Code:</label>
              <input type="text" name="Postal" className={styles.input} value={formData.Postal} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Birth:</label>
              <input type="date" name="dateofbirth" className={styles.input} value={formData.dateofbirth || ''} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Type:</label>
              <select
                name="type"
                className={styles.input}
                value={formData.type || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Student">Student</option>
                <option value="Adult">Adult</option>
                <option value="Child">Child</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            {/* Render status input for Admin */}
            {userRole === 'admin' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Status:</label>
                <select
                  name="status"
                  className={styles.input}
                  value={formData.status || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="Club member">Club member</option>
                  <option value="Client">Client</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Multisport">Multisport</option>
                </select>
              </div>
            )}

            {/* Render Info input for Admin */}
            {userRole === 'admin' && Array.isArray(formData.Info) && formData.Info.length > 0 && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Additional Information:</label>
                <textarea
                  name="Info"
                  className={styles.input}
                  value={formData.Info.map(info => info.children.map(child => child.text).join(' ')).join(', ')}
                  onChange={handleInfoChange}
                />
              </div>
            )}

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
