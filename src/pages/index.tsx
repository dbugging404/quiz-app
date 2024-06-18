import Image from 'next/image';
import React, { useState, useEffect } from 'react';

interface Question {
  question: string;
  image: string;
  image2: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: 'a' | 'b' | 'c' | 'd';
}

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<(string | null)[]>([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [mode, setMode] = useState<
    'normal' | 'show-answer' | 'instant-feedback'
  >('normal');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
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
          setSelectedOptions(Array(data.length).fill(null));
        }
      });
  }, []);

  useEffect(() => {
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
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = e.target.value;
    setSelectedOptions(newSelectedOptions);

    if (mode === 'instant-feedback') {
      handleCheckAnswer(e.target.value);
    }
  };

  const handleCheckAnswer = (selectedOption: string) => {
    if (selectedOption === questions[currentQuestionIndex].answer) {
      setFeedback('Correct!');
      setScore(score + 1);
    } else {
      setFeedback('Incorrect!');
    }
  };

  const handleNextQuestion = () => {
    const selectedOption = selectedOptions[currentQuestionIndex];
    if (
      selectedOption !== null &&
      selectedOption === questions[currentQuestionIndex].answer
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
      setSelectedOptions(Array(questions.length).fill(null));
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

  if (isQuizFinished) {
    return (
      <div>
        Your score is: {score}/{questions.length}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswer = questions[currentQuestionIndex].answer;

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
              className='bg-red-500 text-white px-4 py-2 lg:my-6 rounded-full'
            >
              Reset Quiz
            </button>
          </div>
        </div>
        <div className='flex flex-col justify-center max-w-5xl mx-auto min-h-[80vh] border-b pb-6'>
          <div className='text-xl py-8'>
            {currentQuestionIndex + 1}. {currentQuestion.question}
          </div>
          <div>
            {currentQuestion.image && (
              <Image
                src={currentQuestion.image}
                alt='quiz'
                className=' mx-auto mb-4'
                width={450}
                height={300}
              />
            )}
            {currentQuestion.image2 && (
              <Image
                src={currentQuestion.image2 && currentQuestion.image2}
                alt='quiz2'
                className=' mx-auto mb-4'
                width={450}
                height={300}
              />
            )}
          </div>
          <div className='mb-8 px-3 py-1 bg-blue-200 flex items-center max-w-fit rounded-full'>
            Options
          </div>
          <div className='flex flex-col space-y-4'>
            {Object.keys(currentQuestion.options).map((key) => (
              <label key={key} className='text-base '>
                <input
                  type='radio'
                  name='option'
                  value={key}
                  className='mr-3'
                  checked={selectedOptions[currentQuestionIndex] === key}
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
            {mode === 'show-answer' && (
              <div className='bg-green-300 px-3 py-2 rounded-lg'>
                <span className='font-bold text-lg'>Correct Answer: </span>
                {
                  currentQuestion.options[
                    correctAnswer as keyof typeof currentQuestion.options
                  ]
                }
              </div>
            )}
            {mode === 'instant-feedback' && feedback && <div>{feedback}</div>}
          </div>
        </div>
        <div className='flex space-x-4 my-10 text-base max-w-5xl mx-auto'>
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
        <div className='mt-5 max-w-7xl mx-auto flex items-start justify-start pb-16'>
          <div className='flex flex-wrap gap-x-3 gap-y-1.5'>
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSkipToQuestion(index)}
                className={`w-10 h-10 rounded-full hover:bg-blue-500 ${
                  selectedOptions[index] ? 'bg-yellow-500' : 'bg-blue-200'
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
