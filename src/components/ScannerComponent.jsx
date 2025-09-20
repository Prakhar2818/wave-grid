import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const ScannerComponent = () => {
  const [gridSize] = useState({ width: 20, height: 15 });
  const [scanPosition, setScanPosition] = useState(0);
  const [scanDirection, setScanDirection] = useState(1);
  const [colorPhase, setColorPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed] = useState(130);
  const intervalRef = useRef();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Scanner color schemes - bright to blackish trail
  const colorSchemes = [
    {
      name: 'Green',
      colors: ['#00ff88', '#00ee77', '#00cc55', '#008833', '#004422', '#001111']
    },
    {
      name: 'Blue',
      colors: ['#00bbff', '#00aaee', '#0088cc', '#005588', '#002244', '#001122']
    },
    {
      name: 'Orange',
      colors: ['#ffaa00', '#ee9900', '#cc7700', '#885500', '#442200', '#221100']
    },
    {
      name: 'Purple',
      colors: ['#aa00ff', '#9900ee', '#7700cc', '#550088', '#220044', '#110022']
    },
    {
      name: 'Cyan',
      colors: ['#00ffff', '#00eeee', '#00cccc', '#008888', '#004444', '#002222']
    },
    {
      name: 'Red',
      colors: ['#ff0066', '#ee0055', '#cc0044', '#880033', '#440022', '#220011']
    }
  ];

  // Color change every 3 scans
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

  // Scanner movement with bounce detection
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

  // Calculate scanner color based on position
  const getScannerColor = (x) => {
    let relativePosition;

    if (scanDirection === 1) {
      relativePosition = x - scanPosition;
    } else {
      relativePosition = scanPosition - x;
    }

    const currentColors = getCurrentColorScheme().colors;

    if (relativePosition === 0 || relativePosition === 1) return currentColors[0];
    if (relativePosition === -1) return currentColors[1];
    if (relativePosition === -2) return currentColors[2];
    if (relativePosition === -3) return currentColors[3];
    if (relativePosition === -4) return currentColors[4];
    if (relativePosition === -5) return currentColors[5];

    return null;
  };

  // Generate grid cells
  const generateGrid = () => {
    const grid = [];

    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const scannerColor = getScannerColor(x);

        if (scannerColor === null) {
          grid.push(
            <div
              key={`${x}-${y}`}
              className="w-full h-full border border-gray-900"
              style={{
                aspectRatio: '1',
                backgroundColor: '#000000',
                transition: 'background-color 0.3s ease'
              }}
            />
          );
        } else {
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
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
  );
};

export default ScannerComponent;
