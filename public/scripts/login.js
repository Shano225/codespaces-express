document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  if (username) {
    localStorage.setItem('username', username);
    window.location.href = '/home';
  }
});
