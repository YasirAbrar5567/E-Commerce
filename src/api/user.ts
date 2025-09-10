const API_URL = 'http://localhost:3000/api';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
});

export const getProfile = async () => {
    const response = await fetch(`${API_URL}/profile`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch profile.');
    }
    return response.json();
};
