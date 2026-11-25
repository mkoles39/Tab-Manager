class NotesManager {
    constructor() {
        this.notes = [];
        this.notesGrid = document.getElementById('notes-grid');
        this.addNoteBtn = document.getElementById('add-note-btn');

        this.init();
    }

    async init() {
        await this.loadNotes();
        this.renderNotes();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.addNoteBtn) {
            this.addNoteBtn.addEventListener('click', () => this.addNote());
        }
    }

    async loadNotes() {
        const result = await chrome.storage.local.get('notes');
        this.notes = result.notes || [];
    }

    async saveNotes() {
        await chrome.storage.local.set({ notes: this.notes });
    }

    renderNotes() {
        if (!this.notesGrid) return;

        this.notesGrid.innerHTML = '';

        // Sort notes by updated date (newest first)
        const sortedNotes = [...this.notes].sort((a, b) => b.updatedAt - a.updatedAt);

        sortedNotes.forEach(note => {
            const noteCard = this.createNoteElement(note);
            this.notesGrid.appendChild(noteCard);
        });
    }

    createNoteElement(note) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.dataset.id = note.id;

        // Note Content (Textarea)
        const textarea = document.createElement('textarea');
        textarea.className = 'note-content';
        textarea.value = note.content;
        textarea.placeholder = 'Notunuzu buraya yazın...';

        // Auto-save on input
        textarea.addEventListener('input', () => {
            this.updateNote(note.id, textarea.value);
        });

        // Footer (Date and Delete)
        const footer = document.createElement('div');
        footer.className = 'note-footer';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = new Date(note.updatedAt).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note-delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Notu Sil';

        deleteBtn.addEventListener('click', async () => {
            if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
                await this.deleteNote(note.id);
            }
        });

        footer.appendChild(dateSpan);
        footer.appendChild(deleteBtn);

        card.appendChild(textarea);
        card.appendChild(footer);

        return card;
    }

    async addNote(content = '') {
        const newNote = {
            id: Date.now().toString(),
            content: content,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.notes.unshift(newNote); // Add to beginning
        await this.saveNotes();
        this.renderNotes();
    }

    async updateNote(id, content) {
        const noteIndex = this.notes.findIndex(n => n.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex].content = content;
            this.notes[noteIndex].updatedAt = Date.now();
            await this.saveNotes();
            // We don't re-render here to avoid losing focus/cursor position
        }
    }

    async deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        await this.saveNotes();
        this.renderNotes();
    }
}

// Export for use in newtab.js
window.NotesManager = NotesManager;
