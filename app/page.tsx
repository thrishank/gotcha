"use client";
import { useEffect, useRef, useState } from "react";
import {
  onChallengeResponse,
  onChallengeExpired,
  onChallengeError,
} from "@gotcha-widget/lib";

const SHAPE_NAMES = ["triangle", "square", "circle", "rectangle"] as const;
type ShapeName = (typeof SHAPE_NAMES)[number];

const SHAPE_STYLES: Record<ShapeName, string> = {
  square: "w-12 h-12 bg-red-500",
  triangle:
    "w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[48px] border-b-blue-500",
  rectangle: "w-20 h-12 bg-yellow-500 transform rotate-45",
  circle: "w-12 h-12 bg-green-500 rounded-full",
};

const SPEED = 1.5;
const SHAPE_SIZE = 48;
const GAME_TIME = 30;
const REQUIRED_SCORE = 3;

function generateRandomVelocity() {
  const angle = Math.random() * 2 * Math.PI;
  return {
    x: Math.cos(angle) * SPEED,
    y: Math.sin(angle) * SPEED,
  };
}

export default function Page() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 650 });

  useEffect(() => {
    // update the size dyanmically
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
        y: Math.random() * (size.height - SHAPE_SIZE),
      },
      velocity: generateRandomVelocity(),
    })),
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
        }),
      );
    };

    const intervalId = setInterval(moveShapes, 20);
    return () => clearInterval(intervalId);
  }, [size]);

  const [time, setTime] = useState(GAME_TIME);
  const [start, setStart] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedShape, setSelectedShape] = useState("");
  const [showShape, setShowShape] = useState(false);
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "success" | "failed"
  >("idle");

  // Game timer with proper error handling
  useEffect(() => {
    if (start) {
      const intervalId = setInterval(async () => {
        try {
          setTime((prev) => {
            if (prev > 0) return prev - 1;
            setGameState("failed");
            onChallengeResponse(false);
            onChallengeExpired();
            return GAME_TIME;
          });
        } catch (error) {
          console.log(error);
          onChallengeError();
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [start]);

  // const resetGame = () => {
  //   setShapes((prevShapes) =>
  //     prevShapes.map((shape) => ({
  //       ...shape,
  //       visible: false,
  //     })),
  //   );
  //   setScore(0);
  //   setSelectedShape("");
  //   setGameState("idle");
  // };

  const startGame = () => {
    try {
      setStart(true);
      setGameState("playing");
      showRandomShape();
    } catch (error) {
      console.log(error);
      onChallengeError();
    }
  };

  const showRandomShape = () => {
    try {
      setShowShape(true);
      const randomIndex = Math.floor(Math.random() * shapes.length);
      setSelectedShape(SHAPE_NAMES[randomIndex]);
    } catch (error) {
      console.log(error);
      onChallengeError();
    }
  };

  // Score handling with success callback
  useEffect(() => {
    async function handleSuccess() {
      try {
        if (score >= REQUIRED_SCORE) {
          setGameState("success");
          await onChallengeResponse(true);
          setStart(false);
        }
      } catch (error) {
        console.log(error);
        onChallengeError();
      }
    }
    handleSuccess();
  }, [score]);

  const handleShapeclick = (shape: ShapeName) => {
    if (shape === selectedShape) {
      setScore((prev) => prev + 1);
    }
    showRandomShape();
  };

  useEffect(() => {
    setTimeout(() => {
      setShowShape(false);
    }, 2000);
  }, [showShape]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-center text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Identify Shape Challenge
        </h1>
        <h3 className="text-lg md:text-xl text-gray-300 mb-6 text-center">
          Click on the 2D shape mentioned to verify youre a human
        </h3>

        <div
          ref={gameRef}
          className="relative w-full max-w-[600px] mx-auto aspect-[4/3] rounded-xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm shadow-lg overflow-hidden"
        >
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 z-10 p-4">
              <button
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
                onClick={startGame}
              >
                Start Challenge
              </button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="flex justify-between items-center border-b border-gray-700/50 bg-gray-800/50 p-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Score:</span>
                <span className="text-white">
                  {score}/{REQUIRED_SCORE}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Time:</span>
                <span
                  className={`${time <= 10 ? "text-red-500" : "text-white"}`}
                >
                  {time}s
                </span>
              </div>
            </div>
          )}

          {gameState === "playing" &&
            !showShape &&
            shapes.map((shape, index) => (
              <div
                key={index}
                className={`${SHAPE_STYLES[shape.type]} absolute cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-200`}
                style={{
                  transform: `translate(${shape.position.x}px, ${shape.position.y}px)`,
                }}
                onClick={() => handleShapeclick(shape.type)}
              />
            ))}

          {showShape && (
            <div className="absolute inset-0 flex justify-center items-center bg-gray-900/75 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-white animate-pulse">
                {selectedShape}
              </div>
            </div>
          )}

          {gameState === "failed" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
              <div className="text-xl md:text-2xl font-bold text-red-500 animate-bounce">
                Verification Failed
              </div>
            </div>
          )}

          {gameState === "success" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
              <div className="text-xl md:text-2xl font-bold text-green-500 animate-bounce">
                Verification Complete!
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-center text-base md:text-lg font-semibold text-white mb-2">
            How to Play
          </h3>
          <ul className="space-y-2 text-sm md:text-base text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">1.</span>
              <span>
                A shape name will appear in the center of the screen for 2
                seconds
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">2.</span>
              <span>
                Find and click the matching floating shape among the moving
                shapes
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">3.</span>
              <span>
                Score {REQUIRED_SCORE} points within {GAME_TIME} seconds to
                complete the verification
              </span>
            </li>
          </ul>
        </div>

        <div className="text-xl md:text-2xl text-gray-400 mt-6 font-medium text-center">
          Powered By Goptcha Widget
        </div>
      </div>
    </div>
  );
}
