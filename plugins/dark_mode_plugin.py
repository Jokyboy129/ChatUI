import os
from flask import Blueprint, render_template, request, jsonify, make_response, current_app

# Define the plugin name
PLUGIN_NAME = 'dark_mode_plugin'

# Create a Blueprint for the dark mode feature
# This allows the plugin to have its own templates and static files
dark_mode_bp = Blueprint(
    'dark_mode_bp',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/dark_mode_static' # Custom URL path for static files to avoid conflicts
)

# Route for the settings page where the dark mode toggle will be
@dark_mode_bp.route('/settings')
def settings():
    # The 'dark_mode_enabled' variable is injected via the context processor
    return render_template('dark_mode_settings.html')

# API endpoint to toggle dark mode via an AJAX request
@dark_mode_bp.route('/api/toggle-dark-mode', methods=['POST'])
def toggle_dark_mode():
    data = request.get_json()
    is_dark_mode = data.get('dark_mode', False)

    response = jsonify({"success": True, "dark_mode": is_dark_mode})
    
    # Set the 'dark_mode' cookie. It will expire in 1 year.
    # httponly=True prevents client-side JavaScript from accessing the cookie, enhancing security.
    # samesite='Lax' helps mitigate CSRF attacks.
    if is_dark_mode:
        response.set_cookie('dark_mode', 'true', max_age=60*60*24*365, httponly=True, samesite='Lax')
    else:
        # Delete the cookie by setting its expiration to the past
        response.set_cookie('dark_mode', '', expires=0, httponly=True, samesite='Lax') 
    
    return response

# This function is the entry point for the plugin.
# It registers the blueprint and adds a context processor to the main Flask app.
def register(app):
    app.register_blueprint(dark_mode_bp)

    # Add a context processor to make 'dark_mode_enabled' available in all templates
    @app.context_processor
    def inject_dark_mode():
        # Check if the 'dark_mode' cookie is set to 'true'
        dark_mode = request.cookies.get('dark_mode') == 'true'
        return dict(dark_mode_enabled=dark_mode)

    # --- Plugin File Creation ---
    # This section programmatically creates the necessary template and static files
    # within the plugin's directory structure.
    
    plugin_root_dir = os.path.join(app.root_path, 'plugins', PLUGIN_NAME)
    template_dir = os.path.join(plugin_root_dir, 'templates')
    static_dir = os.path.join(plugin_root_dir, 'static')
    
    os.makedirs(template_dir, exist_ok=True)
    os.makedirs(static_dir, exist_ok=True)
    
    # Create the dark_mode_settings.html template file
    with open(os.path.join(template_dir, 'dark_mode_settings.html'), 'w') as f:
        f.write("""
{% extends "base.html" %} {# Assumes a base.html exists in your main app templates folder #}

{% block title %}Settings{% endblock %}

{% block content %}
    <div class="container mt-5">
        <h1>Settings</h1>
        <hr>
        <div class="form-check form-switch mt-4">
            <input class="form-check-input" type="checkbox" id="dark-mode-toggle" {% if dark_mode_enabled %}checked{% endif %}>
            <label class="form-check-label" for="dark-mode-toggle">Enable Dark Mode</label>
        </div>
        <p class="text-muted mt-3">
            <strong>Important:</strong> For dark mode to function correctly, you need to make the following manual modifications to your main <code>base.html</code> file:
            <ul>
                <li><strong>Body Class:</strong> Add <code>class="{{ 'dark-mode' if dark_mode_enabled else '' }}"</code> to your <code>&lt;body&gt;</code> tag. This applies the dark mode CSS.</li>
                <li><strong>Include CSS:</strong> In your <code>&lt;head&gt;</code> section, include the plugin's stylesheet: <br>
                    <code>&lt;link rel="stylesheet" href="{{ url_for('dark_mode_bp.static', filename='dark_mode.css') }}"&gt;</code></li>
                <li><strong>Include JavaScript:</strong> Before the closing <code>&lt;/body&gt;</code> tag, include the plugin's JavaScript: <br>
                    <code>&lt;script src="{{ url_for('dark_mode_bp.static', filename='dark_mode.js') }}"&gt;</code></li>
                <li><strong>Navigation Link:</strong> Add a link in your app's navigation bar or elsewhere to <code>/settings</code> to allow users to access this toggle.</li>
            </ul>
        </p>
    </div>
{% endblock %}
""")

    # Create the dark_mode.css static file
    with open(os.path.join(static_dir, 'dark_mode.css'), 'w') as f:
        f.write("""
/* dark_mode.css - Styles for Dark Mode */

/* Base Dark Mode Styles for the entire body */
body.dark-mode {
    background-color: #1a1a1a; /* Dark background */
    color: #e0e0e0;           /* Light text */
}

/* Links */
body.dark-mode a {
    color: #8ab4f8; /* Softer blue for links */
}
body.dark-mode a:hover {
    color: #bb86fc; /* Purple on hover */
}

/* Cards / Containers (example - adjust based on your app's component classes) */
body.dark-mode .card,
body.dark-mode .bg-light,
body.dark-mode .container,
body.dark-mode .jumbotron { /* Assuming common container classes like Bootstrap's */
    background-color: #2c2c2c !important; /* Darker background for elements */
    color: #e0e0e0 !important;
    border-color: #444 !important;
}

/* Form Controls (input, textarea, select) */
body.dark-mode .form-control {
    background-color: #3a3a3a;
    color: #e0e0e0;
    border-color: #555;
}
body.dark-mode .form-control::placeholder {
    color: #bbb;
}

/* Buttons */
body.dark-mode .btn-primary {
    background-color: #8ab4f8;
    border-color: #8ab4f8;
    color: #1a1a1a; /* Dark text on light button */
}
body.dark-mode .btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: #e0e0e0;
}

/* Navbars (if applicable - adjust class names for your app) */
body.dark-mode .navbar {
    background-color: #212529 !important; /* Darker navbar */
    border-bottom: 1px solid #333;
}
body.dark-mode .navbar-brand,
body.dark-mode .nav-link {
    color: #e0e0e0 !important;
}
body.dark-mode .nav-link:hover {
    color: #bb86fc !important;
}

/* Tables */
body.dark-mode .table {
    color: #e0e0e0;
}
body.dark-mode .table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(255, 255, 255, 0.05); /* Slightly lighter alternating rows */
}
body.dark-mode .table-bordered {
    border-color: #444;
}
body.dark-mode .table thead th {
    border-bottom-color: #444;
}

/* Specific style for Bootstrap switch component when checked */
.form-check-input:checked {
    background-color: #8ab4f8; /* Accent color for checked switch */
    border-color: #8ab4f8;
}

/* Add more specific dark mode styles as needed for your application's unique components */
""")

    # Create the dark_mode.js static file
    with open(os.path.join(static_dir, 'dark_mode.js'), 'w') as f:
        f.write("""
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
""")