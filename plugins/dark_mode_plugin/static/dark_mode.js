
// dark_mode.js - Client-side logic for Dark Mode Toggle

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', async (event) => {
            const isDarkMode = event.target.checked;
            
            try {
                // Send an AJAX POST request to the server to update the dark mode preference cookie
                const response = await fetch('/api/toggle-dark-mode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ dark_mode: isDarkMode })
                });

                if (response.ok) {
                    // If the server successfully updated the cookie,
                    // reload the page to ensure all styles are fully applied.
                    // This is robust for comprehensive theme changes.
                    window.location.reload(); 
                } else {
                    console.error('Failed to toggle dark mode on server:', await response.text());
                    // Revert the toggle state in the UI if the server request fails
                    event.target.checked = !isDarkMode;
                }
            } catch (error) {
                console.error('Network error when toggling dark mode:', error);
                // Revert the toggle state in the UI if there's a network error
                event.target.checked = !isDarkMode;
            }
        });
    }
});
