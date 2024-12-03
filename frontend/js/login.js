import { apiUrl } from './config.js';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (result.success) {
            window.location.href = "vizualizace.html";  // Redirect on success
        } else {
            document.getElementById("error").innerText = result.message;
        }
    } catch (error) {
        document.getElementById("error").innerText = "Error logging in.";
    }
});