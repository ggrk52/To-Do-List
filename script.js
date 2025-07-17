document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const filters = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const clearCompletedBtn = document.getElementById('clear-completed');

    const prioritySelect = document.getElementById('priority-select');
    const sortButtons = document.querySelectorAll('.sort-btn');
    const totalSpan = document.getElementById('total');
    const activeSpan = document.getElementById('active');
    const completedSpan = document.getElementById('completed');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let sortMode = 'date'; // 'date' или 'priority'

    // Устанавливаем темную тему по умолчанию
    document.body.classList.add('dark');

    // Инициализация
    renderTasks();
    updateCounters();
    updateFilterButtons();

    // Добавление задачи
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const priority = prioritySelect.value;
        if (text) {
            tasks.push({ text, completed: false, priority, date: new Date().toISOString() });
            taskInput.value = '';
            saveAndRender();
        }
    });

    // Обработчики событий
    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            tasks.splice(index, 1);
            saveAndRender();
        } else if (e.target.classList.contains('task-item')) {
            const index = e.target.dataset.index;
            tasks[index].completed = !tasks[index].completed;
            saveAndRender();
        }
    });

    // Редактирование задачи
    taskList.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('text')) {
            const index = e.target.parentElement.dataset.index;
            const newText = prompt('Изменить задачу:', tasks[index].text);
            if (newText !== null && newText.trim() !== '') {
                tasks[index].text = newText.trim();
                saveAndRender();
            }
        }
    });

    // Фильтрация
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            updateFilterButtons();
            renderTasks();
        });
    });

    // Сортировка
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sortMode = btn.dataset.sort;
            renderTasks();
        });
    });

    // Смена темы
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        themeToggle.textContent = 
            document.body.classList.contains('dark') ? '☀️' : '🌙';
    });

    // Очистка выполненных
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.completed);
        saveAndRender();
    });

    // Вспомогательные функции
    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateCounters();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const filtered = tasks.filter(task => 
            currentFilter === 'all' ? true :
            currentFilter === 'active' ? !task.completed :
            task.completed
        );

        const sorted = [...filtered].sort((a, b) => {
            if (sortMode === 'priority') {
                const priorityValue = { high: 3, medium: 2, low: 1 };
                return priorityValue[b.priority] - priorityValue[a.priority];
            }
            return new Date(b.date) - new Date(a.date);
        });

        sorted.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.index = index;
            li.innerHTML = `
                <span class="text">${task.text}</span>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <button class="delete-btn" data-index="${index}">🗑</button>
            `;
            taskList.appendChild(li);
        });
    }

    function updateCounters() {
        totalSpan.textContent = tasks.length;
        activeSpan.textContent = tasks.filter(t => !t.completed).length;
        completedSpan.textContent = tasks.filter(t => t.completed).length;
    }

    function updateFilterButtons() {
        filters.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });
    }
});