import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Question {
  question: string;
  image?: string;
  image2?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string; // Make e optional
  };
  answer: ('a' | 'b' | 'c' | 'd' | 'e')[];
}

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[][]>([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [mode, setMode] = useState<
    'normal' | 'show-answer' | 'instant-feedback'
  >('normal');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Fetch quiz data from JSON
    fetch('/quizData.json')
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        const savedState = localStorage.getItem('quizState');
        if (savedState) {
          const { currentQuestionIndex, selectedOptions, score } =
            JSON.parse(savedState);
          setCurrentQuestionIndex(currentQuestionIndex);
          setSelectedOptions(selectedOptions);
          setScore(score);
        } else {
          setSelectedOptions(Array(data.length).fill([]));
        }
      });
  }, []);

  useEffect(() => {
    // Save quiz state to local storage
    if (questions.length > 0) {
      const quizState = {
        currentQuestionIndex,
        selectedOptions,
        score,
      };
      localStorage.setItem('quizState', JSON.stringify(quizState));
    }
  }, [currentQuestionIndex, selectedOptions, score, questions]);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const option = e.target.value as 'a' | 'b' | 'c' | 'd' | 'e';
    const isSelected = e.target.checked;
    const newSelectedOptions = [...selectedOptions];
    if (!newSelectedOptions[currentQuestionIndex]) {
      newSelectedOptions[currentQuestionIndex] = [];
    }
    const currentSelections = [...newSelectedOptions[currentQuestionIndex]];
    if (isSelected) {
      currentSelections.push(option);
    } else {
      const index = currentSelections.indexOf(option);
      if (index > -1) {
        currentSelections.splice(index, 1);
      }
    }

    newSelectedOptions[currentQuestionIndex] = currentSelections;
    setSelectedOptions(newSelectedOptions);

    if (mode === 'instant-feedback') {
      handleCheckAnswer(currentSelections);
    }
  };

  const handleCheckAnswer = (selectedOption: string[] | null) => {
    const correctAnswers = questions[currentQuestionIndex].answer;

    // Ensure correctAnswers is always treated as an array
    const answersArray = Array.isArray(correctAnswers)
      ? correctAnswers
      : [correctAnswers];

    // Check if selectedOption is not null or undefined and has the same length as correctAnswers
    if (
      selectedOption &&
      selectedOption.length === answersArray.length &&
      selectedOption.every((option) =>
        answersArray.includes(option as 'a' | 'b' | 'c' | 'd' | 'e')
      )
    ) {
      setFeedback('Correct!');
    } else {
      setFeedback('Incorrect!');
    }
  };

  const handleNextQuestion = () => {
    const selectedOption = selectedOptions[currentQuestionIndex];
    const correctAnswers = questions[currentQuestionIndex].answer;

    if (
      selectedOption &&
      selectedOption.length === correctAnswers.length &&
      selectedOption.every((option) =>
        correctAnswers.includes(option as 'a' | 'b' | 'c' | 'd' | 'e')
      )
    ) {
      setScore(score + 1);
    }

    setFeedback(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizFinished(true);
      localStorage.removeItem('quizState'); // Clear state when quiz is finished
    }
  };

  const handlePreviousQuestion = () => {
    setFeedback(null);
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleSkipToQuestion = (index: number) => {
    setFeedback(null);
    setCurrentQuestionIndex(index);
  };

  const toggleMode = (
    selectedMode: 'normal' | 'show-answer' | 'instant-feedback'
  ) => {
    setMode(selectedMode);
  };

  const handleResetQuiz = () => {
    if (window.confirm('Are you sure you want to reset the quiz?')) {
      setCurrentQuestionIndex(0);
      setSelectedOptions(Array(questions.length).fill([]));
      setScore(0);
      setIsQuizFinished(false);
      setMode('normal');
      setFeedback(null);
      localStorage.removeItem('quizState');
    }
  };

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const handleFinishQuiz = () => {
    if (window.confirm('Are you sure you want to finish the quiz?')) {
      setIsQuizFinished(true);
      localStorage.removeItem('quizState'); // Clear state when quiz is finished
    }
  };

  const handleBack = () => {
    setIsQuizFinished(false);
  };

  if (isQuizFinished) {
    return (
      <div className='w-screen h-screen font-body flex flex-col items-center justify-center'>
        <div className='flex items-center justify-center space-x-5 text-4xl'>
          <div className='flex  items-center justify-center space-x-5'>
            <div>Score:</div>
            <div className='text-center grid grid-cols-1 divide-y-2 divide-blue-500'>
              <div
                className={`${
                  score / questions.length < 50
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              >
                {score}
              </div>
              <div className='text-blue-500'>{questions.length}</div>
            </div>
          </div>
        </div>
        <div className='space-x-3'>
          <button
            onClick={handleResetQuiz}
            className='bg-red-500 text-white px-4 py-2 mt-5 rounded-full transition-all duration-150 hover:bg-red-400'
          >
            Retry
          </button>
          <button
            className='bg-blue-500 text-white px-4 py-2 mt-5 rounded-full transition-all duration-150 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleBack}
            disabled={mode === 'instant-feedback'}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Ensure currentQuestion is defined before accessing its properties
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className='flex items-center justify-start mx-auto font-body px-2'>
      <div className='App mx-auto'>
        <div className='border-b flex flex-wrap items-center justify-between py-2'>
          <div>
            <div className='max-w-fit bg-blue-200 px-3 py-2 rounded-full lg:my-6'>
              Question {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          <div className='lg:flex gap-3 hidden'>
            <button
              onClick={() => toggleMode('show-answer')}
              className={`max-w-fit px-3 py-1 rounded-full lg:my-6 ${
                mode === 'show-answer'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-200'
              }`}
            >
              Show Answer Mode
            </button>
            <button
              onClick={() => toggleMode('normal')}
              className={`max-w-fit px-3 py-1 rounded-full lg:my-6 ${
                mode === 'normal' ? 'bg-blue-500 text-white' : 'bg-blue-200'
              }`}
            >
              Normal Mode
            </button>
            <button
              onClick={() => toggleMode('instant-feedback')}
              className={`max-w-fit px-3 py-1 rounded-full lg:my-6 ${
                mode === 'instant-feedback'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-200'
              }`}
            >
              Instant Feedback Mode
            </button>
          </div>
          <div>
            <button
              onClick={handleResetQuiz}
              disabled={mode === 'show-answer'}
              className='bg-red-500 text-white px-4 py-2 lg:my-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:bg-red-400'
            >
              Reset Quiz
            </button>
          </div>
        </div>
        <div className='flex flex-col justify-start max-w-5xl mx-auto min-h-[70vh] max-h-[70vh] overflow-y-auto border-b'>
          <div className='text-xl py-6'>
            {currentQuestion && (
              <>
                {currentQuestionIndex + 1}. {currentQuestion.question}
              </>
            )}
          </div>
          <div>
            {currentQuestion && currentQuestion.image && (
              <Image
                src={currentQuestion.image}
                alt='quiz'
                className=' mx-auto mb-4'
                width={450}
                height={300}
              />
            )}
            {currentQuestion && currentQuestion.image2 && (
              <Image
                src={currentQuestion.image2}
                alt='quiz2'
                className=' mx-auto mb-4'
                width={450}
                height={300}
              />
            )}
          </div>
          <div className='mb-6 px-3 py-1 bg-blue-200 flex items-center max-w-fit rounded-full'>
            Options
          </div>
          <div className='flex flex-col space-y-3'>
            {currentQuestion &&
              Object.keys(currentQuestion.options).map((key) => (
                <label
                  key={key}
                  className={`text-base px-3 py-1.5 rounded-md ${
                    mode === 'show-answer' &&
                    currentQuestion.answer.includes(
                      key as 'a' | 'b' | 'c' | 'd' | 'e'
                    )
                      ? 'bg-green-600 text-white'
                      : ''
                  } ${
                    mode === 'instant-feedback' &&
                    selectedOptions[currentQuestionIndex]?.includes(
                      key as 'a' | 'b' | 'c' | 'd' | 'e'
                    )
                      ? currentQuestion.answer.includes(
                          key as 'a' | 'b' | 'c' | 'd' | 'e'
                        )
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : ''
                  }`}
                >
                  <input
                    type='checkbox'
                    name='option'
                    value={key}
                    className='mr-3'
                    checked={
                      mode === 'show-answer'
                        ? currentQuestion.answer.includes(
                            key as 'a' | 'b' | 'c' | 'd' | 'e'
                          )
                        : (
                            selectedOptions[currentQuestionIndex] || []
                          ).includes(key as 'a' | 'b' | 'c' | 'd' | 'e')
                    }
                    onChange={handleOptionChange}
                    disabled={mode === 'show-answer'}
                  />
                  {
                    currentQuestion.options[
                      key as keyof typeof currentQuestion.options
                    ]
                  }
                </label>
              ))}
          </div>
        </div>
        <div className='flex justify-between mt-5 mb-10 text-base max-w-5xl mx-auto'>
          <div className='space-x-4'>
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className='px-4 py-1 bg-blue-200 hover:bg-blue-500 hover:text-white text-black rounded-full transition-all duration-150'
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              className='px-4 py-1 bg-blue-200 hover:bg-blue-500 hover:text-white text-black rounded-full transition-all duration-150'
            >
              Next
            </button>
          </div>
          <button
            onClick={handleFinishQuiz}
            disabled={mode === 'show-answer'}
            className='px-4 py-1 bg-red-500 hover:bg-red-400 text-white rounded-full transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Finish Quiz
          </button>
        </div>
        <div className='mt-5 max-w-7xl mx-auto flex items-start justify-start pb-16'>
          <div className='flex flex-wrap gap-x-3 gap-y-1.5'>
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSkipToQuestion(index)}
                className={`w-10 h-10 text-sm rounded-xl hover:bg-blue-500 ${
                  selectedOptions[index]?.length > 0
                    ? 'bg-yellow-500'
                    : 'bg-blue-200'
                } ${
                  currentQuestionIndex === index
                    ? 'bg-blue-500 text-white'
                    : 'text-black'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
