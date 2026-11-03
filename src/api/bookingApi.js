const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = (hasBody = false) => {
    const headers = {};
    if (hasBody) {
        headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('token') || localStorage.getItem('attendee_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        let guestId = localStorage.getItem('guest_attendee_id');
        if (!guestId) {
            guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            localStorage.setItem('guest_attendee_id', guestId);
        }
        headers['x-test-attendee-id'] = guestId;
    }
    return headers;
};

/**
 * Fetch available tickets for an event.
 */
export const fetchEventTickets = async (eventId, eventDateId, timeSlotId) => {
    try {
        const queryParams = new URLSearchParams();
        if (eventDateId) queryParams.set('eventDateId', eventDateId);
        if (timeSlotId) queryParams.set('timeSlotId', timeSlotId);

        const url = `${API_BASE_URL}/events/${eventId}/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const res = await fetch(url, { method: 'GET', headers: getHeaders() });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error fetching event tickets:', err);
        return { success: false, tickets: [] };
    }
};

/**
 * Add ticket to cart.
 */
export const addToCartApi = async ({ ticketId, quantity = 1, pricePerTicket, eventDateId, timeSlotId }) => {
    try {
        const payload = { ticketId, quantity };
        if (pricePerTicket !== undefined) payload.pricePerTicket = Number(pricePerTicket);
        if (eventDateId) payload.eventDateId = eventDateId;
        if (timeSlotId) payload.timeSlotId = timeSlotId;

        const res = await fetch(`${API_BASE_URL}/tickets/cart/add`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error adding to cart:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Get user's cart.
 */
export const fetchCartApi = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/cart`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error fetching cart:', err);
        return { success: false, cartItems: [], summary: { totalItems: 0, totalAmount: 0 } };
    }
};

/**
 * Update item quantity in cart.
 */
export const updateCartItemApi = async (ticketId, { quantity, pricePerTicket, eventDateId, timeSlotId }) => {
    try {
        const payload = { quantity };
        if (pricePerTicket !== undefined) payload.pricePerTicket = Number(pricePerTicket);
        if (eventDateId) payload.eventDateId = eventDateId;
        if (timeSlotId) payload.timeSlotId = timeSlotId;

        const res = await fetch(`${API_BASE_URL}/tickets/cart/${ticketId}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error updating cart item:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Remove item from cart.
 */
export const removeFromCartApi = async (ticketId, eventDateId, timeSlotId) => {
    try {
        const queryParams = new URLSearchParams();
        if (eventDateId) queryParams.set('eventDateId', eventDateId);
        if (timeSlotId) queryParams.set('timeSlotId', timeSlotId);

        const url = `${API_BASE_URL}/tickets/cart/${ticketId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error removing from cart:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Initiate purchase (create transaction).
 */
export const initiatePurchaseApi = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/purchase`, {
            method: 'POST',
            headers: getHeaders(),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error initiating purchase:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Confirm purchase after payment or for free tickets.
 */
export const confirmPurchaseApi = async (transactionId, providerPaymentId = '', signature = '') => {
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/purchase/${transactionId}/confirm`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ providerPaymentId, signature }),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error confirming purchase:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Fetch user's tickets / bookings.
 */
export const fetchMyTicketsApi = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error fetching user tickets:', err);
        return { success: false, tickets: [] };
    }
};

/**
 * Cancel purchase / ticket.
 */
export const cancelPurchaseApi = async (transactionId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/purchase/${transactionId}/cancel`, {
            method: 'POST',
            headers: getHeaders(),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error cancelling purchase:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Create Razorpay Order
 */
export const createRazorpayOrderApi = async (amountInPaise) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ amount: amountInPaise }),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Verify Razorpay Payment Signature
 */
export const verifyRazorpayPaymentApi = async (paymentData) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/payments/verify`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(paymentData),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error verifying Razorpay payment:', err);
        return { success: false, message: err.message };
    }
};

