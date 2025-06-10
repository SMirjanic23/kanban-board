# Vanilla JS Kanban Board

## Description

This is a fully functional Kanban board built with pure HTML, CSS, and JavaScript, without any libraries or bundlers. It allows adding, editing, deleting, and moving cards between columns using drag & drop. The state is saved in `localStorage`.

## Architecture

- `public/index.html`: Main HTML file with templates for columns and cards.
- `public/main.css`: Styles for the Kanban board appearance.
- `src/scripts/script.js`: Core application logic (rendering, event handling, drag & drop).
- `src/scripts/state.js`: Module for saving and loading state from localStorage.

## Running the Application

### Recommended method (Visual Studio Code)

1. Install the **Live Server** extension for VSCode
2. Open the project folder in VSCode.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. Your browser will open at an address like `http://127.0.0.1:5500` and the app will run.

### Alternative methods

Run a local server using PHP:

1. Open the project folder in VSCode.
2. Run this code inside the terminal: php -S localhost:8000 -t public

## Note

The app uses JavaScript modules and the drag & drop API, so it must be served over a local server and cannot be run by opening the `index.html` file directly.
