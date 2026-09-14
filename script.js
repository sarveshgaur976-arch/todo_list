const STORAGE_KEY = 'todo-list-items';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const clearCompletedButton = document.getElementById('clear-completed');

let todos = loadTodos();

function loadTodos() {
  const savedTodos = localStorage.getItem(STORAGE_KEY);

  if (!savedTodos) {
    return [
      { id: crypto.randomUUID(), text: 'Review weekly goals', completed: false },
      { id: crypto.randomUUID(), text: 'Send status update', completed: true },
      { id: crypto.randomUUID(), text: 'Plan tomorrow tasks', completed: false }
    ];
  }

  try {
    return JSON.parse(savedTodos);
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos() {
  if (!todos.length) {
    todoList.innerHTML = '<li class="empty-state">No tasks yet. Add one above.</li>';
    todoCount.textContent = '0 tasks left';
    return;
  }

  todoList.innerHTML = todos
    .map(
      (todo) => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <input
            class="checkbox"
            type="checkbox"
            ${todo.completed ? 'checked' : ''}
            aria-label="Mark ${todo.text} as complete"
          />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <button class="delete-btn" type="button" aria-label="Delete ${todo.text}">Delete</button>
        </li>
      `
    )
    .join('');

  const remaining = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `${remaining} task${remaining === 1 ? '' : 's'} left`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();

  if (!text) {
    todoInput.focus();
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false
  });

  todoInput.value = '';
  saveTodos();
  renderTodos();
});

todoList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-btn');

  if (deleteButton) {
    const item = deleteButton.closest('.todo-item');
    if (!item) return;

    todos = todos.filter((todo) => todo.id !== item.dataset.id);
    saveTodos();
    renderTodos();
    return;
  }
});

todoList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.checkbox');

  if (!checkbox) return;

  const item = checkbox.closest('.todo-item');
  if (!item) return;

  const todo = todos.find((entry) => entry.id === item.dataset.id);
  if (!todo) return;

  todo.completed = checkbox.checked;
  saveTodos();
  renderTodos();
});

clearCompletedButton.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

renderTodos();
