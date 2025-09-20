import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

function App() {
  const [gridSize] = useState({ width: 20, height: 15 });
  const [scanPosition, setScanPosition] = useState(0);
  const [scanDirection, setScanDirection] = useState(1);
  const [colorPhase, setColorPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed] = useState(130);
  const intervalRef = useRef();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // BRIGHT to BLACKISH Scanner trail color schemes
  const colorSchemes = [
    {
      name: 'Green',
      colors: [
        '#00ff88', // Super Bright Green (Leading edge)
        '#00ee77', // Very Bright Green
        '#00cc55', // Bright Green
        '#008833', // Medium Green (starting to darken)
        '#004422', // Dark Greenish (getting blackish)
        '#001111'  // Very Dark/Blackish (Trailing edge)
      ]
    },
    {
      name: 'Blue',
      colors: [
        '#00bbff', // Super Bright Blue (Leading edge)
        '#00aaee', // Very Bright Blue
        '#0088cc', // Bright Blue
        '#005588', // Medium Blue (starting to darken)
        '#002244', // Dark Bluish (getting blackish)
        '#001122'  // Very Dark/Blackish (Trailing edge)
      ]
    },
    {
      name: 'Orange',
      colors: [
        '#ffaa00', // Super Bright Orange (Leading edge)
        '#ee9900', // Very Bright Orange
        '#cc7700', // Bright Orange
        '#885500', // Medium Orange (starting to darken)
        '#442200', // Dark Orangish (getting blackish)
        '#221100'  // Very Dark/Blackish (Trailing edge)
      ]
    },
    {
      name: 'Purple',
      colors: [
        '#aa00ff', // Super Bright Purple (Leading edge)
        '#9900ee', // Very Bright Purple
        '#7700cc', // Bright Purple
        '#550088', // Medium Purple (starting to darken)
        '#220044', // Dark Purplish (getting blackish)
        '#110022'  // Very Dark/Blackish (Trailing edge)
      ]
    },
    {
      name: 'Cyan',
      colors: [
        '#00ffff', // Super Bright Cyan (Leading edge)
        '#00eeee', // Very Bright Cyan
        '#00cccc', // Bright Cyan
        '#008888', // Medium Cyan (starting to darken)
        '#004444', // Dark Cyanish (getting blackish)
        '#002222'  // Very Dark/Blackish (Trailing edge)
      ]
    },
    {
      name: 'Red',
      colors: [
        '#ff0066', // Super Bright Red (Leading edge)
        '#ee0055', // Very Bright Red
        '#cc0044', // Bright Red
        '#880033', // Medium Red (starting to darken)
        '#440022', // Dark Reddish (getting blackish)
        '#220011'  // Very Dark/Blackish (Trailing edge)
      ]
    }
  ];

  // Color change every 5 scans
  const triggerColorChange = (currentScanCount) => {
    if (currentScanCount % 3 === 0) {
      const nextIndex = (colorPhase + 1) % colorSchemes.length;
      console.log(`Color Change: ${colorSchemes[colorPhase].name} → ${colorSchemes[nextIndex].name}`);

      setIsTransitioning(true);
      setColorPhase(nextIndex);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }
  };

  // Scanner movement
  useEffect(() => {
    if (!isPlaying) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const interval = setInterval(() => {
      setScanPosition(prev => {
        const newPosition = prev + scanDirection;

        if (newPosition >= gridSize.width - 1 && scanDirection === 1) {
          const newScanCount = scanCount + 1;
          setScanCount(newScanCount);
          triggerColorChange(newScanCount);
          setScanDirection(-1);
          return gridSize.width - 1;
        } else if (newPosition <= 0 && scanDirection === -1) {
          const newScanCount = scanCount + 1;
          setScanCount(newScanCount);
          triggerColorChange(newScanCount);
          setScanDirection(1);
          return 0;
        }

        return newPosition;
      });
    }, speed);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, scanDirection, gridSize.width, scanCount, colorPhase]);

  const getCurrentColorScheme = () => colorSchemes[colorPhase];

  // Scanner trail effect - bright leading, blackish trailing
  const getScannerColor = (x) => {
    let relativePosition;

    // Calculate position relative to scan direction
    if (scanDirection === 1) {
      // Moving right - leading edge is on the right side
      relativePosition = x - scanPosition;
    } else {
      // Moving left - leading edge is on the left side  
      relativePosition = scanPosition - x;
    }

    const currentColors = getCurrentColorScheme().colors;

    // Map positions to colors (bright to blackish)
    if (relativePosition === 0 || relativePosition === 1) return currentColors[0]; // Super Bright (Leading)
    if (relativePosition === -1) return currentColors[1]; // Very Bright
    if (relativePosition === -2) return currentColors[2]; // Bright
    if (relativePosition === -3) return currentColors[3]; // Medium (starting to darken)
    if (relativePosition === -4) return currentColors[4]; // Dark/Blackish
    if (relativePosition === -5) return currentColors[5]; // Very Dark/Blackish (Trailing)

    return null; // Background
  };

  const generateGrid = () => {
    const grid = [];

    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const scannerColor = getScannerColor(x);

        if (scannerColor === null) {
          // Very dark background cells
          grid.push(
            <div
              key={`${x}-${y}`}
              className="w-full h-full border border-gray-900"
              style={{
                aspectRatio: '1',
                backgroundColor: '#000000', // Pure black background
                transition: 'background-color 0.3s ease'
              }}
            />
          );
        } else {
          // Scanner trail cells - bright to blackish
          grid.push(
            <div
              key={`${x}-${y}`}
              className="w-full h-full border border-gray-800/30"
              style={{
                aspectRatio: '1',
                backgroundColor: scannerColor,
                transition: isTransitioning
                  ? 'background-color 1s ease'
                  : 'background-color 0.3s ease',
                // Add glow only for brighter colors (first 3 bands)
                boxShadow: getScannerColor(x) === getCurrentColorScheme().colors[0] ||
                  getScannerColor(x) === getCurrentColorScheme().colors[1] ||
                  getScannerColor(x) === getCurrentColorScheme().colors[2]
                  ? `0 0 3px ${scannerColor}50`
                  : 'none'
              }}
            />
          );
        }
      }
    }
    return grid;
  };

  const scansUntilColorChange = 3 - (scanCount % 3);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Bright Transition Indicator */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid - Bright to Black Scanner Trail */}
      <div className="flex justify-center items-center p-8">
        <div className="bg-black/80 p-6 rounded-xl border border-gray-700">
          <div
            className="grid gap-1 bg-black p-4 rounded-lg border border-gray-800"
            style={{
              gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize.height}, minmax(0, 1fr))`,
              width: '800px',
              height: '600px'
            }}
          >
            {generateGrid()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
