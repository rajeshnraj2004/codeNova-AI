import { useState, useEffect } from 'react';

export const useTypingEffect = (text, speed = 20, enabled = true) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text || '');
      return;
    }

    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return displayed;
};
