'use client';

import React, {useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../templates/navbar/navbar';
import Footer from '../templates/footer/footer';
import styles from './page.module.css';

interface Lesson {
  id: number;
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
          Capacity: number;
        };
      };
    };
  };
}

const Lessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons?populate=trainer&populate=room`);
        setLessons(response.data.data);
      } catch (error: any) {
        console.error('Error fetching lessons:', error.response ? error.response.data : error.message);
        setError(`Error fetching lessons: ${error.response ? error.response.data.message : error.message}`);
      }
    };
    fetchLessons();
  }, []);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
    setSelectedWeek(null);
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const filteredLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.attributes.Start);
    const matchesSearch = lesson.attributes.Name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = selectedMonth ? lessonDate.getMonth() === selectedMonth : true;
    const matchesWeek = selectedWeek ? Math.ceil(lessonDate.getDate() / 7) === selectedWeek : true;

    return matchesSearch && matchesMonth && matchesWeek;
  });

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    const dateA = new Date(a.attributes.Start);
    const dateB = new Date(b.attributes.Start);
    return dateA.getTime() - dateB.getTime();
  });

  const handleDeleteClick = (lesson: Lesson) => {
    setLessonToDelete(lesson); // Open the confirmation popup for the selected lesson
  };

  const confirmDelete = async () => {
    if (!lessonToDelete) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${lessonToDelete.id}`);
      setLessons(lessons.filter((lesson) => lesson.id !== lessonToDelete.id));
      setLessonToDelete(null); // Close the confirmation popup
    } catch (error: any) {
      console.error('Error deleting lesson:', error.response ? error.response.data : error.message);
      setError(`Error deleting lesson: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const cancelDelete = () => {
    setLessonToDelete(null);
  };

  return (
    <div>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.heading}>Lessons</h1>
        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Search by lesson name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.selectContainer}>
          <select onChange={handleMonthChange} className={styles.selectInput}>
            <option value="">Select Month</option>
            {[...Array(12).keys()].map((month) => (
              <option key={month} value={month}>
                {new Date(0, month).toLocaleString('en', { month: 'long' })}
              </option>
            ))}
          </select>

          <select onChange={handleWeekChange} className={styles.selectInput}>
            <option value="">Select Week</option>
            {[1, 2, 3, 4, 5].map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
          
          <Link href="/create-lesson">
            <button className={styles.createButton}>Create Lesson</button>
          </Link>
        </div>

        <div className={styles.list}>
          {sortedLessons.length > 0 ? (
            sortedLessons.map((lesson) => (
              <div key={lesson.id} className={styles.card}>
                <div className={styles.details}>
                  <span className={styles.name}>{lesson.attributes.Name}</span>
                  <span>
                    {new Date(lesson.attributes.Start).toLocaleString()} -{' '}
                    {new Date(lesson.attributes.End).toLocaleString()}
                  </span>
                  <span>
                    {lesson.attributes.trainer.data.attributes.name} {lesson.attributes.trainer.data.attributes.surname}
                  </span>
                  <span>{lesson.attributes.room.data.attributes.Name}</span>
                  <span>{lesson.attributes.room.data.attributes.Capacity}</span>
                  <Link legacyBehavior href={`/lesson/${lesson.id}`} passHref>
                    <button className={styles.detailsButton}>Details</button>
                  </Link>
                  {/* Delete Button */}
                  <button className={styles.deleteButton} onClick={() => handleDeleteClick(lesson)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No lessons found.</p>
          )}
        </div>

        {/* Confirmation Popup */}
        {lessonToDelete && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <p>Are you sure you want to delete this lesson?</p>
              <button onClick={confirmDelete} className={styles.confirmButton}>Yes</button>
              <button onClick={cancelDelete} className={styles.cancelButton}>No</button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Lessons;
