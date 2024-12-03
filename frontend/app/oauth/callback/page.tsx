'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';  // Make sure to import the CSS

const OAuthCallback = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '../../../../backend/public/uploads/pexels_muhammad_khairul_iddin_adnan_267454_808510_1_618a8a6ae7.jpg';
    img.onload = () => setImageLoaded(true);  // Set state once the image is loaded
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('id_token'); // Capture the OAuth token from the URL

    if (!oauthToken) {
      setError('Missing ID Token');
      setLoading(false);
      return;
    }

    try {
      // Decode the JWT token to get user data
      const decoded = JSON.parse(atob(oauthToken.split('.')[1])); // Decode the token and parse the payload
      const userEmail = decoded.email; // Assuming the token contains the email

      if (!userEmail) {
        setError('Email not found in the token');
        setLoading(false);
        return;
      }

      // Step 1: Check if the user exists by email
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?filters[email]=${userEmail}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch user data, Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // If the user exists
          if (data && data.length > 0) {
            console.log('User found:', data[0]);
            // Step 2: Login the existing user by calling /api/auth/local
            loginUser(data[0].email, data[0].id);
          } else {
            // If the user does not exist, create the user
            createUser(userEmail);
          }
          setLoading(false); // End the loading state
        })
        .catch((err) => {
          setError(`Error fetching user data: ${err.message}`);
          console.error('Error fetching user data:', err);
          setLoading(false);
        });
    } catch (err) {
      setError('Failed to decode ID Token');
      console.error('Error decoding token', err);
      setLoading(false);
    }
  }, [router]);

  const createUser = (userEmail: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  
    // Attempt to create a new user via Strapi's local registration endpoint
    fetch(`${apiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,           // Provide the email
        password: 'randompassword', // Provide a temporary password
        username: userEmail.split('@')[0], // Optionally, use part of the email as the username
      }),
    })
      .then((response) => {
        if (!response.ok) {
          // Try to capture more error details
          return response.json().then((errorData) => {
            throw new Error(`Failed to create user. Error: ${errorData.message || 'Unknown error'}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('User created:', data);
  
        // Store the JWT and user ID after creation
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);
  
        // Redirect to home or dashboard
        router.push('/');
      })
      .catch((err) => {
        // Log the full error response
        setError(`Error creating user: ${err.message}`);
        console.error('Error creating user:', err);
        setLoading(false);
      });
  };

  const loginUser = (userEmail: string, userId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

    // Attempt to login the existing user
    fetch(`${apiUrl}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: userEmail, // Email or username
        password: 'randompassword', // You need to have a valid password or get it from somewhere
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(`Failed to login user. Error: ${errorData.message || 'Unknown error'}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('User logged in:', data);

        // Store the JWT and user ID after login
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);

        // Step 3: Check if the person exists in the /api/people endpoint
        checkIfPersonExists(data.user.id);
      })
      .catch((err) => {
        setError(`Error logging in user: ${err.message}`);
        console.error('Error logging in user:', err);
        setLoading(false);
      });
  };

  const checkIfPersonExists = (userId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  
    // Directly search for a person by the userId
    fetch(`${apiUrl}/api/people?filters[users_permissions_user][id][$eq]=${userId}&populate=users_permissions_user`)
      .then((response) => response.json())
      .then((data) => {
        // Log the response data for debugging purposes
        console.log('Filtered People API response data:', data);
  
        if (data.data && data.data.length > 0) {
          // If a person is found that matches the userId, proceed
          console.log('User is associated with a person:', data.data[0]);
          router.push('/');
        } else {
          // If the user is not associated with a person, redirect to create-person page
          console.log('User is not associated with any person. Redirecting to create-person');
          router.push('/create-person');
        }
      })
      .catch((err) => {
        setError(`Error checking person association: ${err.message}`);
        console.error('Error checking person association:', err);
        setLoading(false);
      });
  };
  
  
  

  if (loading) {
    return (
      <div className={styles.container}>
        <div
      className={`background ${imageLoaded ? 'loaded' : ''}`}
      style={{
        backgroundImage: `url(${imageLoaded ? '../../../../backend/public/uploads/pexels_muhammad_khairul_iddin_adnan_267454_808510_1_618a8a6ae7.jpg' : ''})`,
      }}
    ></div>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div
      className={`background ${imageLoaded ? 'loaded' : ''}`}
      style={{
        backgroundImage: `url(${imageLoaded ? '../../../backend/public/uploads/pexels_muhammad_khairul_iddin_adnan_267454_808510_1_618a8a6ae7.jpg' : ''})`,
      }}
    ></div>
      <div className={styles.spinner}></div>
      <div className={styles.loadingText}>Loading...</div>
    </div>
  );
};

export default OAuthCallback;
