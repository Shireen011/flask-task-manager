// Task Manager Frontend JavaScript with Enhanced Greeting System

class TaskManager {
    constructor() {
        // Prevent multiple instances
        if (window.taskManagerInstance) {
            console.warn('TaskManager already exists, returning existing instance');
            return window.taskManagerInstance;
        }
        
        console.log('🚀 TaskManager initializing...');
        
        // Store tasks locally for privacy
        this.storageKey = 'taskManagerTasks';
        this.isSubmitting = false; // Prevent double submissions
        
        this.greetingMessages = {
            morning: [
                "Good morning, my sunshine ☀️",
                "Rise and shine, handsome 💛",
                "Another day, another reason I love you",
                "Hope your day starts with a smile 😊",
                "Good morning to the love of my life ❤️"
            ],
            afternoon: [
                "You mean everything to me 💕",
                "Loving you is my favorite thing",
                "You make my world complete 🌍",
                "Just thinking about you makes me smile 😊",
                "Forever grateful for you ❤️"
            ],
            encouraging: [
                "You've got this! 💪",
                "Go conquer the day, champ 🚀",
                "I believe in you, always 💖",
                "You are stronger than you think",
                "Today is yours — make it amazing ✨"
            ],
            playful: [
                "Hey cutie 😘",
                "Smile! Someone loves you 😄",
                "You + Me = ❤️",
                "Warning: You're too adorable 😍",
                "Just a daily dose of love 💌"
            ],
            evening: [
                "Hope your day was beautiful 💫",
                "Missing you a little extra today ❤️",
                "Counting days until I can see you again 🌙",
                "Nights feel incomplete without you here",
                "You're my favorite person always 💖",
                "Ending the day thinking of you 🌙"
            ],
            midnight: [
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
        };
        
        this.init();
        
        // Store instance reference
        window.taskManagerInstance = this;
    }

    init() {
        // Show greeting message on app load
        this.showGreeting();
        
        // Bind event listeners
        this.bindEvents();
        
        // Load tasks if on tasks page
        if (document.getElementById('tasks-container')) {
            this.loadTasks();
        }
    }
    
    showGreeting() {
        // Only show greeting once per session
        if (sessionStorage.getItem('greetingShown')) {
            return;
        }
        
        // Delay greeting to allow page to load
        setTimeout(() => {
            const greeting = this.getNextUnusedGreeting();
            this.displayGreeting(greeting);
            sessionStorage.setItem('greetingShown', 'true');
        }, 1500);
    }
    
    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        let messagePool = [];

        if (hour >= 0 && hour < 3) {  // Midnight to 3 AM
            messagePool = this.greetingMessages.midnight;
        } else if (hour < 12) {
            messagePool = this.greetingMessages.morning;
        } else if (hour < 17) {
            messagePool = [...this.greetingMessages.afternoon, ...this.greetingMessages.encouraging];
        } else if (hour < 21) {
            messagePool = [...this.greetingMessages.playful, ...this.greetingMessages.encouraging];
        } else {
            messagePool = this.greetingMessages.evening;
        }

        return messagePool[Math.floor(Math.random() * messagePool.length)];
    }
    
    getNextUnusedGreeting() {
        // Get a time-appropriate greeting
        return this.getTimeBasedGreeting();
    }
    
    getRandomGreeting() {
        // For manual "Daily Love Note" button - gets fresh time-based greeting
        return this.getTimeBasedGreeting();
    }
    
