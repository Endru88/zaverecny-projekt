'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const OAuthCallback = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idToken = params.get('id_token');

    if (!idToken) {
      setError('Missing ID Token');
      setLoading(false);
      return;
    }

    try {
      // Decode the JWT token to get user data
      const decoded = JSON.parse(atob(idToken.split('.')[1]));
      const userEmail = decoded.email; // Assuming the token contains the email

      if (!userEmail) {
        setError('Email not found in the token');
        setLoading(false);
        return;
      }

      // Fetch users from the API to check if the email exists
      fetch('http://localhost:1337/api/users?populate=person')
        .then((response) => response.json())
        .then((data) => {
          // Check if the email from the token matches any user in the API response
          const userExists = data.some((user: any) => user.email === userEmail);

          if (userExists) {
            // If user exists, store in localStorage
            localStorage.setItem('username', userEmail); // Or any other user info
            localStorage.setItem('userRole', 'user'); // Default role as user
            localStorage.setItem('jwt', idToken);

            // Redirect to the main page or dashboard
            router.push('/');
          } else {
            // If user does not exist, create the user using Strapi register endpoint
            const newUser = {
              username: userEmail,  // You can adjust the fields as needed
              email: userEmail,
              password: 'defaultpassword123', // Temporary password (could be randomized or sent to the user)
            };

            // Make a POST request to register the new user
            fetch('http://localhost:1337/api/auth/local/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
              }),
            })
              .then((response) => response.json())
              .then((createdUser) => {
                // After user is created, store their data in localStorage
                localStorage.setItem('username', createdUser.user.email);
                localStorage.setItem('userRole', 'user');
                localStorage.setItem('jwt', createdUser.jwt);

                // Redirect to the main page or dashboard
                router.push('/');
              })
              .catch((err) => {
                setError('Failed to create user');
                console.error('Error creating user:', err);
                setLoading(false);
              });
          }
          setLoading(false);
        })
        .catch((err) => {
          setError('Error fetching users');
          console.error('Error fetching users:', err);
          setLoading(false);
        });

    } catch (err) {
      setError('Failed to decode ID Token');
      console.error('Error decoding token', err);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return null; // You could also redirect or show a success message
};

export default OAuthCallback;
