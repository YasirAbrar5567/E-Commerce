const API_URL = 'http://localhost:3000/api';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
});

export const getCart = async () => {
    const response = await fetch(`${API_URL}/cart`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch cart.');
    }
    return response.json();
};

export const addToCart = async (productId: number, quantity: number) => {
    const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
        throw new Error('Failed to add item to cart.');
    }
    return response.json();
};

export const removeFromCart = async (productId: number) => {
    const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to remove item from cart.');
    }
    return response.json();
};

export const updateCartQuantity = async (productId: number, quantity: number) => {
    const response = await fetch(`${API_URL}/cart/update/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
        throw new Error('Failed to update item quantity.');
    }
    return response.json();
};