    displayGreeting(message) {
        // Create beautiful greeting modal with cute, lovely emojis
        const cuteEmojis = ['🌸', '💖', '🦋', '🌺', '💕', '🌟', '🎀', '💝', '🌷', '✨', 
                           '💐', '🍀', '🌈', '⭐', '💫', '🌻', '🧸', '💗', '🌙', '☀️',
                           '🥰', '😍', '😘', '💋', '🤗'];
        const randomEmoji = cuteEmojis[Math.floor(Math.random() * cuteEmojis.length)];
        
        const modalHtml = `
            <div class="modal fade" id="greetingModal" tabindex="-1" aria-labelledby="greetingModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
                        <div class="modal-body text-center p-5">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">${randomEmoji}</div>
                            <h4 class="mb-3" style="font-weight: 300;">${message}</h4>
                            <button type="button" class="btn btn-light btn-lg" data-bs-dismiss="modal" style="border-radius: 25px; padding: 0.75rem 2rem;">
                                Thank you ❤️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('greetingModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('greetingModal'));
        modal.show();
        
        // Clean up after modal is hidden
        document.getElementById('greetingModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    }

    bindEvents() {
        // Task form submission
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateTask();
            });
        }

        // Edit task form
        const editTaskForm = document.getElementById('edit-task-form');
        if (editTaskForm && !this.boundUpdateTask) {
            const saveBtn = document.getElementById('save-task-changes');
            if (saveBtn) {
                // Remove previous listener if exists
                if (this.boundUpdateTask) {
                    saveBtn.removeEventListener('click', this.boundUpdateTask);
                }
                this.boundUpdateTask = () => this.handleUpdateTask();
                saveBtn.addEventListener('click', this.boundUpdateTask);
            }
        }
    }

    loadTasksFromStorage() {
        try {
            const tasks = localStorage.getItem(this.storageKey);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
            return [];
        }
    }

    saveTasksToStorage(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    }

    loadTasks() {
        console.log('Loading tasks...');
        
        try {
            const tasks = this.loadTasksFromStorage();
            console.log('Tasks loaded from localStorage:', tasks);
            
            this.renderTasks(tasks);
            this.updateScreenVisibility(tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showError('Failed to load tasks. Please try again.');
        }
    }

    updateScreenVisibility(tasks) {
        const welcomeScreen = document.getElementById('welcome-screen');
        const taskManagement = document.getElementById('task-management');
        
        if (!welcomeScreen || !taskManagement) {
            console.error('Screen containers not found');
            return;
        }

        if (tasks && tasks.length > 0) {
            // Show task management interface
            welcomeScreen.classList.add('d-none');
            taskManagement.classList.remove('d-none');
        } else {
            // Show welcome screen
            taskManagement.classList.add('d-none');
            welcomeScreen.classList.remove('d-none');
        }
    }

    renderTasks(tasks) {
        console.log('Rendering tasks:', tasks);
        const container = document.getElementById('tasks-container');
        
        if (!container) {
            console.error('tasks-container not found');
            return;
        }

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>No tasks yet. Create your first task to get started!</p></div>';
            return;
        }

        container.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');
    }

    renderTaskItem(task) {
        const createdDate = new Date(task.created_at).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric' 
        });
        const completedClass = task.completed ? 'completed' : '';
        
        // Compact priority indicators
        const priorityIcons = { 'high': '🔴', 'medium': '🟡', 'low': '🟢' };
        const priority = task.priority || 'medium';
        
        return `
            <div class="task-item ${completedClass}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        <span>${priorityIcons[priority]}</span>
                        <span>Created ${createdDate}</span>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-sm ${task.completed ? 'btn-warning' : 'btn-success'}" 
                            onclick="window.taskManagerInstance.toggleComplete(${task.id}, ${!task.completed})"
                            title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                        ${task.completed ? '↩️' : '✅'}
                    </button>
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="window.taskManagerInstance.openEditModal(${task.id})"
                            title="Edit task">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="window.taskManagerInstance.confirmDelete(${task.id})"
                            title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    async handleCreateTask() {
        // Prevent double submission
        if (this.isSubmitting) {
            return;
        }
        
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority')?.value || 'medium';
        
        if (!title) {
            this.showError('Task title is required.');
            return;
        }

        // Set submitting flag and disable button
        this.isSubmitting = true;
        const submitButton = document.querySelector('#task-form button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
        }

        try {
            // Create task locally - private to this device
            const tasks = this.loadTasksFromStorage();
            const newTask = {
                id: this.getNextId(tasks),
                title,
                description,
                priority,
                completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            tasks.push(newTask);
            this.saveTasksToStorage(tasks);
            
            console.log('Task created successfully:', newTask);
            
            // Clear form
            document.getElementById('task-form').reset();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
            if (modal) {
                modal.hide();
            }
            
            // Reload tasks
            this.loadTasks();
            
        } catch (error) {
            console.error('Error creating task:', error);
            this.showError('Failed to create task. Please try again.');
        } finally {
            // Reset submitting state
            this.isSubmitting = false;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Add Task';
            }
        }
    }

    getNextId(tasks) {
        if (!tasks || tasks.length === 0) return 1;
        const maxId = Math.max(...tasks.map(task => task.id || 0));
        return maxId + 1;
    }

    async toggleComplete(taskId, completed) {
        try {
            const tasks = this.loadTasksFromStorage();
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex === -1) {
                this.showError('Task not found.');
                return;
            }
            
            tasks[taskIndex].completed = completed;
            tasks[taskIndex].updated_at = new Date().toISOString();
            
            this.saveTasksToStorage(tasks);
            this.loadTasks();
            
        } catch (error) {
            console.error('Error toggling task completion:', error);
            this.showError('Failed to update task.');
        }
    }

