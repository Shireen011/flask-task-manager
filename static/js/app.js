// Task Manager Frontend JavaScript

// PWA Installation
let deferredPrompt;
let installButton;

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

function showInstallButton() {
    // Create install button if it doesn't exist
    if (!document.getElementById('install-app')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-app';
        installBtn.className = 'btn btn-success position-fixed bottom-0 end-0 m-3';
        installBtn.innerHTML = '📱 Install App';
        installBtn.style.zIndex = '1050';
        installBtn.onclick = installPWA;
        document.body.appendChild(installBtn);
        installButton = installBtn;
    }
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                if (installButton) {
                    installButton.remove();
                }
            }
            deferredPrompt = null;
        });
    }
}

class TaskManager {
    constructor() {
        this.apiUrl = '/api/tasks';
        this.isSubmitting = false; // Prevent double submissions
        this.init();
    }

    init() {
        // Bind event listeners
        this.bindEvents();
        
        // Load tasks if on tasks page
        if (document.getElementById('tasks-container')) {
            this.loadTasks();
        }
    }

    bindEvents() {
        // Add task form
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            // Remove existing listeners to prevent duplicates
            taskForm.removeEventListener('submit', this.boundAddTask);
            this.boundAddTask = (e) => this.handleAddTask(e);
            taskForm.addEventListener('submit', this.boundAddTask);
        }

        // Edit task form
        const editForm = document.getElementById('edit-task-form');
        if (editForm) {
            const saveBtn = document.getElementById('save-task-changes');
            if (saveBtn) {
                // Remove existing listeners to prevent duplicates
                saveBtn.removeEventListener('click', this.boundUpdateTask);
                this.boundUpdateTask = () => this.handleUpdateTask();
                saveBtn.addEventListener('click', this.boundUpdateTask);
            }
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-tasks');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTasks());
        }
    }

    async loadTasks() {
        this.showLoading(true);
        
        try {
            const response = await fetch(this.apiUrl);
            const tasks = await response.json();
            
            this.renderTasks(tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showError('Failed to load tasks. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    renderTasks(tasks) {
        const container = document.getElementById('tasks-container');
        const noTasksMsg = document.getElementById('no-tasks');
        
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = '';
            noTasksMsg.classList.remove('d-none');
            return;
        }

        noTasksMsg.classList.add('d-none');
        
        container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        
        // Bind task-specific event listeners
        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        const createdDate = new Date(task.created_at).toLocaleDateString();
        const completedClass = task.completed ? 'completed' : '';
        
        return `
            <div class="task-item ${completedClass}" data-task-id="${task.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="task-title">${this.escapeHtml(task.title)}</h6>
                        ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                        <small class="task-meta">Created: ${createdDate}</small>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-sm ${task.completed ? 'btn-outline-warning' : 'btn-outline-success'}" 
                                onclick="taskManager.toggleComplete(${task.id}, ${!task.completed})">
                            ${task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="taskManager.openEditModal(${task.id})">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="taskManager.deleteTask(${task.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindTaskEvents() {
        // Events are bound inline in the HTML for simplicity
        // In a larger app, you'd want to use event delegation
    }

    async handleAddTask(e) {
        e.preventDefault();
        
        // Prevent double submission using class flag
        if (this.isSubmitting) {
            return;
        }
        
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        
        if (!title) {
            this.showError('Task title is required.');
            return;
        }

        // Set submitting flag and disable button
        this.isSubmitting = true;
        const submitButton = document.querySelector('#task-form button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Adding...';
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                document.getElementById('task-form').reset();
                this.loadTasks();
                this.showSuccess('Task added successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to add task.');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            this.showError('Failed to add task. Please try again.');
        } finally {
            // Reset submitting flag and re-enable button
            this.isSubmitting = false;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Add Task';
            }
        }
    }

    async toggleComplete(taskId, completed) {
        try {
            const response = await fetch(`${this.apiUrl}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed })
            });

            if (response.ok) {
                this.loadTasks();
                this.showSuccess(`Task ${completed ? 'completed' : 'reopened'}!`);
            } else {
                this.showError('Failed to update task.');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            this.showError('Failed to update task. Please try again.');
        }
    }

    async openEditModal(taskId) {
        try {
            const response = await fetch(`${this.apiUrl}/${taskId}`);
            const task = await response.json();
            
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskDescription').value = task.description || '';
            document.getElementById('editTaskCompleted').checked = task.completed;
            
            const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading task:', error);
            this.showError('Failed to load task details.');
        }
    }

    async handleUpdateTask() {
        // Prevent double submission
        if (this.isSubmitting) {
            return;
        }
        
        const taskId = document.getElementById('editTaskId').value;
        const title = document.getElementById('editTaskTitle').value.trim();
        const description = document.getElementById('editTaskDescription').value.trim();
        const completed = document.getElementById('editTaskCompleted').checked;
        
        if (!title) {
            this.showError('Task title is required.');
            return;
        }

        // Set submitting flag and disable button
        this.isSubmitting = true;
        const saveButton = document.getElementById('save-task-changes');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = 'Saving...';
        }

        try {
            const response = await fetch(`${this.apiUrl}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, completed })
            });

            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
                modal.hide();
                this.loadTasks();
                this.showSuccess('Task updated successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to update task.');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            this.showError('Failed to update task. Please try again.');
        } finally {
            // Reset submitting flag and re-enable button
            this.isSubmitting = false;
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.innerHTML = 'Save Changes';
            }
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.loadTasks();
                this.showSuccess('Task deleted successfully!');
            } else {
                this.showError('Failed to delete task.');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showError('Failed to delete task. Please try again.');
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('d-none', !show);
        }
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        
        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of main container
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(alertDiv, main.firstChild);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});