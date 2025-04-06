# Project Requirements Document: Guess the Indian City Game

**Version:** 1.0
**Date:** April 5, 2025

---

## 1. Introduction & Overview

* **Project Goal:** To create an engaging and fun web application where users guess famous Indian cities based on visual (images) and textual (description) clues.
* **Core Gameplay:** Users are presented with clues for a city and must input their guess. Correct guesses increase the user's current score. An incorrect guess resets the current score to zero. The application will track the user's highest achieved score locally.
* **Platform:** Web Application (Next.js specified).

## 2. Goals & Objectives

* Develop a simple, intuitive, and entertaining game experience.
* Educate users about famous Indian cities in a lighthearted way.
* Implement a score-keeping mechanism that encourages replayability (beating the personal best).
* Ensure the application is responsive and works well on various screen sizes (desktop, tablet, mobile).
* Provide a visually appealing interface.

## 3. Target Audience

* Casual gamers.
* Individuals interested in Indian geography, culture, and travel.
* Students or learners looking for a fun way to test their knowledge of India.
* General web users looking for a quick entertainment break.

## 4. Functional Requirements

* **FR-01: City Challenge Presentation**
    * The application must display one or more images associated with a specific Indian city.
    * The application must display a textual description or hint related to the same city.
    * Cities should be selected randomly (or in a predefined sequence that appears random) from a curated list, avoiding immediate repetition if possible within a single game session.
* **FR-02: User Guess Input**
    * The application must provide an input field (e.g., text box) for the user to type their guess.
    * Consider implementing an auto-suggest/autocomplete feature based on the list of possible city names to aid users and reduce frustration from minor spelling errors.
* **FR-03: Guess Validation**
    * The system must compare the user's input against the correct city name.
    * The validation should be case-insensitive.
    * Consider accepting common alternate names or spellings for cities (e.g., Mumbai/Bombay, Chennai/Madras, Kolkata/Calcutta - though stick to current official names primarily).
* **FR-04: Feedback Mechanism**
    * Upon submitting a guess, the system must immediately provide clear feedback:
        * **Correct Guess:** Indicate success (e.g., "Correct!", green checkmark). Display the correct city name clearly.
        * **Incorrect Guess:** Indicate failure (e.g., "Incorrect!", red cross). Display the correct city name.
* **FR-05: Scoring System**
    * **Current Score:**
        * A counter tracks the score for the current continuous streak of correct answers.
        * Increment the current score by 1 (or a defined value) for each correct guess.
        * Reset the current score to 0 upon an incorrect guess.
        * The current score must be visibly displayed to the user at all times during gameplay.
    * **Maximum Score:**
        * A separate counter tracks the highest score achieved by the user across all sessions on that specific browser/device.
        * After each correct guess, if the *current score* exceeds the stored *maximum score*, update the maximum score.
        * The maximum score must be visibly displayed to the user.
* **FR-06: Local Score Persistence**
    * The maximum score must be saved locally in the user's web browser using `localStorage` or a similar mechanism.
    * This ensures the maximum score persists even if the user closes the browser tab or window and returns later.
* **FR-07: Game Flow**
    * The game starts by presenting the first city challenge.
    * After a correct guess: Proceed to the next city challenge, updating scores.
    * After an incorrect guess: The current game round ends. Display a "Game Over" message along with the final current score (which would be the score before the incorrect guess) and the persistent maximum score.
    * Provide a clear option to "Play Again" or "Restart" after an incorrect guess or potentially after a correct guess as well.
* **FR-08: Data Source**
    * The application requires a dataset containing:
        * City Names (Canonical name, potentially aliases)
        * Associated Images (URLs or locally stored paths) - ensure appropriate usage rights. Aim for high-quality, representative images.
        * Textual Descriptions/Hints for each city.

## 5. Suggested Additional Features (Enhancements)

* **EF-01: Difficulty Levels:**
    * **Easy:** Very famous cities, obvious landmarks, clear hints.
    * **Medium:** Well-known cities, less obvious hints or images.
    * **Hard:** Less common (but still famous) cities, potentially requiring more specific knowledge, cryptic hints, or multiple varied images.
