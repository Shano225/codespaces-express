function SpacedCard() {
  fetch("/api/spacedcard")
    .then((response) => response.json())
    .then((data) => {
      if (data && data.flashcard) {
        currentFront = data.flashcard.Front || "";
        currentBack = data.flashcard.Back || "";
        currentReaction = data.flashcard.Reaction || "";
      } else {
        currentFront = "No flashcards available";
        currentBack = "";
      }
    })
    .catch((err) => {
      console.error("Failed to fetch random flashcard:", err);
      currentFront = "Error fetching card";
      currentBack = "";
    });
}