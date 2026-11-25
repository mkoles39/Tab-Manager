class TodoManager {
    constructor() {
        this.todos = [];
        this.todoList = document.getElementById('todo-list');
        this.addTodoBtn = document.getElementById('add-todo-btn');
        this.newTodoInput = document.getElementById('new-todo-input');

        this.init();
    }

    async init() {
        await this.loadTodos();
        this.renderTodos();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.addTodoBtn && this.newTodoInput) {
            this.addTodoBtn.addEventListener('click', () => this.addTodo());
            this.newTodoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTodo();
            });
        }
    }

    async loadTodos() {
        const result = await chrome.storage.local.get('todos');
        this.todos = result.todos || [];
    }

    async saveTodos() {
        await chrome.storage.local.set({ todos: this.todos });
    }

    renderTodos() {
        if (!this.todoList) return;

        this.todoList.innerHTML = '';

        // Sort: Incomplete first, then completed
        const sortedTodos = [...this.todos].sort((a, b) => {
            if (a.completed === b.completed) return b.createdAt - a.createdAt;
            return a.completed ? 1 : -1;
        });

        sortedTodos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });
    }

    createTodoElement(todo) {
        const item = document.createElement('div');
        item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        item.dataset.id = todo.id;

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        // Text
        const text = document.createElement('span');
        text.className = 'todo-text';
        text.textContent = todo.text;

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-delete-btn';
        deleteBtn.innerHTML = uiIcon('trash');
        deleteBtn.title = 'Görevi Sil';
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        item.appendChild(checkbox);
        item.appendChild(text);
        item.appendChild(deleteBtn);

        return item;
    }

    async addTodo() {
        const text = this.newTodoInput.value.trim();
        if (!text) return;

        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: Date.now()
        };

        this.todos.unshift(newTodo);
        await this.saveTodos();
        this.renderTodos();

        this.newTodoInput.value = '';
        this.newTodoInput.focus();
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            await this.saveTodos();
            this.renderTodos();
        }
    }

    async deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        await this.saveTodos();
        this.renderTodos();
    }
}

// Export for use in newtab.js
window.TodoManager = TodoManager;
