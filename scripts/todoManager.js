const TodoManager = {
  todos: [],
  async load() { this.todos = await StorageManager.get('todos', []); return this.todos; },
  save() { return StorageManager.set('todos', this.todos); },
  add(text) {
    this.todos.unshift({ id: Utils.uuid(), text, done: false, createdAt: Date.now() });
    return this.save();
  },
  toggle(id) {
    const t = this.todos.find(x => x.id === id);
    if (t) t.done = !t.done;
    return this.save();
  },
  remove(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    return this.save();
  }
};
