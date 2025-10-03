function addFlashcard(front, back, reaction) {
  fetch('/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Front: front,
      Back: back,
      Reaction: reaction
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Flashcard added:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}