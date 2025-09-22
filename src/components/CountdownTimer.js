import React, { useState, useEffect } from 'react';

function CountdownTimer({ targetDate }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] > 0) {
        timerComponents.push(
            <span key={interval}>
                {timeLeft[interval]} {interval}{' '}
            </span>
        );
    }
  });

  return (
    <div className="countdown-timer" style={{ color: '#ffc107', fontSize: '0.9em', padding: '10px 0' }}>
      {timerComponents.length ? (
        <>
          <span>Próximo examen en: </span>
          {timerComponents}
        </>
      ) : (
        <span>¡Examen disponible!</span>
      )}
    </div>
  );
}

export default CountdownTimer;
