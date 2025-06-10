import state from "./state.js";

document.addEventListener("DOMContentLoaded", () => {
  state.loadState();
  state.renderColumns();

  let resetStateButton = document.getElementById("resetBtn");
  resetStateButton.addEventListener("click", () => {
    state.resetState();
  });
});
