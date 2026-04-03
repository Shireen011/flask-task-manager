// Mobile Task Manager Application
class MobileTaskManager {
    constructor() {
        this.apiUrl = 'http://192.168.1.7:5000/api/tasks'; // Your local Flask server
        this.tasks = [];
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        document.addEventListener('deviceready', () => {
            console.log('Device ready');
            this.bindEvents();
            this.loadTasks();
        });

        // Fallback for browser testing
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.bindEvents();
            this.loadTasks();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                this.bindEvents();
                this.loadTasks();
            });
        }
    }

    bindEvents() {
        // Network status
        document.addEventListener('online', () => {
            this.isOnline = true;
            this.syncData();
        });

        document.addEventListener('offline', () => {
            this.isOnline = false;
            this.showAlert('You are offline. Changes will sync when connected.', 'warning');
        });

        // Back button handling
        document.addEventListener('backbutton', (e) => {
            e.preventDefault();
            const currentPage = document.querySelector('.page.active').id;
            if (currentPage === 'home-page') {
                navigator.app.exitApp();
            } else {
                this.showPage('home');
            }
        });

        // Form submissions
        const addForm = document.getElementById('add-task-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTask();
            });
        }

        const editForm = document.getElementById('edit-task-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateTask();
            });
        }
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId + '-page');
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navbar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[href="#${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load tasks if switching to tasks page
        if (pageId === 'tasks') {
            this.loadTasks();
        }
    }

    async loadTasks() {
        this.showLoading(true);

        try {
            // Try to load from server if online
            if (this.isOnline) {
                const response = await fetch(this.apiUrl);
                if (response.ok) {
                    this.tasks = await response.json();
                    this.saveToStorage('tasks', this.tasks);
                } else {
                    throw new Error('Server error');
                }
            } else {
                // Load from local storage if offline
                const stored = this.getFromStorage('tasks');
                this.tasks = stored || [];
            }

            this.renderTasks();
            this.updateStats();
        } catch (error) {
            console.error('Error loading tasks:', error);
            
            // Fallback to local storage
            const stored = this.getFromStorage('tasks');
            this.tasks = stored || [];
            this.renderTasks();
            this.updateStats();
            
            if (this.isOnline) {
                this.showAlert('Failed to load from server. Showing offline data.', 'warning');
            }
        } finally {
            this.showLoading(false);
        }
    }

    renderTasks() {
        const container = document.getElementById('tasks-container');
        const noTasksMsg = document.getElementById('no-tasks');

        if (!container) return;

        if (this.tasks.length === 0) {
            container.innerHTML = '';
            noTasksMsg.classList.remove('d-none');
            return;
        }

        noTasksMsg.classList.add('d-none');
        container.innerHTML = this.tasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const createdDate = new Date(task.created_at).toLocaleDateString();
        const completedClass = task.completed ? 'completed' : '';
        const statusClass = task.completed ? 'completed' : 'pending';
        const statusText = task.completed ? 'Done' : 'Pending';

        return `
            <div class="task-item ${completedClass}" data-task-id="${task.id}">
                <div class="task-header">
                    <h6 class="task-title">${this.escapeHtml(task.title)}</h6>
                    <span class="task-status ${statusClass}">${statusText}</span>
                </div>
                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">Created: ${createdDate}</div>
                <div class="task-actions">
                    <button class="btn ${task.completed ? 'btn-warning' : 'btn-success'}" 
                            onclick="mobileApp.toggleComplete(${task.id}, ${!task.completed})">
                        ${task.completed ? '↶ Undo' : '✓ Done'}
                    </button>
                    <button class="btn btn-primary" 
                            onclick="mobileApp.openEditModal(${task.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" 
                            onclick="mobileApp.deleteTask(${task.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;
    }

    showAddTaskModal() {
        const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
        modal.show();
    }

    async addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();

        if (!title) {
            this.showAlert('Task title is required.', 'danger');
            return;
        }

        const task = {
            id: this.getNextId(),
            title,
            description,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            if (this.isOnline) {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });

                if (response.ok) {
                    const serverTask = await response.json();
                    this.tasks.push(serverTask);
                } else {
                    throw new Error('Server error');
                }
            } else {
                // Add to local storage if offline
                task._offline = true; // Mark for later sync
                this.tasks.push(task);
            }

            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
            modal.hide();
            document.getElementById('add-task-form').reset();

            this.showAlert('Task added successfully!', 'success');
        } catch (error) {
            console.error('Error adding task:', error);
            
            // Add locally if server fails
            task._offline = true;
            this.tasks.push(task);
            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
            modal.hide();
            document.getElementById('add-task-form').reset();

            this.showAlert('Task saved offline. Will sync when connected.', 'warning');
        }
    }

    async toggleComplete(taskId, completed) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        this.tasks[taskIndex].completed = completed;
        this.tasks[taskIndex].updated_at = new Date().toISOString();

        try {
            if (this.isOnline) {
                const response = await fetch(`${this.apiUrl}/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed })
                });

                if (!response.ok) {
                    throw new Error('Server error');
                }
            } else {
                this.tasks[taskIndex]._offline = true;
            }

            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            this.showAlert(`Task ${completed ? 'completed' : 'reopened'}!`, 'success');
        } catch (error) {
            console.error('Error updating task:', error);
            
            // Save locally
            this.tasks[taskIndex]._offline = true;
            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            this.showAlert('Change saved offline. Will sync when connected.', 'warning');
        }
    }

    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskCompleted').checked = task.completed;

        const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        modal.show();
    }

    async updateTask() {
        const taskId = parseInt(document.getElementById('editTaskId').value);
        const title = document.getElementById('editTaskTitle').value.trim();
        const description = document.getElementById('editTaskDescription').value.trim();
        const completed = document.getElementById('editTaskCompleted').checked;

        if (!title) {
            this.showAlert('Task title is required.', 'danger');
            return;
        }

        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        this.tasks[taskIndex].title = title;
        this.tasks[taskIndex].description = description;
        this.tasks[taskIndex].completed = completed;
        this.tasks[taskIndex].updated_at = new Date().toISOString();

        try {
            if (this.isOnline) {
                const response = await fetch(`${this.apiUrl}/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description, completed })
                });

                if (!response.ok) {
                    throw new Error('Server error');
                }
            } else {
                this.tasks[taskIndex]._offline = true;
            }

            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            modal.hide();

            this.showAlert('Task updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating task:', error);
            
            this.tasks[taskIndex]._offline = true;
            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            modal.hide();

            this.showAlert('Changes saved offline. Will sync when connected.', 'warning');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        try {
            if (this.isOnline) {
                const response = await fetch(`${this.apiUrl}/${taskId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Server error');
                }
            }

            this.tasks.splice(taskIndex, 1);
            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            this.showAlert('Task deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting task:', error);
            
            // Mark for deletion when online
            this.tasks[taskIndex]._deleted = true;
            this.saveToStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateStats();

            this.showAlert('Task marked for deletion. Will sync when connected.', 'warning');
        }
    }

    async syncData() {
        if (!this.isOnline) return;

        try {
            // Sync offline changes
            const offlineTasks = this.tasks.filter(task => task._offline);
            
            for (const task of offlineTasks) {
                if (task._deleted) {
                    await fetch(`${this.apiUrl}/${task.id}`, { method: 'DELETE' });
                    continue;
                }

                if (task.id < 0) {
                    // New task created offline
                    const response = await fetch(this.apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(task)
                    });
                    
                    if (response.ok) {
                        const serverTask = await response.json();
                        const index = this.tasks.findIndex(t => t.id === task.id);
                        this.tasks[index] = serverTask;
                    }
                } else {
                    // Updated task
                    await fetch(`${this.apiUrl}/${task.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: task.title,
                            description: task.description,
                            completed: task.completed
                        })
                    });
                    
                    delete task._offline;
                }
            }

            // Remove deleted tasks
            this.tasks = this.tasks.filter(task => !task._deleted);
            
            this.saveToStorage('tasks', this.tasks);
            this.showAlert('Data synced successfully!', 'success');
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    getNextId() {
        // Use negative IDs for offline tasks
        const offlineIds = this.tasks
            .filter(task => task.id < 0)
            .map(task => task.id);
        
        return offlineIds.length === 0 ? -1 : Math.min(...offlineIds) - 1;
    }

    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    getFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('d-none', !show);
        }
    }

    showAlert(message, type) {
        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.insertBefore(alertDiv, document.body.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
function showPage(pageId) {
    window.mobileApp.showPage(pageId);
}

function showAddTaskModal() {
    window.mobileApp.showAddTaskModal();
}

function addTask() {
    window.mobileApp.addTask();
}

function updateTask() {
    window.mobileApp.updateTask();
}

// Initialize app
window.mobileApp = new MobileTaskManager();