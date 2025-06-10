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
    }
  },

  saveState() {
    localStorage.setItem("kanbanState", JSON.stringify(this.columns));
  },

  resetState() {
    this.columns = {
      todo: { id: "todo", name: "To Do", cards: [] },
      inprogress: { id: "inprogress", name: "In Progress", cards: [] },
      done: { id: "done", name: "Done", cards: [] },
    };
    localStorage.removeItem("kanbanState");
    this.saveState();
    this.renderColumns();
  },

  renderColumns() {
    const columnTemplate = document.getElementById("column");

    if (!columnTemplate) {
      console.error("Template is not available inside the DOM!");
      return;
    }

    const board = document.getElementById("board");
    board.innerHTML = "";

    Object.values(this.columns).forEach(({ id, name, cards }) => {
      const column = columnTemplate.content.cloneNode(true);

      column.querySelector(".column-title").textContent = name;
      column.querySelector(".column").dataset.columnId = id;
      column.querySelector(".column").classList.add(id);

      column.querySelector(".column-count").textContent = cards.length;

      const addBtn = column.querySelector(".add-card");
      addBtn.addEventListener("click", () => this.openAddCardModal(id));

      board.appendChild(column);
    });
  },
};

export default state;
