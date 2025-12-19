// login.js
// Handles login form submission and local storage of username
// Listens for form submit, saves username to localStorage, and redirects to home
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  if (username) {
    localStorage.setItem('username', username);
    window.location.href = '/home';
  }
});
