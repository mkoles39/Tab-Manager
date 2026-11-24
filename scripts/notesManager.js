const NotesManager = {
  notes: [],
  async load() { this.notes = await StorageManager.get('notes', []); return this.notes; },
  save() { return StorageManager.set('notes', this.notes); },
  add() {
    const n = { id: Utils.uuid(), title: '', content: '', updatedAt: Date.now() };
    this.notes.unshift(n);
    return this.save().then(() => n);
  },
  update(id, patch) {
    const n = this.notes.find(x => x.id === id);
    if (n) Object.assign(n, patch, { updatedAt: Date.now() });
    return this.save();
  },
  remove(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    return this.save();
  }
};
