import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';

const Task4 = observer(() => {
  // MobX - бизнес-логика
  const { 
    gameStatus, 
    currentQuestion,
    selectedAnswer, 
    score, 
    progress,
    currentQuestionIndex,
    questions,
    correctAnswersCount,
    isLastQuestion,
    formattedTime,
    statistics
  } = gameStore;

  // Zustand - UI состояние
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const settingsModalOpen = useUIStore((state) => state.settingsModalOpen);
  const toggleSettingsModal = useUIStore((state) => state.toggleSettingsModal);
  const statsModalOpen = useUIStore((state) => state.statsModalOpen);
  const toggleStatsModal = useUIStore((state) => state.toggleStatsModal);

  // Цвета в зависимости от темы
  const bgGradient = theme === 'light'
    ? 'from-purple-500 to-indigo-600'
    : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
  const primaryHover = theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';

  // Стартовый экран
  if (gameStatus === 'idle') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
          {/* Переключатель темы и кнопка статистики */}
          <div className="flex justify-between mb-4">
            <button
              onClick={toggleStatsModal}
              className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
            >
              📊
            </button>
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
            onClick={() => gameStore.startGame()}
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
              <li>• <strong>MobX:</strong> Игровая логика (вопросы, счёт, таймер, статистика)</li>
              <li>• <strong>Zustand:</strong> UI настройки (тема, звук, модальные окна)</li>
            </ul>
          </div>
        </div>

        {/* Модальное окно статистики */}
        {statsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-6 max-w-md w-full transition-colors duration-300`}>
              <h3 className={`text-2xl font-bold mb-4 ${textColor}`}>Статистика</h3>
              
              <div className="space-y-3 mb-6">
                <div className={`flex justify-between ${mutedText}`}>
                  <span>Всего игр:</span>
                  <span className="font-semibold">{statistics.totalGames}</span>
                </div>
                <div className={`flex justify-between ${mutedText}`}>
                  <span>Лучший счёт:</span>
                  <span className="font-semibold">{statistics.bestScore}</span>
                </div>
                <div className={`flex justify-between ${mutedText}`}>
                  <span>Средний счёт:</span>
                  <span className="font-semibold">{statistics.averageScore.toFixed(1)}</span>
                </div>
                <div className={`flex justify-between ${mutedText}`}>
                  <span>Правильных ответов:</span>
                  <span className="font-semibold">{statistics.totalCorrectAnswers}</span>
                </div>
              </div>

              <button
                onClick={toggleStatsModal}
                className={`w-full ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors`}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Экран результатов
  if (gameStatus === 'finished') {
    const percentage = Math.round((correctAnswersCount / questions.length) * 100);
    const getEmoji = () => {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '😊';
      if (percentage >= 40) return '🤔';
      return '😢';
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
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
            <p className={`text-sm ${mutedText} mt-2`}>
              Время: {formattedTime}
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
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">
        {/* Заголовок с темой */}
        <div className={`${cardBg} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${mutedText}`}>
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${mutedText}`}>
                ⏱️ {formattedTime}
              </span>
              <span className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                Счёт: {score}
              </span>
              <button
                onClick={toggleSettingsModal}
                className={`p-2 rounded ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              >
                ⚙️
              </button>
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

          {/* Варианты ответов */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => gameStore.selectAnswer(index)}
                  disabled={selectedAnswer !== null}
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
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={`flex-1 ${textColor}`}>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Кнопка "Далее" */}
          {selectedAnswer !== null && (
            <button
              onClick={() => gameStore.nextQuestion()}
              className={`mt-6 w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-lg font-semibold transition-colors`}
            >
              {isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
          )}
        </div>

        {/* Модальное окно настроек */}
        {settingsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-6 max-w-md w-full transition-colors duration-300`}>
              <h3 className={`text-2xl font-bold mb-4 ${textColor}`}>Настройки</h3>
              
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${textColor}`}>Тема оформления</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => useUIStore.getState().setTheme('light')}
                    className={`
                      flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                      ${theme === 'light'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    ☀️ Светлая
                  </button>
                  <button
                    onClick={() => useUIStore.getState().setTheme('dark')}
                    className={`
                      flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                      ${theme === 'dark'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    🌙 Тёмная
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${textColor}`}>Звуковые эффекты</label>
                <button
                  onClick={useUIStore.getState().toggleSound}
                  className={`
                    w-full py-4 px-6 rounded-lg font-semibold transition-all
                    ${soundEnabled
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    }
                  `}
                >
                  {soundEnabled ? '🔊 Звук включен' : '🔇 Звук выключен'}
                </button>
              </div>

              <button
                onClick={toggleSettingsModal}
                className={`w-full ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors`}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

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
