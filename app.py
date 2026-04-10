from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
import json
import os
import random
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['DEBUG'] = os.environ.get('DEBUG', 'False').lower() == 'true'

# Initialize extensions
CORS(app)

# Greeting messages for different times and moods
GREETINGS = {
    "morning": [
        "Good morning, my sunshine ☀️",
        "Rise and shine, handsome 💛",
        "Another day, another reason I love you",
        "Hope your day starts with a smile 😊",
        "Good morning to the love of my life ❤️"
    ],
    "afternoon": [
        "You mean everything to me 💕",
        "Loving you is my favorite thing",
        "You make my world complete 🌍",
        "Just thinking about you makes me smile 😊",
        "Forever grateful for you ❤️"
    ],
    "encouraging": [
        "You've got this! 💪",
        "Go conquer the day, champ 🚀",
        "I believe in you, always 💖",
        "You are stronger than you think",
        "Today is yours — make it amazing ✨"
    ],
    "playful": [
        "Hey cutie 😘",
        "Smile! Someone loves you 😄",
        "You + Me = ❤️",
        "Warning: You're too adorable 😍",
        "Just a daily dose of love 💌"
    ],
    "evening": [
        "Hope your day was beautiful 💫",
        "Missing you a little extra today ❤️",
        "Counting days until I can see you again 🌙",
        "Nights feel incomplete without you here",
        "You're my favorite person always 💖",
        "Ending the day thinking of you 🌙"
    ],
    "midnight": [
        "I'm thinking of you even when the world is asleep ❤️",
        "It's midnight… and you're still on my mind ❤️",
        "The world is asleep, but my heart is awake thinking of you 🌙",
        "Even at midnight, you're my favorite thought 💖",
        "Somewhere between today and tomorrow… I choose you again ❤️",
        "If you were here, this night would be perfect 🌙",
        "Sending you a silent hug across miles 🤗",
        "Midnight thoughts = you ❤️",
        "You're my last thought today and my first tomorrow 💖",
        "I wish this silence had you in it"
    ]
}

def get_greeting():
    """Get time-appropriate greeting message."""
    hour = datetime.now().hour

    if hour >= 0 and hour < 3:  # Midnight to 3 AM
        pool = GREETINGS["midnight"]
    elif hour < 12:
        pool = GREETINGS["morning"]
    elif hour < 17:
        pool = GREETINGS["afternoon"] + GREETINGS["encouraging"]
    elif hour < 21:
        pool = GREETINGS["playful"] + GREETINGS["encouraging"]
    else:
        pool = GREETINGS["evening"]

    return random.choice(pool)

# Add cache control headers to prevent caching issues
@app.after_request
def after_request(response):
    # Disable caching for API and HTML responses
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Simple in-memory data storage (resets on deployment)
# For production, you'd want to use a database like PostgreSQL
TASKS_DATA = []
NEXT_ID = 1

def load_tasks():
    """Load tasks from memory."""
    return TASKS_DATA

def save_tasks(tasks):
    """Save tasks to memory."""
    global TASKS_DATA
    TASKS_DATA = tasks

def get_next_id(tasks):
    """Get next available ID."""
    global NEXT_ID
    if not tasks:
        NEXT_ID = 1
        return 1
    
    # Find the highest ID and increment
    max_id = max(task['id'] for task in tasks) if tasks else 0
    NEXT_ID = max_id + 1
    return NEXT_ID

@app.route('/')
def index():
    """Redirect directly to tasks - no unnecessary home page."""
    return redirect(url_for('tasks_page'))

@app.route('/tasks')
def tasks_page():
    """Task management page route."""
    return render_template('tasks.html')

@app.route('/debug')
def debug_page():
    """Debug page for testing API."""
    return render_template('debug.html')

@app.route('/favicon.ico')
def favicon():
    """Serve favicon as SVG with proper headers."""
    response = app.send_static_file('favicon.svg')
    response.headers['Content-Type'] = 'image/svg+xml'
    response.headers['Cache-Control'] = 'public, max-age=86400'  # Cache for 1 day
    return response

@app.route('/manifest.json')
def manifest():
    """Serve PWA manifest."""
    return app.send_static_file('manifest.json')

# API Routes
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks."""
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task."""
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    tasks = load_tasks()
    
    task = {
        'id': get_next_id(tasks),
        'title': data['title'],
        'description': data.get('description', ''),
        'completed': False,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    tasks.append(task)
    save_tasks(tasks)
    
    return jsonify(task), 201

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task by ID."""
    tasks = load_tasks()
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
        
    return jsonify(task)

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a specific task."""
    tasks = load_tasks()
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update fields if provided
    if 'title' in data:
        task['title'] = data['title']
    if 'description' in data:
        task['description'] = data['description']
    if 'completed' in data:
        task['completed'] = data['completed']
    
    task['updated_at'] = datetime.now().isoformat()
    
    save_tasks(tasks)
    
    return jsonify(task)

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a specific task."""
    tasks = load_tasks()
    task_index = next((i for i, t in enumerate(tasks) if t['id'] == task_id), None)
    
    if task_index is None:
        return jsonify({'error': 'Task not found'}), 404
    
    tasks.pop(task_index)
    save_tasks(tasks)
    
    return jsonify({'message': 'Task deleted successfully'}), 200

# Admin/Debug Routes
@app.route('/api/reset', methods=['POST'])
def reset_data():
    """Reset all task data - for admin use."""
    global TASKS_DATA, NEXT_ID
    try:
        TASKS_DATA = []
        NEXT_ID = 1
        return jsonify({'message': 'Data reset successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)