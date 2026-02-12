import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  lines: string[];
  speed?: number;
  delayBetweenLines?: number;
  onComplete?: () => void;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  lines, 
  speed = 40, 
  delayBetweenLines = 800, 
  onComplete,
  className = "" 
}) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  
  // Refs to handle timeouts and cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start processing the current line
    if (currentLineIndex >= lines.length) {
      if (onComplete) onComplete();
      return;
    }

    const currentLineText = lines[currentLineIndex];

    if (currentCharIndex < currentLineText.length) {
      // Type next character
      timeoutRef.current = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (newLines[currentLineIndex] === undefined) {
            newLines[currentLineIndex] = '';
          }
          newLines[currentLineIndex] = currentLineText.substring(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, speed);
    } else {
      // Line finished, wait before next line
      timeoutRef.current = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, delayBetweenLines);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentLineIndex, currentCharIndex, lines, speed, delayBetweenLines, onComplete]);

  return (
    <div className={`space-y-4 ${className}`}>
      {displayedLines.map((line, index) => (
        <p key={index} className="min-h-[1.5em] leading-relaxed">
          {line}
          {index === currentLineIndex && index < lines.length && (
             <span className="inline-block w-2 h-4 ml-1 bg-red-500 animate-pulse align-middle" />
          )}
        </p>
      ))}
      {currentLineIndex >= lines.length && (
         <div className="h-4" /> // Spacing after completion
      )}
    </div>
  );
};