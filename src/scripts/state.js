const state = {
  columns: {
    todo: { id: "todo", name: "To Do", cards: [] },
    inprogress: { id: "inprogress", name: "In Progress", cards: [] },
    done: { id: "done", name: "Done", cards: [] },
  },

  loadState() {
    const savedColumns = localStorage.getItem("kanbanState");
    if (savedColumns) {
      this.columns = JSON.parse(savedColumns);

      for (const column of Object.values(this.columns)) {
        column.cards = column.cards.map((card) => ({
          ...card,
          id: String(card.id),
        }));
      }
    }
  },

  saveState() {
    localStorage.setItem("kanbanState", JSON.stringify(this.columns));
  },

  resetState(render) {
    this.columns = {
      todo: { id: "todo", name: "To Do", cards: [] },
      inprogress: { id: "inprogress", name: "In Progress", cards: [] },
      done: { id: "done", name: "Done", cards: [] },
    };
    localStorage.removeItem("kanbanState");
    this.saveState();
    render();
  },
};

export default state;
