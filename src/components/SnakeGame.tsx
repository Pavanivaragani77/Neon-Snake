import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  isMusicPlaying: boolean;
}

const GRID_SIZE = 25;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 100; // ms per frame

export function SnakeGame({ onScoreChange, isMusicPlaying }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  
  // Game state refs to avoid dependency issues in requestAnimationFrame
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const lastUpdateRef = useRef<number>(0);
  const speedRef = useRef<number>(INITIAL_SPEED);
  const animationFrameId = useRef<number>(0);

  const generateFood = (snake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood(snakeRef.current);
    speedRef.current = INITIAL_SPEED;
    setScore(0);
    onScoreChange(0);
    setGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !gameOver) {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused || gameOver) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      if (isPaused || gameOver) {
        draw(ctx);
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (timestamp - lastUpdateRef.current >= speedRef.current) {
        update();
        lastUpdateRef.current = timestamp;
      }

      draw(ctx);
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const update = () => {
      const snake = [...snakeRef.current];
      directionRef.current = nextDirectionRef.current;
      const dir = directionRef.current;
      const head = { ...snake[0] };

      head.x += dir.x;
      head.y += dir.y;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return;
      }

      // Self collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return;
      }

      snake.unshift(head);

      // Food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        foodRef.current = generateFood(snake);
        // Increase speed slightly
        speedRef.current = Math.max(50, speedRef.current - 2);
      } else {
        snake.pop();
      }

      snakeRef.current = snake;
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.fillStyle = '#000000'; // Pure black
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid lines (harsh cyan/magenta mix)
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
      }

      // Draw food (Magenta block)
      const food = foodRef.current;
      const foodGlitch = Math.random() > 0.8 ? (Math.random() * 4 - 2) : 0;
      
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(
        food.x * CELL_SIZE + foodGlitch - 2,
        food.y * CELL_SIZE - foodGlitch,
        CELL_SIZE,
        CELL_SIZE
      );
      
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(
        food.x * CELL_SIZE + foodGlitch,
        food.y * CELL_SIZE - foodGlitch,
        CELL_SIZE,
        CELL_SIZE
      );

      // Draw snake (Cyan blocks)
      const snake = snakeRef.current;
      
      snake.forEach((segment, index) => {
        const glitchOffset = Math.random() > 0.9 ? (Math.random() * 4 - 2) : 0;
        
        // Chromatic aberration shadow
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(
          segment.x * CELL_SIZE + glitchOffset + 2,
          segment.y * CELL_SIZE,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );

        if (index === 0) {
          ctx.fillStyle = '#ffffff'; // Head
        } else {
          ctx.fillStyle = '#00ffff';
        }
        
        ctx.fillRect(
          segment.x * CELL_SIZE + glitchOffset,
          segment.y * CELL_SIZE,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
      });

      // Draw Paused / Game Over text
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        // Draw glitchy magenta box
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(CANVAS_SIZE / 2 - 180, CANVAS_SIZE / 2 - 120, 360, 240);
        if (Math.random() > 0.5) {
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(CANVAS_SIZE / 2 - 175, CANVAS_SIZE / 2 - 115, 360, 240);
        }
        
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 28px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        // Glitch text position
        const textX = CANVAS_SIZE / 2 + (Math.random() > 0.8 ? Math.random() * 6 - 3 : 0);
        ctx.fillText('SYS.HALT', textX, CANVAS_SIZE / 2 - 30);
        
        ctx.fillStyle = '#ff00ff';
        ctx.font = '28px "VT323", monospace';
        ctx.fillText('ERR_CODE: 0xDEADBEEF // CORE_DUMP', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 30);
        ctx.fillText('EXECUTE REBOOT_SEQ [SPACE]', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 70);
      } else if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 28px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SYS.SUSPEND', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      }
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPaused, gameOver, score, onScoreChange]);

  // Handle restart via spacebar when game over
  useEffect(() => {
    const handleRestart = (e: KeyboardEvent) => {
      if (gameOver && e.key === ' ') {
        resetGame();
      }
    };
    window.addEventListener('keydown', handleRestart);
    return () => window.removeEventListener('keydown', handleRestart);
  }, [gameOver]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className={`p-1 bg-black border-4 ${isMusicPlaying ? 'border-[#00ffff]' : 'border-[#ff00ff]'} relative`}>
        {/* Glitch artifacts on border */}
        {isMusicPlaying && (
          <>
            <div className="absolute top-10 -left-4 w-4 h-8 bg-[#ff00ff]"></div>
            <div className="absolute bottom-20 -right-4 w-4 h-12 bg-[#00ffff]"></div>
            <div className="absolute -top-4 right-10 w-16 h-4 bg-[#ff00ff]"></div>
          </>
        )}
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black block"
        />
      </div>
      <div className="mt-6 text-[#ff00ff] text-2xl font-sans flex gap-8 uppercase tracking-widest">
        <span>SYS.INPUT_STREAM: [W A S D]</span>
        <span>SYS.INTERRUPT: [SPACE]</span>
      </div>
    </div>
  );
}
