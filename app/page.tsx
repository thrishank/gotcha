"use client"
import { useEffect, useRef, useState } from "react";

const SHAPE_NAMES = ["triangle", "square", "circle", "rectangle"] as const;
type ShapeName = typeof SHAPE_NAMES[number];

const SHAPE_STYLES: Record<ShapeName, string> = {
  square: "w-12 h-12 bg-red-500",
  triangle: "w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[48px] border-b-blue-500",
  rectangle: "w-20 h-12 bg-yellow-500 transform rotate-45",
  circle: "w-12 h-12 bg-green-500 rounded-full",
};

const SPEED = 1;
const SHAPE_SIZE = 48;

function generateRandomVelocity() {
  const angle = Math.random() * 2 * Math.PI;
  return {
    x: Math.cos(angle) * SPEED,
    y: Math.sin(angle) * SPEED
  }
}

export default function Page() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 650 });

  useEffect(() => {
    const updateContainerSize = () => {
      if (gameRef.current) {
        setSize({
          width: gameRef.current.clientWidth,
          height: gameRef.current.clientHeight - 40, // Subtract header height
        });
      }
    };

    // Set initial size and add resize listener
    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);

    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  const [shapes, setShapes] = useState(() =>
    SHAPE_NAMES.map((shape) => ({
      type: shape,
      position: {
        x: Math.random() * (size.width - SHAPE_SIZE),
        y: Math.random() * (size.height - SHAPE_SIZE)
      },
      velocity: generateRandomVelocity(),
      visible: false
    }))
  );

  useEffect(() => {
    const moveShapes = () => {
      setShapes((prevShapes) =>
        prevShapes.map((shape) => {
          let { x, y } = shape.position;
          let { x: vx, y: vy } = shape.velocity;

          // Update positions
          x += vx;
          y += vy;

          // Check for collision with box boundaries
          if (x <= 0 || x >= size.width - SHAPE_SIZE) {
            vx = -vx;
            x = Math.max(0, Math.min(x, size.width - SHAPE_SIZE));
          }
          if (y <= 0 || y >= size.height - SHAPE_SIZE) {
            vy = -vy;
            y = Math.max(0, Math.min(y, size.height - SHAPE_SIZE));
          }

          return {
            ...shape,
            position: { x, y },
            velocity: { x: vx, y: vy },
          };
        })
      );
    };

    const intervalId = setInterval(moveShapes, 20);
    return () => clearInterval(intervalId);
  }, [size]);

  const [time, setTime] = useState(60);
  const [attempts, setAttempts] = useState(1);
  const [start, setStart] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedShape, setSelectedShape] = useState("");
  const [showShape, setShowShape] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      const intervalId = setInterval(() => {
        setTime((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            setAttempts((prevAttempts) => prevAttempts + 1);
            resetGame();
            return 60;
          }
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [attempts, gameStarted]);

  const resetGame = () => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) => ({
        ...shape,
        visible: false,
      }))
    );
    setScore(0);
    setSelectedShape("");
  }

  const startGame = () => {
    setGameStarted(true);
    setStart(true);
    showRandomShape();
  };

  const showRandomShape = () => {
    setShowShape(true);
    const randomIndex = Math.floor(Math.random() * shapes.length);
    setSelectedShape(SHAPE_NAMES[randomIndex]);
  }

  const handleShapeclick = (shape: ShapeName) => {
    if (shape === selectedShape) {
      setScore((prev) => prev + 1);
      if (score >= 3) {
        setFinished(true);
        setGameStarted(false);
        setStart(false);
      }
      else {
        showRandomShape();
      }
    }
    else {
      setAttempts((prev) => prev + 1);
      if (attempts >= 3) {
        setGameStarted(false);
        setStart(false);
        setAttempts(1);
        setScore(0);
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setShowShape(false);
    }, 2000)
  }, [showShape])

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white text-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-4">Identify Shape Challenge</h1>
        <h3 className="text-xl mb-8">Click on the 2D shape mentioned to verify youre a human</h3>

        <div
          ref={gameRef}
          className="relative h-[400px] sm:h-[500px] md:h-[550px] lg:h-[650px] w-full max-w-[600px] border border-gray-700 rounded-lg"
        >
          {!start && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-10">
              <h1 className="text-4xl font-bold text-white mb-6">Welcome to Shape Challenge</h1>
              <p className="text-xl text-gray-300 mb-8">Find the matching shape before time runs out!</p>
              <button
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors"
                onClick={startGame}>Start Game</button>
            </div>
          )}

          {start && (
            <div className="flex justify-between border-b border-gray-500 p-2 text-sm sm:text-base">
              <div>Attempts: {attempts}/3</div>
              <div>Score : {score} / 3 </div>
              <div>Timer: {time}s</div>
            </div>
          )}

          {start && !showShape && shapes.map((shape, index) => (
            <div
              key={index}
              className={`${SHAPE_STYLES[shape.type]} absolute cursor-pointer transition-transform hover:scale-110`}
              style={{
                transform: `translate(${shape.position.x}px, ${shape.position.y}px)`,
              }}
              onClick={() => handleShapeclick(shape.type)}
            />
          ))}

          {showShape && (
            <div className="flex justify-center items-center h-screen">
              <div className="font-bold text-3xl text-green">
                {selectedShape}
              </div>
            </div>

          )}
          {attempts > 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-2xl font-bold text-red-500">Game Failed</div>
            </div>
          )}
          {finished && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-2xl font-bold text-green-500">Game Completed</div>
            </div>
          )}
        </div>
        <div className="text-2xl m-8">Powered By Goptcha Widget</div>
      </div>
    </div>
  );
}