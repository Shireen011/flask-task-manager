# Flask Task Manager Backend

A Python Flask web application that serves as a backend API for a task management system with enhanced romantic greetings and modern UI.

<!-- Deployment trigger: Updated April 11, 2026 with midnight greetings and text buttons -->

## Features

- RESTful API endpoints for task management
- JSON file-based data storage (simple and portable)
- HTML frontend templates with Bootstrap
- Task CRUD operations (Create, Read, Update, Delete)
- Interactive JavaScript frontend
- Responsive design

## Project Structure

```
.
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── tasks.json          # JSON data storage (auto-generated)
├── templates/          # HTML templates
│   ├── index.html      # Home page
│   ├── tasks.html      # Task management page
│   └── base.html       # Base template
└── static/             # Static files (CSS, JS)
    ├── css/
    │   └── style.css   # Custom styles
    └── js/
        └── app.js      # Frontend JavaScript
```

## API Endpoints

- `GET /` - Home page
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task
- `GET /tasks` - Task management page

## Setup and Run

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python app.py
   ```

3. Open your browser and navigate to `http://localhost:5000`

## Dependencies

- Flask - Web framework
- Flask-CORS - Cross-origin resource sharing

## Development

The application runs in debug mode by default. Tasks are stored in a `tasks.json` file that is automatically created when you add your first task.

## Usage

1. **Home Page**: Navigate to the home page to see an overview of the application
2. **Task Management**: Click "Manage Tasks" or go to `/tasks` to:
   - Add new tasks with title and description
   - Mark tasks as complete/incomplete
   - Edit existing tasks
   - Delete tasks
3. **API Access**: Use the REST API endpoints to integrate with other applications