'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../templates/navbar/navbar';
import Footer from '../templates/footer/footer';
import styles from './page.module.css';

interface Room {
  id: number;
  attributes: {
    Name: string;
    Capacity: number;
  };
}

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`);
        setRooms(response.data.data);
      } catch (error: any) {
        setError(`Error fetching rooms: ${error.message}`);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Rooms</h1>
        {error && <p className={styles.error}>{error}</p>}
        
        <Link href="/room/create-room" passHref>
          <button className={styles.createButton}>Add Room</button>
        </Link>

        <div className={styles.list}>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.id} className={styles.card}>
                <div className={styles.details}>
                <span className={styles.name}>{room.attributes.Name}</span>
                <span>Capacity: {room.attributes.Capacity}</span>
                </div>
                <Link href={`/room/${room.id}`} passHref>
                  <button className={styles.detailsButton}>Edit</button>
                </Link>
              </div>
            ))
          ) : (
            <p>No rooms available.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RoomList;
