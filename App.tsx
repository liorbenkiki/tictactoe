import React, { useState, useEffect, useCallback } from 'react';
import { Settings, RotateCcw, Trophy, AlertTriangle, Info } from 'lucide-react';
import { Player, GameState, AppState, GameMode, PlayerSymbol } from './types';
import { INITIAL_PLAYERS, INITIAL_GAME_STATE } from './constants';
import { checkWinner, getNextDisappearingMoveIndex } from './utils/gameUtils';
import { Modal } from './components/Modal';
import { PlayerCard } from './components/PlayerCard';
import { Board } from './components/Board';

// Local Storage Key
const STORAGE_KEY = 'tacticinfinity_data_v1';

const App: React.FC = () => {
  // State Initialization
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed: AppState = JSON.parse(savedData);
        setPlayers(parsed.players);
        setGameState(parsed.gameState);
      } catch (e) {
        console.error("Failed to parse saved game data", e);
      }
    } else {
      // First time load: Randomize starting player
      const randomStart = Math.random() < 0.5 ? 0 : 1;
      setGameState(prev => ({
        ...prev,
        currentPlayerIndex: randomStart,
        lastStarterIndex: randomStart
      }));
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on Change
  useEffect(() => {
    if (!isLoaded) return;
    const data: AppState = { players, gameState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [players, gameState, isLoaded]);

  // Game Logic Handlers
  const handleCellClick = useCallback((index: number) => {
    if (gameState.board[index] || gameState.winner) return;

    const currentPlayer = players[gameState.currentPlayerIndex];
    let newMoves = [...gameState.moves];
    let newBoard = [...gameState.board];

    // Handle Disappearing Moves Logic
    if (gameState.gameMode === 'disappearing') {
      const playerMoves = newMoves.filter(m => m.playerSymbol === currentPlayer.symbol);
      if (playerMoves.length >= 3) {
        // Remove the oldest move for this player
        const moveToRemove = playerMoves[0]; // The first one in the filtered list is the oldest
        // Find actual index in main moves array to splice it out? 
        // Better: Filter the main moves array to exclude the move that matches the cellIndex of the oldest move
        newMoves = newMoves.filter(m => m.cellIndex !== moveToRemove.cellIndex);
        newBoard[moveToRemove.cellIndex] = null;
      }
    }

    // Add new move
    newMoves.push({ playerSymbol: currentPlayer.symbol, cellIndex: index });
    newBoard[index] = currentPlayer.symbol;

    // Check Win
    const winResult = checkWinner(newBoard);
    
    let newWinner = gameState.winner;
    let newWinningLine = gameState.winningLine;
    let updatedPlayers = [...players];

    if (winResult) {
      newWinner = winResult.winner;
      newWinningLine = winResult.line;
      if (newWinner !== 'draw') {
        updatedPlayers = players.map(p => 
          p.symbol === newWinner ? { ...p, wins: p.wins + 1 } : p
        );
      }
    }

    // Update State
    setPlayers(updatedPlayers);
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      moves: newMoves,
      currentPlayerIndex: winResult ? prev.currentPlayerIndex : (prev.currentPlayerIndex === 0 ? 1 : 0),
      winner: newWinner,
      winningLine: newWinningLine
    }));

  }, [gameState, players]);

  const startNewGame = useCallback(() => {
    // Round Robin Logic
    const nextStarter = gameState.lastStarterIndex === 0 ? 1 : 0;
    
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      moves: [],
      currentPlayerIndex: nextStarter,
      lastStarterIndex: nextStarter,
      winner: null,
      winningLine: null
    }));
  }, [gameState.lastStarterIndex]);

  const resetGame = useCallback(() => {
    // Reset current game but keep stats
     setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      moves: [],
      winner: null,
      winningLine: null,
      // Keep current turn logic or reset to current starter? Let's keep current starter
      currentPlayerIndex: prev.lastStarterIndex
    }));
  }, []);

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  // Settings Actions
  const resetStats = () => {
    setPlayers(players.map(p => ({ ...p, wins: 0 })));
    setIsSettingsOpen(false);
  };

  const factoryReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayers(INITIAL_PLAYERS);
    const randomStart = Math.random() < 0.5 ? 0 : 1;
    setGameState({
        ...INITIAL_GAME_STATE,
        currentPlayerIndex: randomStart,
        lastStarterIndex: randomStart
    });
    setIsSettingsOpen(false);
  };

  const changeGameMode = (mode: GameMode) => {
    if (mode === gameState.gameMode) return;
    // Reset game when changing mode
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      board: Array(9).fill(null),
      moves: [],
      winner: null,
      winningLine: null,
      currentPlayerIndex: prev.lastStarterIndex
    }));
    setIsSettingsOpen(false);
  };

  // Derived State for UI
  const currentPlayer = players[gameState.currentPlayerIndex];
  const nextDisappearingIndex = gameState.gameMode === 'disappearing' && !gameState.winner
    ? getNextDisappearingMoveIndex(gameState.moves, currentPlayer.symbol) 
    : null;

  if (!isLoaded) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6 px-4 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            {gameState.gameMode === 'classic' ? 'Classic' : 'Infinity'} TicTacToe
            </h1>
            {gameState.gameMode === 'disappearing' && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Info size={12} /> Max 3 moves per player
                </p>
            )}
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Players */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
        {players.map((p, idx) => (
          <PlayerCard 
            key={p.id}
            player={p}
            isActive={!gameState.winner && gameState.currentPlayerIndex === idx}
            onUpdateName={(name) => updatePlayerName(idx, name)}
            isWinner={gameState.winner === p.symbol}
          />
        ))}
      </div>

      {/* Game Board */}
      <div className="mb-8 w-full flex justify-center">
        <Board 
          board={gameState.board}
          onCellClick={handleCellClick}
          winningLine={gameState.winningLine}
          isGameOver={!!gameState.winner}
          disappearingIndex={nextDisappearingIndex}
        />
      </div>

      {/* Game Status / Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {gameState.winner ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-2xl font-bold flex items-center gap-2">
              {gameState.winner === 'draw' ? (
                <span className="text-slate-400">It's a Draw!</span>
              ) : (
                <>
                  <Trophy className="text-yellow-400" />
                  <span className={gameState.winner === 'X' ? 'text-cyan-400' : 'text-rose-400'}>
                    {players.find(p => p.symbol === gameState.winner)?.name} Wins!
                  </span>
                </>
              )}
            </div>
            <button 
              onClick={startNewGame}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RotateCcw size={20} /> Play Again
            </button>
          </div>
        ) : (
          <div className="h-16 flex items-center">
              <button 
                onClick={resetGame}
                className="text-slate-500 hover:text-slate-300 text-sm font-medium flex items-center gap-1 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
            >
                <RotateCcw size={14} /> Restart Round
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <div className="space-y-6">
          {/* Game Mode Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Game Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => changeGameMode('classic')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  gameState.gameMode === 'classic' 
                    ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Classic
              </button>
              <button
                onClick={() => changeGameMode('disappearing')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  gameState.gameMode === 'disappearing' 
                    ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Infinity (Max 3)
              </button>
            </div>
            <p className="text-xs text-slate-500">
                {gameState.gameMode === 'classic' 
                    ? "Standard rules. 3 in a row wins."
                    : "Only 3 pieces allowed per player. Placing a 4th removes your 1st."
                }
            </p>
          </div>

          <hr className="border-slate-700" />

          {/* Reset Actions */}
          <div className="space-y-3">
             <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Danger Zone</h3>
             
             <button 
                onClick={resetStats}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all text-left group"
             >
                <span className="text-slate-300 group-hover:text-white font-medium">Reset Scores</span>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Keeps names</span>
             </button>

             <button 
                onClick={factoryReset}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all text-left group"
             >
                <span className="text-red-400 group-hover:text-red-300 font-medium flex items-center gap-2">
                    <AlertTriangle size={16} /> Factory Reset
                </span>
                <span className="text-xs bg-red-900/20 px-2 py-1 rounded text-red-400">Wipes everything</span>
             </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;