* **EF-02: Hint System:**
    * Allow users to request an additional hint per city (e.g., reveal the state, first letter, another image).
    * This could cost points from the current score or have a limited number of uses per game.
* **EF-03: Timed Mode:**
    * Add an optional timer for each guess. Correct answers within the time limit could award bonus points or be required to continue.
* **EF-04: Themed Categories:**
    * Allow users to choose categories like "Cities by the Sea," "Mountain Cities," "Historical Capitals," "Cities known for Food," "South Indian Cities," etc.
* **EF-05: "Learn More" Link:**
    * After revealing the correct city (on correct or incorrect guess), provide a link (e.g., to Wikipedia or a relevant travel site) for the user to learn more about the city.
* **EF-06: Sound Effects / Music:**
    * Simple, non-intrusive sound effects for correct/incorrect answers and game start/end.
    * Optional background music with volume control.
* **EF-07: Progress Indicator:**
    * Show the user how many cities they have guessed correctly in the current session (e.g., "City 5 of ?").
* **EF-08: Image Variety:**
    * For each city, have a pool of multiple images and descriptions. Randomly select one or a combination for each challenge to increase replayability.

## 6. Non-Functional Requirements

* **NFR-01: Performance:**
    * The application should load quickly.
    * Images should be optimized for web display to minimize load times.
    * UI interactions (guessing, feedback) should feel responsive.
* **NFR-02: Usability:**
    * The interface must be intuitive and easy to understand, requiring minimal instructions.
    * Gameplay mechanics should be clear.
* **NFR-03: Compatibility:**
    * Must function correctly on the latest versions of major web browsers (Chrome, Firefox, Safari, Edge).
    * Must have a responsive design that adapts gracefully to different screen sizes (desktop, tablet, mobile).
* **NFR-04: Reliability:**
    * The scoring and local storage mechanism must work accurately and consistently.
    * Image and text content should load reliably.
* **NFR-05: Maintainability:**
    * Code should be well-structured, commented, and follow Next.js/React best practices to facilitate future updates and bug fixes.
    * Adding new cities, images, and descriptions should be straightforward.

## 7. UI/UX Considerations

* Visually appealing design, possibly incorporating elements evocative of India (colors, patterns, motifs) without being cluttered.
* Clear typography.
* Prominent display of images, hints, current score, and max score.
* Obvious input area and submission button.
* Clear and concise feedback messages.
* Smooth transitions between game states (start, playing, game over).

## 8. Data Requirements

* A structured list (e.g., JSON array) of Indian cities.
* Each city object should contain:
    * `id`: Unique identifier.
    * `name`: Official city name (string).
    * `alternate_names`: Array of common alternate names/spellings (optional).
    * `images`: Array of URLs or paths to relevant images.
    * `hints`: Array of possible text descriptions/hints.
    * `state`: State the city is in (optional, could be used for hints).
    * `difficulty`: Difficulty rating (e.g., 1, 2, 3) (optional, for EF-01).
    * `category`: Tags for themed categories (optional, for EF-04).

## 9. Technology Stack (Recommendation)

* **Frontend Framework:** Next.js (as specified)
* **Language:** TypeScript (recommended for type safety) or JavaScript
* **Styling:** Tailwind CSS, CSS Modules, Styled Components, or Emotion.
* **State Management:** React Context API, Zustand (for simpler state), or Redux/RTK (if complexity increases significantly).
* **Local Storage:** Browser `localStorage` API.
* **Deployment:** Vercel, Netlify, AWS Amplify, Google Cloud Run, etc.

## 10. Future Enhancements (Beyond Initial Scope)

* User accounts for persistent scores across devices.
* Online leaderboards (global or friends).
* Social sharing of high scores.
* Multiplayer mode (competitive guessing).
* Achievements/Badges for reaching milestones.

## 11. Success Metrics

* User Engagement: Average session duration, number of games played per user.
* User Retention: Rate of users returning to play again.
* Score Distribution: Analysis of maximum scores achieved (indicates difficulty balance).
* User Feedback: Qualitative feedback gathered through comments or surveys.

---