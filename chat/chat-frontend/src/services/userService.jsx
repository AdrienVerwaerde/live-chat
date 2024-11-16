// services/userService.js
const API_URL = 'http://localhost:4001/api/users';

export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register.');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to login.');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token); // Store JWT token
    localStorage.setItem('username', data.user.username); // Store username
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

