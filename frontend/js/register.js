import { apiUrl } from './config.js';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (password.length < 8) {
        document.getElementById('error').innerText = 'Password must be at least 8 characters long';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        const result = await response.json();
        if (result.success) {
            window.location.href = 'login.html';  // Redirect on success
        } else {
            document.getElementById('error').innerText = result.message;
        }
    } catch (error) {
        document.getElementById('error').innerText = 'Error registering.';
    }
});