
'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

const LessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`);
        setLessons(response.data.data);
      } catch (error: any) {
        console.error('Error fetching lessons:', error.response ? error.response.data : error.message);
        setError(`Error fetching lessons: ${error.response ? error.response.data.message : error.message}`);
      }
    };
  
    fetchLessons();
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}
      {lessons.length === 0 ? (
        <p>No lessons available.</p>
      ) : (
        <ul>
          {lessons.map((lesson: any) => (
            <li key={lesson.id}>
              {lesson.attributes.Name} - {new Date(lesson.attributes.Start).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonsPage;
