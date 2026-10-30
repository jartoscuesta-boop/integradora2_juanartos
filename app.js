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