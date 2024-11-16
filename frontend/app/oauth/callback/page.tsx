'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const OAuthCallback = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('id_token'); // Capture the OAuth token from the URL (or 'access_token')

    if (!oauthToken) {
      setError('Missing ID Token');
      setLoading(false);
      return;
    }

    try {
      // Decode the JWT token to get user data
      const decoded = JSON.parse(atob(oauthToken.split('.')[1]));
      const userEmail = decoded.email; // Assuming the token contains the email

      if (!userEmail) {
        setError('Email not found in the token');
        setLoading(false);
        return;
      }

      // Store the OAuth token in localStorage as 'jwt'
      localStorage.setItem('jwt', oauthToken);

      // Now that we have the token, check if it's expired
      if (isTokenExpired(oauthToken)) {
        // If expired, refresh the token or handle accordingly
        handleTokenExpiration();
        return;
      }

      // Continue with your normal logic after verifying the token
      fetch('http://localhost:1337/api/users?populate=person')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch users, Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const userExists = data.some((user: any) => user.email === userEmail);

          if (userExists) {
            // Fetch person data to check if the user is associated with a person
            fetch('http://localhost:1337/api/people?populate=users_permissions_user')  // Correct API endpoint
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch people data, Status: ${response.status}`);
                }
                return response.json();
              })
              .then((personData) => {
                // Check if the person data is available and contains the expected structure
                const personAssociated = personData.data && personData.data.some((person: any) => {
                  const userPermission = person.attributes.users_permissions_user;
                  // Ensure that users_permissions_user exists and has the correct email
                  return userPermission && userPermission.data && userPermission.data.attributes.email === userEmail;
                });

                if (personAssociated) {
                  router.push('/');  // User is associated with a person, go to the home page
                } else {
                  router.push('/create-person'); // User isn't associated, go to the create-person page
                }
                setLoading(false);
              })
              .catch((err) => {
                setError(`Error fetching person data: ${err.message}`);
                console.error('Error fetching person data:', err);
                setLoading(false);
              });
          } else {
            setError('User not found');
            setLoading(false);
          }
        })
        .catch((err) => {
          setError(`Error fetching users: ${err.message}`);
          console.error('Error fetching users:', err);
          setLoading(false);
        });

    } catch (err) {
      setError('Failed to decode ID Token');
      console.error('Error decoding token', err);
      setLoading(false);
    }
  }, [router]);

  // Function to check if the JWT token is expired
  const isTokenExpired = (token: string): boolean => {
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decodedToken.exp < currentTime; // Return true if token is expired
  };

  // Function to handle token expiration
  const handleTokenExpiration = () => {
    // Handle expired token: either refresh or ask the user to log in again
    console.log('Token expired, prompting re-authentication');
    // Optionally, redirect the user to the login page
    router.push('/login'); // Redirect to login if the token is expired
  };

  // Show loading state while the OAuth logic is being executed
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error message if something goes wrong
  if (error) {
    return <div>Error: {error}</div>;
  }

  // If everything is successful, you can choose to redirect or show a success message
  return null;  // You can customize this if you want to show a success message or do something else
};

export default OAuthCallback;
