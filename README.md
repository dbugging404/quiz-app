# Quiz Application

A simple quiz application built with React and TypeScript. The application takes questions, options, and answers from a JSON file, tracks the user's progress, and stores the quiz state in local storage to allow resuming after a page refresh or browser restart. The application supports multiple modes: Normal, Show Answer, and Instant Feedback.

## Features

- **Normal Mode**: Standard quiz functionality.
- **Show Answer Mode**: Displays the correct answer for each question upfront.
- **Instant Feedback Mode**: Provides immediate feedback upon selecting an answer.
- **Question Navigation**: Allows users to jump to any question and navigate using Next and Previous buttons.
- **Progress Tracking**: Displays the user's current position and marks answered questions.
- **Persistent State**: Saves the quiz state in local storage to allow resuming.
- **Reset Quiz**: A button to reset the quiz and clear local storage.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/quiz-app.git
   cd quiz-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

## Usage

1. Place your quiz questions in a `quizData.json` file in the public directory. The JSON format should be:

   ```json
   [
     {
       "question": "What is the capital of France?",
       "options": {
         "a": "Berlin",
         "b": "Madrid",
         "c": "Paris",
         "d": "Rome"
       },
       "answer": "c"
     },
     {
       "question": "Which planet is known as the Red Planet?",
       "options": {
         "a": "Earth",
         "b": "Mars",
         "c": "Jupiter",
         "d": "Saturn"
       },
       "answer": "b"
     }
   ]
   ```

2. Open your browser and navigate to `http://localhost:3000`.

## Application Structure

- `App.tsx`: Main application component.
- `quizData.json`: JSON file containing the quiz questions, options, and answers.

## Modes

- **Normal Mode**: Standard quiz mode without hints or feedback.
- **Show Answer Mode**: Correct answers are shown for studying purposes.
- **Instant Feedback Mode**: Provides immediate feedback on answer selection.

## Local Storage

The quiz state is saved in local storage, allowing users to resume the quiz even after closing the browser. The state includes:

- Current question index
- Selected options
- Score

## Reset Quiz

A "Reset Quiz" button is provided to reset the quiz progress and clear the local storage. A confirmation alert is displayed to prevent accidental resets.

## Tailwind CSS

The application uses Tailwind CSS for styling. Ensure you have it set up correctly in your project.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
