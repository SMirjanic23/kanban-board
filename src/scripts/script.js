import state from "./state.js";

function renderColumns() {
  const board = document.getElementById("board");
  if (!board) {
    console.error("Board element not found!");
    return;
  }

  board.innerHTML = "";

  Object.values(state.columns).forEach((column) => {
    board.appendChild(createColumnElement(column));
  });

  dragAndDropHandler();
}

function createColumnElement(column) {
  const { id, name, cards } = column;
  const columnTemplate = document.getElementById("kanban-column");
  if (!columnTemplate) throw new Error("Column template missing!");

  const columnEl = columnTemplate.content.cloneNode(true);
  const columnNode = columnEl.querySelector(".column");

  columnNode.dataset.columnId = id;
  columnNode.classList.add(id);
  columnNode.querySelector(".column-title").textContent = name;
  columnNode.querySelector(".column-count").textContent = cards.length;

  const cardsContainer = columnNode.querySelector(".cards-container");
  cards.forEach((card) => {
    cardsContainer.appendChild(createCardElement(card, id));
  });

  columnNode
    .querySelector(".add-card")
    .addEventListener("click", () => openAddCardModal(id));

  return columnNode;
}

function createCardElement(card, columnId) {
  const cardTemplate = document.getElementById("kanban-item");
  if (!cardTemplate) throw new Error("Card template missing!");

  const cardEl = cardTemplate.content.cloneNode(true);
  const cardNode = cardEl.querySelector(".card");

  cardNode.dataset.cardId = card.id;
  cardNode.dataset.columnId = columnId;

  const titleEl = cardNode.querySelector(".card-title");
  titleEl.textContent = card.title;

  const editBtn = cardNode.querySelector('[title="Edit card"]');
  editBtn.addEventListener("click", () => {
    const existingInputs = document.querySelectorAll(".card-edit-input");
    existingInputs.forEach((input) => {
      const originalTitle = input.dataset.originalTitle;
      const titleEl = document.createElement("div");
      titleEl.className = "card-title";
      titleEl.textContent = originalTitle;
      input.replaceWith(titleEl);
    });

    const input = document.createElement("input");
    input.type = "text";
    input.value = card.title;
    input.dataset.originalTitle = card.title;
    input.className = "card-edit-input";

    titleEl.replaceWith(input);
    input.focus();
    input.select();

    let canceled = false;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      } else if (e.key === "Escape") {
        canceled = true;
        input.blur();
      }
    });

    input.addEventListener("blur", () => {
      if (canceled) {
        renderColumns();
        return;
      }

      const newTitle = input.value.trim();
      if (newTitle && newTitle !== card.title) {
        editCard(card.id, columnId, newTitle);
      } else {
        renderColumns();
      }
    });
  });

  const deleteBtn = cardNode.querySelector('[title="Delete card"]');
  deleteBtn.addEventListener("click", () => {
    deleteCard(card.id, columnId);
  });

  state.saveState();

  return cardNode;
}
function openAddCardModal(columnId) {
  const modal = document.getElementById("card-modal");
  const input = document.getElementById("card-input");
  const saveBtn = document.getElementById("save-card");
  const cancelBtn = document.getElementById("cancel-card");

  input.value = "";
  modal.classList.remove("hidden");
  input.focus();

  const saveCardHandler = () => {
    const title = input.value.trim();
    if (title) addCardHandler(columnId, title);
    modal.classList.add("hidden");
  };

  saveBtn.addEventListener("click", saveCardHandler, { once: true });
  cancelBtn.addEventListener("click", () => modal.classList.add("hidden"), {
    once: true,
  });
}
function addCardHandler(columnId, title) {
  const cardId = Date.now().toString();

  state.columns[columnId].cards.push({
    id: cardId,
    title,
  });

  state.saveState();
  renderColumns();
}
function editCard(cardId, columnId, newTitle) {
  const column = state.columns[columnId];
  const card = column.cards.find((card) => card.id == cardId);
  if (card) {
    card.title = newTitle;
    state.saveState();
    renderColumns();
  }
}

function deleteCard(cardId, columnId) {
  const column = state.columns[columnId];
  column.cards = column.cards.filter((card) => card.id != cardId);
  state.saveState();
  renderColumns();
}
function dragAndDropHandler() {
  const kanbanCards = document.querySelectorAll(".card");
  const kanbanColumns = document.querySelectorAll(".cards-container");

  let dragItem = null;

  kanbanCards.forEach((kanbanCard) => {
    kanbanCard.addEventListener("dragstart", dragStart);
    kanbanCard.addEventListener("dragend", dragEnd);
  });

  function dragStart(e) {
    dragItem = this;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      `${dragItem.dataset.cardId}-${dragItem.dataset.columnId}`
    );
    dragItem.classList.add("dragging");
  }

  function dragEnd(e) {
    dragItem.classList.remove("dragging");
    dragItem = null;
  }

  kanbanColumns.forEach((kanbanColumn) => {
    kanbanColumn.addEventListener("dragover", dragOver);
    kanbanColumn.addEventListener("drop", dragDrop);
  });

  function dragOver(e) {
    e.preventDefault();

    const column = e.currentTarget;
    const afterElement = getDragAfterElement(column, e.clientY);
    const draggable = document.querySelector(".dragging");

    if (!afterElement) {
      column.appendChild(draggable);
    } else {
      column.insertBefore(draggable, afterElement);
    }
  }

  function dragDrop(e) {
    e.preventDefault();
    if (!dragItem) return;

    const fromColumnId = dragItem.dataset.columnId;
    const toColumnId = e.currentTarget.parentElement.dataset.columnId;
    const cardId = dragItem.dataset.cardId;

    const cardsInColumn = Array.from(
      e.currentTarget.querySelectorAll(".card:not(.dragging)")
    );
    let newIndex = cardsInColumn.findIndex(
      (card) =>
        card.compareDocumentPosition(dragItem) &
        Node.DOCUMENT_POSITION_PRECEDING
    );

    if (newIndex === -1) newIndex = cardsInColumn.length;

    moveCardToColumn(toColumnId, fromColumnId, cardId, newIndex);

    renderColumns();
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".card:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
}

function moveCardToColumn(toColumn, fromColumn, itemID, toIndex) {
  const item = state.columns[fromColumn]?.cards.find(
    (card) => card.id.toString() === itemID
  );

  if (item) {
    state.columns[fromColumn].cards = state.columns[fromColumn].cards.filter(
      (card) => card.id.toString() !== itemID
    );

    if (typeof toIndex === "number") {
      state.columns[toColumn].cards.splice(toIndex, 0, item);
    } else {
      state.columns[toColumn].cards.push(item);
    }

    state.saveState();
    renderColumns();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  state.loadState();
  renderColumns();

  let resetStateButton = document.getElementById("resetBtn");
  resetStateButton.addEventListener("click", () => {
    state.resetState(renderColumns);
  });
  dragAndDropHandler();
});
