// ==========================================
// CONFIGURACIÓN Y ESTADO INICIAL
// ==========================================
const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=8';
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let currentSort = 'date-desc';

// Elementos del DOM
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskPrioritySelect = document.getElementById('task-priority');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const filterBtns = document.querySelectorAll('.filter-btn');

// Métricas DOM
const metricTotal = document.getElementById('metric-total');
const metricPending = document.getElementById('metric-pending');
const metricCompleted = document.getElementById('metric-completed');
const toastContainer = document.getElementById('toast-container');

// ==========================================
// SISTEMA DE NOTIFICACIONES TOAST
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
// ==========================================
// PERSISTENCIA Y API REST
// ==========================================
async function initApp() {
    const localData = localStorage.getItem('tasks');

    if (localData) {
        tasks = JSON.parse(localData);
        dispatchTasksChanged();
        showToast('Tareas cargadas desde el almacenamiento local.', 'success');
    } else {
        await fetchApiTasks();
    }
}

async function fetchApiTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al conectar con la API REST');

        const apiData = await response.json();
        
        // Mapear datos de JSONPlaceholder a nuestra estructura con prioridades y fechas
        tasks = apiData.map(item => ({
            id: 'api-' + item.id,
            title: item.title,
            completed: item.completed,
            priority: ['Alta', 'Media', 'Baja'][Math.floor(Math.random() * 3)],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString()
        }));

        saveToLocalStorageWithoutDispatch();
        dispatchTasksChanged();
        showToast('Tareas sincronizadas desde JSONPlaceholder con éxito.', 'success');
    } catch (error) {
        console.error(error);
        showToast('Fallo de red al consultar la API. Trabajando en modo local.', 'error');
        tasks = [];
        dispatchTasksChanged();
    }
}

function saveToLocalStorageWithoutDispatch() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
// ==========================================
// PATRÓN OBSERVER / CUSTOM EVENTS (Opción B)
// ==========================================
function dispatchTasksChanged() {
    saveToLocalStorageWithoutDispatch();
    const event = new CustomEvent('tasksChanged', {
        detail: { tasks: tasks }
    });
    document.dispatchEvent(event);
}

// Escuchador centralizado del evento personalizado para re-renderizado automático
document.addEventListener('tasksChanged', (e) => {
    const currentTasks = e.detail.tasks;
    updateDashboard(currentTasks);
    renderTasks(currentTasks);
});
// ==========================================
// GESTIÓN DE CRUD Y EVENTOS DEL DOM
// ==========================================
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const priority = taskPrioritySelect.value;
    const id = taskIdInput.value;

    // Validación estricta de campos vacíos desde JS
    if (!title) {
        showToast('Por favor, ingresa el título de la tarea.', 'error');
        taskTitleInput.focus();
        return;
    }

    if (id) {
        // Editar tarea existente
        tasks = tasks.map(task => 
            task.id === id ? { ...task, title, priority } : task
        );
        showToast('¡Tarea actualizada correctamente!');
        resetForm();
    } else {
        // Crear nueva tarea
        const newTask = {
            id: 'task-' + Date.now(),
            title,
            completed: false,
            priority,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
        showToast('¡Tarea creada con éxito!');
        taskForm.reset();
    }

    dispatchTasksChanged();
});

// Funciones globales accesibles para las tarjetas de tareas
window.toggleTask = function(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    dispatchTasksChanged();
};

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskPrioritySelect.value = task.priority;
        btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
        btnCancel.style.display = 'inline-flex';
        taskTitleInput.focus();
    }
};

window.deleteTask = function(id) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        tasks = tasks.filter(task => task.id !== id);
        showToast('Tarea eliminada.');
        dispatchTasksChanged();
    }
};

btnCancel.addEventListener('click', () => {
    resetForm();
});

function resetForm() {
    taskIdInput.value = '';
    taskForm.reset();
    btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar Tarea';
    btnCancel.style.display = 'none';
}
// ==========================================
// FILTROS, BÚSQUEDA Y ORDENAMIENTO
// ==========================================
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    dispatchTasksChanged();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        dispatchTasksChanged();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    dispatchTasksChanged();
});

// ==========================================
// RENDERIZADO Y MÉTRICAS (DASHBOARD)
// ==========================================
function updateDashboard(currentTasks) {
    const total = currentTasks.length;
    const completed = currentTasks.filter(t => t.completed).length;
    const pending = total - completed;

    metricTotal.textContent = total;
    metricPending.textContent = pending;
    metricCompleted.textContent = completed;
}

function renderTasks(currentTasks) {
    // 1. Filtrar por Estado
    let processedTasks = currentTasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    // 2. Búsqueda dinámica en tiempo real (filter, includes, toLowerCase)
    if (searchQuery) {
        processedTasks = processedTasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery)
        );
    }

    // 3. Ordenamiento (sort con funciones comparadoras)
    const priorityWeight = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
    processedTasks.sort((a, b) => {
        if (currentSort === 'date-desc') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (currentSort === 'date-asc') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (currentSort === 'priority') {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return 0;
    });

    // 4. Renderizar tarjetas en el DOM
    tasksContainer.innerHTML = '';

    if (processedTasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    processedTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority.toLowerCase()} ${task.completed ? 'completed' : ''}`;
        
        const dateFormatted = new Date(task.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div class="task-info">
                <div>
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>
                    <div class="task-meta">
                        <span><i class="fa-solid fa-flag"></i> ${task.priority}</span> &bull; 
                        <span><i class="fa-regular fa-clock"></i> ${dateFormatted}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn check" onclick="toggleTask('${task.id}')" title="${task.completed ? 'Marcar pendiente' : 'Completar'}">
                    <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                </button>
                <button class="action-btn edit" onclick="editTask('${task.id}')" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn delete" onclick="deleteTask('${task.id}')" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        tasksContainer.appendChild(card);
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});