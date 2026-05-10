"use client";

import { useEffect, useRef, useState } from "react";

const defaultMachines = [
  {
    id: 1,
    name: "เครื่อง A",
    targetMinute: 3,
  },
  {
    id: 2,
    name: "เครื่อง B",
    targetMinute: 3,
  },
  {
    id: 3,
    name: "เครื่อง C",
    targetMinute: 3,
  },
];

export default function Page() {
  const [machines, setMachines] = useState(
    defaultMachines.map((m) => ({
      ...m,
      seconds: 0,
      running: false,
      finished: false,
    }))
  );

  const audioRef = useRef(null);

  // 🔊 init audio
  useEffect(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (AudioContextClass) {
        audioRef.current =
          new AudioContextClass();
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  // ⏱ timer
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines((prev) =>
        prev.map((m) => {
          if (!m.running) return m;

          const next = m.seconds + 1;

          const targetSec =
            Number(m.targetMinute) * 60;

          if (
            next >= targetSec &&
            !m.finished
          ) {
            playAlarm();

            speakThai(
              `${m.name} ครบเวลาแล้วค่ะ`
            );

            return {
              ...m,
              seconds: next,
              running: false,
              finished: true,
            };
          }

          return {
            ...m,
            seconds: next,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔊 alarm
  const playAlarm = () => {
    try {
      const audioContext =
        audioRef.current;

      if (!audioContext) return;

      const playNote = (
        frequency,
        duration,
        delay
      ) => {
        const oscillator =
          audioContext.createOscillator();

        const gainNode =
          audioContext.createGain();

        oscillator.type = "square";

        oscillator.frequency.value =
          frequency;

        oscillator.connect(gainNode);

        gainNode.connect(
          audioContext.destination
        );

        const start =
          audioContext.currentTime + delay;

        gainNode.gain.setValueAtTime(
          0.0001,
          start
        );

        gainNode.gain.exponentialRampToValueAtTime(
          0.15,
          start + 0.01
        );

        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          start + duration
        );

        oscillator.start(start);

        oscillator.stop(
          start + duration
        );
      };

      playNote(1200, 0.12, 0);
      playNote(1600, 0.12, 0.15);
      playNote(2200, 0.3, 0.3);
    } catch (err) {
      console.log(err);
    }
  };

  // 🗣 speak
  const speakThai = (text) => {
    try {
      if (!window.speechSynthesis)
        return;

      speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = "th-TH";
      utterance.rate = 0.9;

      speechSynthesis.speak(utterance);
    } catch (err) {
      console.log(err);
    }
  };

  // ▶️ toggle
  const toggle = async (id) => {
    try {
      if (
        audioRef.current &&
        audioRef.current.state ===
          "suspended"
      ) {
        await audioRef.current.resume();
      }
    } catch (e) {}

    setMachines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              running: !m.running,
              finished: false,
            }
          : m
      )
    );
  };

  // 🔄 reset
  const reset = (id) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              seconds: 0,
              running: false,
              finished: false,
            }
          : m
      )
    );
  };

  // ⌨️ minute
  const updateMinute = (
    id,
    value
  ) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              targetMinute:
                Number(value) || 0,
            }
          : m
      )
    );
  };

  // 🕒 split
  const splitTime = (sec) => {
    const h = String(
      Math.floor(sec / 3600)
    ).padStart(2, "0");

    const m = String(
      Math.floor((sec % 3600) / 60)
    ).padStart(2, "0");

    const s = String(sec % 60).padStart(
      2,
      "0"
    );

    return [...h, ":", ...m, ":", ...s];
  };

  return (
    <main className="page">
      {/* header */}
      <div className="header">
        <div>
          <div className="header-sub">
            Production Timer
          </div>

          <h1 className="header-title">
            Oven Dashboard
          </h1>
        </div>

        <div className="machine-box">
          <div className="machine-label">
            Machines
          </div>

          <div className="machine-count">
            {machines.length}
          </div>
        </div>
      </div>

      {/* cards */}
      <div className="grid">
        {machines.map((m) => {
          const targetSec =
            Number(m.targetMinute) * 60;

          const progress = Math.min(
            (m.seconds / targetSec) * 100,
            100
          );

          const remain =
            targetSec - m.seconds;

          const warning =
            remain <= 60 && remain > 0;

          return (
            <div
              key={m.id}
              className={`card ${
                m.finished
                  ? "card-finished"
                  : warning
                  ? "card-warning"
                  : "card-normal"
              }`}
            >
              {/* top */}
              <div className="top-row">
                <div>
                  <div className="machine-text">
                    Machine
                  </div>

                  <div className="machine-name">
                    {m.name}
                  </div>
                </div>

                <div
                  className={`status ${
                    m.finished
                      ? "status-red"
                      : m.running
                      ? "status-green"
                      : "status-gray"
                  }`}
                >
                  {m.finished
                    ? "FINISHED"
                    : m.running
                    ? "RUNNING"
                    : "IDLE"}
                </div>
              </div>

              {/* timer */}
              <div className="timer-box">
                <div className="timer-row">
                  {splitTime(
                    m.seconds
                  ).map((char, i) =>
                    char === ":" ? (
                      <div
                        key={i}
                        className="colon"
                      >
                        :
                      </div>
                    ) : (
                      <div
                        key={i}
                        className="digit-box"
                      >
                        <div className="digit">
                          {char}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="target">
                  Target{" "}
                  {m.targetMinute} นาที
                </div>
              </div>

              {/* progress */}
              <div>
                <div className="progress-top">
                  <span>Progress</span>

                  <span className="progress-text">
                    {Math.floor(progress)}%
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      m.finished
                        ? "fill-red"
                        : warning
                        ? "fill-yellow"
                        : "fill-green"
                    }`}
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* input */}
              <div>
                <div className="input-label">
                  ตั้งเวลา (นาที)
                </div>

                <input
                  type="number"
                  value={m.targetMinute}
                  onChange={(e) =>
                    updateMinute(
                      m.id,
                      e.target.value
                    )
                  }
                  className="input"
                />
              </div>

              {/* buttons */}
              <div className="button-row">
                <button
                  type="button"
                  onClick={() =>
                    toggle(m.id)
                  }
                  className={`button ${
                    m.running
                      ? "button-orange"
                      : "button-green"
                  }`}
                >
                  {m.running
                    ? "Pause"
                    : "Start"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    reset(m.id)
                  }
                  className="button button-gray"
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}