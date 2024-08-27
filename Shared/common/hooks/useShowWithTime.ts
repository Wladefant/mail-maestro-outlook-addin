import { useState, useEffect } from "react";

type UseShowWithTimerProps = {
  handleClick: () => void;
  showComponent: boolean;
};

const useShowWithTimer = (duration: number): UseShowWithTimerProps => {
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showComponent) {
      timer = setTimeout(() => {
        setShowComponent(false);
      }, duration);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [showComponent, duration]);

  const handleClick = () => {
    setShowComponent(true);
  };

  return {
    showComponent,
    handleClick,
  };
};

export default useShowWithTimer;
