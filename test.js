function keyPressed() {
  // Check if the Enter key (13) is pressed
  if (keyCode === 13) {
    front = frontInput.value();
    back = backInput.value();
    
    // Call the API function to save data
    addFlashcard(front, back, reaction);
  }
}