    openEditModal(taskId) {
        try {
            const tasks = this.loadTasksFromStorage();
            const task = tasks.find(task => task.id === taskId);
            
            if (!task) {
                this.showError('Task not found.');
                return;
            }
            
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskDescription').value = task.description || '';
            document.getElementById('editTaskCompleted').checked = task.completed;
            
            // Set professional fields
            const priorityField = document.getElementById('editTaskPriority');
            
            if (priorityField) {
                priorityField.value = task.priority || 'medium';
            }
            
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
        
        const taskId = parseInt(document.getElementById('editTaskId').value);
        const title = document.getElementById('editTaskTitle').value.trim();
        const description = document.getElementById('editTaskDescription').value.trim();
        const completed = document.getElementById('editTaskCompleted').checked;
        const priority = document.getElementById('editTaskPriority')?.value || 'medium';
        
        if (!title) {
            this.showError('Task title is required.');
            return;
        }

        // Set submitting flag and disable button
        this.isSubmitting = true;
        const saveButton = document.getElementById('save-task-changes');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        }

        try {
            const tasks = this.loadTasksFromStorage();
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex === -1) {
                this.showError('Task not found.');
                return;
            }
            
            // Update task with professional fields
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title,
                description,
                priority,
                completed,
                updated_at: new Date().toISOString()
            };
            
            this.saveTasksToStorage(tasks);
            
            console.log('Task updated successfully');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            if (modal) {
                modal.hide();
            }
            
            // Reload tasks
            this.loadTasks();
            
        } catch (error) {
            console.error('Error updating task:', error);
            this.showError('Failed to update task. Please try again.');
        } finally {
            // Reset submitting state
            this.isSubmitting = false;
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.innerHTML = 'Save Changes';
            }
        }
    }

    confirmDelete(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.deleteTask(taskId);
        }
    }

    async deleteTask(taskId) {
        try {
            const tasks = this.loadTasksFromStorage();
            const filteredTasks = tasks.filter(task => task.id !== taskId);
            
            this.saveTasksToStorage(filteredTasks);
            this.loadTasks();
            
            console.log('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showError('Failed to delete task.');
        }
    }

    showError(message) {
        // Simple error display
        const errorHtml = `
            <div class="alert alert-danger alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; max-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHtml);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                if (alert.textContent.includes(message)) {
                    alert.remove();
                }
            });
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize TaskManager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing TaskManager...');
    window.taskManager = new TaskManager();
});