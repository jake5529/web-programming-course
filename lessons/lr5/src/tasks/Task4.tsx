import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { usePostApiSessions } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdAnswers } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';
import * as React from 'react'

/**
 * Task 4: Комбинированное использование MobX + Zustand
 */
const Task4 = observer(() => {
  // MobX - бизнес-логика
  const { 
    gameStatus, 
    currentQuestion,
    selectedAnswers, 
    essayAnswer,
    score, 
    progress,
    questions,
    correctAnswersCount,
    currentQuestionIndex,
    isLastQuestion,
    setEssayAnswer, // Добавляем метод для установки текстового ответа
  } = gameStore;

  // Zustand - UI состояние
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {
          questionCount: 5,
          difficulty: 'medium'
        }
      },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          // Загружаем вопросы в gameStore
          gameStore.startGame(response.questions);
        },
        onError: (error) => {
          console.error('Failed to create session:', error);
        },
      }
    );
  };

  const handleNextQuestion = () => {
    if (sessionId && currentQuestion) {
      // Определяем тип вопроса и формируем данные для отправки
      let answerData;
      
      if (currentQuestion.type === 'essay') {
        // Для эссе отправляем текстовый ответ
        answerData = {
          questionId: currentQuestion.id as never as string,
          text: essayAnswer || '' // Добавляем проверку на null/undefined
        };
      } else {
        // Для вопросов с выбором отправляем выбранные варианты
        answerData = {
          questionId: currentQuestion.id as never as string,
          selectedOptions: selectedAnswers
        };
      }
  
      // Отправляем ответ на сервер
      submitAnswer.mutate(
        {
          sessionId,
          data: answerData
        },
        {
          onSuccess: (response) => {
            // Обновляем счет на основе ответа сервера
            if ('pointsEarned' in response) {
              // const isCorrect = response.status === 'correct';
              // ... обновляем результат ...
            }
            // Переходим к следующему вопросу
            if (!gameStore.nextQuestion()) {
              handleFinishGame();
            };
          },
          onError: (error) => {
            console.error('Failed to submit answer:', error);
            gameStore.nextQuestion();
          },
        }
      );
    }
  };

  const handleFinishGame = () => {
    if (sessionId) {
      submitSession.mutate(
        { sessionId },
        {
          onSuccess: (response) => {
            console.log('Session completed:', response);
            gameStore.finishGame();
          },
          onError: (error) => {
            console.error('Failed to submit session:', error);
            gameStore.finishGame();
          },
        }
      );
    } else {
      gameStore.finishGame();
    }
  };

  // Проверяем, можно ли перейти к следующему вопросу
  const canProceed = () => {
    if (!currentQuestion) return false;
    
    if (currentQuestion.type === 'essay') {
      // Для эссе проверяем, что введен текст
      return essayAnswer && essayAnswer.trim().length > 0;
    } else {
      // Для вопросов с выбором проверяем, что выбран хотя бы один вариант
      return selectedAnswers.length > 0;
    }
  };

  // Цвета в зависимости от темы
  const bgGradient = theme === 'light'
    ? 'from-purple-500 to-indigo-600'
    : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
  const primaryHover = theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';

  // Расчет процентов для экрана результатов
  const percentage = questions.length > 0 
    ? Math.round((correctAnswersCount / questions.length) * 100)
    : 0;

  const getEmoji = () => {
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '😊';
    if (percentage >= 40) return '🤔';
    return '😢';
  };

  // Стартовый экран
  if (gameStatus === 'idle') {
    return (
      <div className={`min-h-screen w-full bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
          {/* Переключатель темы */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <h1 className={`text-4xl font-bold mb-2 text-center ${textColor}`}>
            Quiz Game
          </h1>
          <p className={`${mutedText} mb-2 text-center`}>MobX + Zustand Edition</p>
          <p className={`text-sm ${mutedText} mb-8 text-center`}>
            Звук: {soundEnabled ? '🔊' : '🔇'}
          </p>

          <button
            onClick={() => handleStartGame()}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
          >
            Начать игру
          </button>

          {/* Информация о разделении ответственности */}
          <div className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}>
              <strong>Task 4:</strong> Комбинация MobX + Zustand
            </p>
            <ul className={`text-xs ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}>
              <li>• <strong>MobX:</strong> Игровая логика (вопросы, счёт)</li>
              <li>• <strong>Zustand:</strong> UI настройки (тема, звук)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Экран результатов
  if (gameStatus === 'finished') {
    return (
      <div className={`min-h-screen w-full bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transition-colors duration-300`}>
          <div className="text-6xl mb-4">{getEmoji()}</div>

          <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>
            Игра завершена!
          </h2>

          <div className="mb-6">
            <p className={`text-5xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mb-2`}>
              {score}
            </p>
            <p className={mutedText}>очков заработано</p>
          </div>

          <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4 mb-6`}>
            <p className={`text-lg ${textColor}`}>
              Правильных ответов: <span className="font-bold">{correctAnswersCount} из {questions.length}</span>
            </p>
            <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
              {percentage}%
            </p>
          </div>

          <button
            onClick={() => gameStore.resetGame()}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
          >
            Играть снова
          </button>
        </div>
      </div>
    );
  }

  // Игровой экран
  if (!currentQuestion) return null;

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">
        {/* Заголовок с темой */}
        <div className={`${cardBg} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${mutedText}`}>
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                Счёт: {score}
              </span>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
          {/* Прогресс бар */}
          <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded-full h-2`}>
            <div
              className={`${theme === 'light' ? 'bg-purple-600' : 'bg-purple-500'} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Карточка с вопросом */}
        <div className={`${cardBg} rounded-2xl shadow-2xl p-6 transition-colors duration-300`}>
          <div className="mb-4">
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700'}
              ${currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700'}
              ${currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'}
            `}>
              {currentQuestion.difficulty === 'easy' && 'Легкий'}
              {currentQuestion.difficulty === 'medium' && 'Средний'}
              {currentQuestion.difficulty === 'hard' && 'Сложный'}
            </span>
          </div>

          <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>
            {currentQuestion.question}
          </h2>

          {/* Рендерим в зависимости от типа вопроса */}
          {currentQuestion.type === 'essay' ? (
            // Поле для текстового ответа (эссе)
            <div className="space-y-3">
              <textarea
                value={essayAnswer || ''}
                onChange={(e) => setEssayAnswer(e.target.value)}
                className={`
                  w-full p-4 text-left rounded-lg border-2 transition-all
                  ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-600 bg-gray-700'}
                  ${theme === 'light' ? 'text-gray-800' : 'text-white'}
                  focus:outline-none focus:border-purple-500
                  min-h-[200px]
                `}
                placeholder="Введите ваш ответ здесь..."
              />
            </div>
          ) : (
            // Варианты ответов для вопросов с выбором
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers.includes(index);
                const isCorrect = false // index === currentQuestion.correctAnswer;
                const showResult = selectedAnswers !== null;

                return (
                  <button
                    key={index}
                    onClick={() => gameStore.selectAnswer(index)}
                    // disabled={selectedAnswers !== null}
                    className={`
                      w-full p-4 text-left rounded-lg border-2 transition-all
                      ${!showResult && theme === 'light' && 'hover:border-purple-400 hover:bg-purple-50'}
                      ${!showResult && theme === 'dark' && 'hover:border-purple-500 hover:bg-gray-700'}
                      ${!showResult && !isSelected && (theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-600 bg-gray-700')}
                      ${!showResult && isSelected && (theme === 'light' ? 'border-purple-500 bg-purple-50' : 'border-purple-500 bg-gray-600')}
                      ${showResult && isCorrect && 'border-green-500 bg-green-50'}
                      ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50'}
                      ${showResult && !isCorrect && !isSelected && 'opacity-60'}
                    `}
                  >
                    <div className="flex items-center">
                      <span className={`
                        w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold
                        ${!showResult && (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600 text-white')}
                        ${showResult && isCorrect && 'bg-green-500 text-white'}
                        ${showResult && isSelected && !isCorrect && 'bg-red-500 text-white'}
                      `}>
                        {isSelected ? '✓' : String.fromCharCode(65 + index)}
                      </span>
                      <span className={`flex-1 ${textColor}`}>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Кнопка "Далее" */}
          {canProceed() && (
            <button
              onClick={() => handleNextQuestion()}
              className={`mt-6 w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-lg font-semibold transition-colors`}
            >
              {isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
          )}
        </div>

        {/* Подсказка */}
        <div className={`mt-4 backdrop-blur-sm rounded-lg p-4 ${theme === 'light' ? 'bg-white/20' : 'bg-black/20'}`}>
          <p className={`text-sm ${theme === 'light' ? 'text-white' : 'text-gray-300'}`}>
            <strong>MobX + Zustand:</strong> GameStore управляет игровой логикой (observer автообновление),
            UIStore управляет темой (селекторы). Оба работают независимо!
          </p>
        </div>
      </div>
    </div>
  );
});

export default Task4;