// TaskFlow - Ultra Modern Task Management System
// Advanced JavaScript with Modern Animations and Interactions

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TaskFlow Ultra Modern UI Loading...');
    
    // Initialize Feather Icons with enhanced styling
    if (typeof feather !== 'undefined') {
        feather.replace();
        console.log('✨ Feather icons loaded');
    }
    
    // Initialize greeting system
    displayRomanticGreeting();
    
    // Load tasks with modern animations
    loadTasks();
    
    // Add modern scroll effects
    addScrollEffects();
    
    // Initialize floating action button animations
    initializeFloatingButtons();
    
    console.log('🎨 TaskFlow Ultra Modern UI Ready!');
});

// Ultra Modern Task Rendering System
function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!taskList || !emptyState) return;
    
    if (!tasks || tasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.style.display = 'block';
        emptyState.classList.add('animate-fade-in-up');
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Create ultra-modern task cards
    taskList.innerHTML = tasks.map((task, index) => `
        <div class="task-item animate-fade-in-up" style="animation-delay: ${index * 0.1}s" data-task-id="${task.id}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h5 class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</h5>
                    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                    <small class="task-meta">
                        Created ${formatDate(task.created_at)}
                        ${task.completed ? ' • ✅ Completed' : ''}
                    </small>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-success" onclick="toggleTask(${task.id}, ${!task.completed})" 
                            title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
                        <i data-feather="${task.completed ? 'rotate-ccw' : 'check'}"></i>
                    </button>
                    <button class="btn-icon btn-primary" onclick="editTask(${task.id})" title="Edit task">
                        <i data-feather="edit-2"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteTask(${task.id})" title="Delete task">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Reinitialize Feather icons for new content
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Add hover effects to new task items
    addTaskHoverEffects();
}

// Modern Task Hover Effects
function addTaskHoverEffects() {
    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px) scale(1.01)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });
}

// Enhanced Add Task with Modern Animations
async function addTask() {
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    
    if (!titleInput || !descriptionInput) return;
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!title) {
        showModernToast('Please enter a task title', 'warning');
        titleInput.focus();
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        description: description,
        completed: false,
        created_at: new Date().toISOString()
    };
    
    try {
        // Add task with loading animation
        showModernToast('Creating task...', 'info');
        
        const tasks = getTasksFromStorage();
        tasks.push(task);
        saveTasksToStorage(tasks);
        
        // Clear form and close modal
        titleInput.value = '';
        descriptionInput.value = '';
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
        if (modal) modal.hide();
        
        // Reload tasks with animation
        await loadTasks();
        
        showModernToast(`✨ Task "${title}" created successfully!`, 'success');
        
    } catch (error) {
        console.error('Error adding task:', error);
        showModernToast('Failed to create task. Please try again.', 'error');
    }
}

// Enhanced Edit Task with Modern UI
function editTask(taskId) {
    const tasks = getTasksFromStorage();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        showModernToast('Task not found', 'error');
        return;
    }
    
    // Populate edit form
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description || '';
    
    // Show edit modal with animation
    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
    
    // Focus on title input
    setTimeout(() => {
        document.getElementById('edit-task-title').focus();
    }, 300);
}

// Enhanced Update Task with Modern Feedback
async function updateTask() {
    const taskId = parseInt(document.getElementById('edit-task-id').value);
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    
    if (!title) {
        showModernToast('Please enter a task title', 'warning');
        return;
    }
    
    try {
        const tasks = getTasksFromStorage();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            showModernToast('Task not found', 'error');
            return;
        }
        
        // Update task
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title: title,
            description: description,
            updated_at: new Date().toISOString()
        };
        
        saveTasksToStorage(tasks);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
        if (modal) modal.hide();
        
        // Reload tasks
        await loadTasks();
        
        showModernToast(`✨ Task "${title}" updated successfully!`, 'success');
        
    } catch (error) {
        console.error('Error updating task:', error);
        showModernToast('Failed to update task. Please try again.', 'error');
    }
}

// Enhanced Delete Task with Modern Confirmation
function deleteTask(taskId) {
    const tasks = getTasksFromStorage();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        showModernToast('Task not found', 'error');
        return;
    }
    
    // Set task ID for confirmation
    document.getElementById('delete-task-id').value = taskId;
    
    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    modal.show();
}

// Confirm Delete with Modern Animation
async function confirmDelete() {
    const taskId = parseInt(document.getElementById('delete-task-id').value);
    
    try {
        const tasks = getTasksFromStorage();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            showModernToast('Task not found', 'error');
            return;
        }
        
        const taskTitle = tasks[taskIndex].title;
        
        // Remove task with animation
        tasks.splice(taskIndex, 1);
        saveTasksToStorage(tasks);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        if (modal) modal.hide();
        
        // Reload tasks
        await loadTasks();
        
        showModernToast(`🗑️ Task "${taskTitle}" deleted`, 'success');
        
    } catch (error) {
        console.error('Error deleting task:', error);
        showModernToast('Failed to delete task. Please try again.', 'error');
    }
}

// Enhanced Toggle Task with Modern Animation
async function toggleTask(taskId, completed) {
    try {
        const tasks = getTasksFromStorage();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            showModernToast('Task not found', 'error');
            return;
        }
        
        // Update completion status
        tasks[taskIndex].completed = completed;
        tasks[taskIndex].completed_at = completed ? new Date().toISOString() : null;
        
        saveTasksToStorage(tasks);
        
        // Reload tasks with animation
        await loadTasks();
        
        const action = completed ? 'completed' : 'reopened';
        const icon = completed ? '✅' : '🔄';
        showModernToast(`${icon} Task ${action}!`, 'success');
        
    } catch (error) {
        console.error('Error toggling task:', error);
        showModernToast('Failed to update task. Please try again.', 'error');
    }
}

// Modern Toast Notification System
function showModernToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.modern-toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `modern-toast modern-toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                <i data-feather="x"></i>
            </button>
        </div>
    `;
    
    // Add toast styles
    Object.assign(toast.style, {
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        background: 'var(--glass-white)',
        backdropFilter: 'var(--blur-lg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4)',
        color: 'var(--white)',
        boxShadow: 'var(--shadow-2xl)',
        zIndex: '10000',
        minWidth: '300px',
        transform: 'translateY(-100px)',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Replace feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.transform = 'translateY(-100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Modern Scroll Effects
function addScrollEffects() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const direction = currentScrollY > lastScrollY ? 'down' : 'up';
        
        // Add parallax effect to header
        const header = document.querySelector('.header');
        if (header) {
            const scrolled = currentScrollY * 0.5;
            header.style.transform = `translateY(${scrolled}px)`;
        }
        
        // Add floating animation to action button
        const floatingButton = document.querySelector('.floating-action-zone');
        if (floatingButton) {
            if (direction === 'down' && currentScrollY > 100) {
                floatingButton.style.transform = 'translateY(100px)';
                floatingButton.style.opacity = '0';
            } else {
                floatingButton.style.transform = 'translateY(0)';
                floatingButton.style.opacity = '1';
            }
        }
        
        lastScrollY = currentScrollY;
    });
}

// Initialize Floating Button Animations
function initializeFloatingButtons() {
    document.querySelectorAll('.btn-floating').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.95)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
    });
}

// Enhanced Load Tasks with Modern Animation
async function loadTasks() {
    try {
        const tasks = getTasksFromStorage();
        
        // Add loading animation
        const taskList = document.getElementById('task-list');
        if (taskList) {
            taskList.style.opacity = '0';
            taskList.style.transform = 'translateY(20px)';
        }
        
        // Simulate loading delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 150));
        
        renderTasks(tasks);
        
        // Animate in
        if (taskList) {
            taskList.style.transition = 'all 0.3s ease-out';
            taskList.style.opacity = '1';
            taskList.style.transform = 'translateY(0)';
        }
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        showModernToast('Failed to load tasks', 'error');
    }
}

// Romantic Greeting System (Enhanced with Modern Styling)
function displayRomanticGreeting() {
    const greetingDisplay = document.getElementById('greeting-display');
    if (!greetingDisplay) return;
    
    const now = new Date();
    const hour = now.getHours();
    
    let greeting, emoji;
    
    if (hour < 6) {
        greeting = "Sweet dreams, my love 💤 Working late?";
        emoji = "🌙";
    } else if (hour < 12) {
        greeting = "Good morning, beautiful! ☀️ Ready to conquer today?";
        emoji = "🌅";
    } else if (hour < 17) {
        greeting = "Good afternoon, sunshine! 🌞 Hope your day is amazing!";
        emoji = "☀️";
    } else if (hour < 21) {
        greeting = "Good evening, gorgeous! 🌆 Time to unwind?";
        emoji = "🌇";
    } else {
        greeting = "Good night, my heart! 💖 Sweet dreams await!";
        emoji = "⭐";
    }
    
    greetingDisplay.innerHTML = `
        <div class="romantic-greeting animate-fade-in-up" style="
            background: var(--glass-white);
            backdrop-filter: var(--blur-md);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-xl);
            padding: var(--space-4);
            margin-bottom: var(--space-4);
            text-align: center;
            color: var(--white);
        ">
            <span style="font-size: 2rem; margin-right: var(--space-2);">${emoji}</span>
            <span style="font-weight: 500;">${greeting}</span>
        </div>
    `;
}

// Storage Management (Enhanced)
function getTasksFromStorage() {
    try {
        const tasks = localStorage.getItem('taskflow_tasks');
        return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
        console.error('Error reading from storage:', error);
        return [];
    }
}

function saveTasksToStorage(tasks) {
    try {
        localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving to storage:', error);
        showModernToast('Failed to save tasks to storage', 'error');
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Form Enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced form submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTask();
        });
    }
    
    // Enhanced edit form submission
    const editForm = document.getElementById('edit-task-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateTask();
        });
    }
    
    // Add modern focus effects to inputs
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});

console.log('🎨 TaskFlow Ultra Modern JavaScript Loaded Successfully!');