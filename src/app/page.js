"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import FlipDigit from "./components/FlipDigit";

const defaultMachines = [
  {
    id: 1,
    name: "เครื่อง A",
    targetMinute: 3,
  },
  {
    id: 2,
    name: "เครื่อง B",
    targetMinute: 5,
  },
  {
    id: 3,
    name: "เครื่อง C",
    targetMinute: 10,
  },
  {
    id: 4,
    name: "เครื่อง D",
    targetMinute: 15,
  },
];

export default function Page() {
  const [machines, setMachines] =
    useState(
      defaultMachines.map((m) => ({
        ...m,
        seconds: 0,
        running: false,
        finished: false,

        // 🔔 voice flags
        announced2m: false,
        announced1m: false,
        announced30s: false,
      }))
    );

  const wakeLockRef = useRef(null);

  // 🔆 keep screen awake
  const enableWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current =
          await navigator.wakeLock.request(
            "screen"
          );
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 🗣 speak thai
  const speakThai = (text) => {
    try {
      speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = "th-TH";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      speechSynthesis.speak(utterance);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔊 alarm
  const playAlarm = () => {
    try {
      const audioContext =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

      const playNote = (
        frequency,
        duration,
        delay,
        type = "square"
      ) => {
        const oscillator =
          audioContext.createOscillator();

        const gainNode =
          audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value =
          frequency;

        oscillator.connect(gainNode);

        gainNode.connect(
          audioContext.destination
        );

        const start =
          audioContext.currentTime + delay;

        gainNode.gain.setValueAtTime(
          0,
          start
        );

        gainNode.gain.linearRampToValueAtTime(
          0.2,
          start + 0.02
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

      // 🚨 industrial alarm
      playNote(880, 0.2, 0);
      playNote(1200, 0.2, 0.25);
      playNote(880, 0.2, 0.5);
      playNote(1600, 0.5, 0.75);

      playNote(1200, 0.2, 1.4);
      playNote(1600, 0.2, 1.7);
      playNote(2200, 0.5, 2);
    } catch (err) {
      console.log(err);
    }
  };

  // ⏱ timer
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines((prev) =>
        prev.map((m) => {
          if (!m.running) return m;

          const next =
            m.seconds + 1;

          const targetSec =
            m.targetMinute * 60;

          const remain =
            targetSec - next;

          // 🔔 2 minute warning
          if (
            remain <= 120 &&
            !m.announced2m &&
            targetSec > 120
          ) {
            speakThai(
              `${m.name} เหลือเวลาอีก 2 นาทีค่ะ`
            );

            return {
              ...m,
              seconds: next,
              announced2m: true,
            };
          }

          // 🔔 1 minute warning
          if (
            remain <= 60 &&
            !m.announced1m
          ) {
            speakThai(
              `${m.name} เหลือเวลาอีก 1 นาทีค่ะ`
            );

            return {
              ...m,
              seconds: next,
              announced1m: true,
            };
          }

          // 🔔 30 sec warning
          if (
            remain <= 30 &&
            !m.announced30s
          ) {
            speakThai(
              `${m.name} เหลืออีก 30 วินาทีค่ะ`
            );

            return {
              ...m,
              seconds: next,
              announced30s: true,
            };
          }

          // 🔥 finish
          if (
            next >= targetSec &&
            !m.finished
          ) {
            playAlarm();

            speakThai(
              `${m.name} ถึงเวลาแล้วค่ะ`
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

    return () =>
      clearInterval(interval);
  }, []);

  // ▶️ start / pause
  const toggle = async (id) => {
    // 🔓 unlock ios audio
    try {
      const unlock =
        new SpeechSynthesisUtterance("");

      speechSynthesis.speak(unlock);
    } catch (e) {}

    await enableWakeLock();

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

              announced2m: false,
              announced1m: false,
              announced30s: false,
            }
          : m
      )
    );
  };

  // ✏️ update
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

    return [
      ...h,
      ":",
      ...m,
      ":",
      ...s,
    ];
  };

  return (
    <main className="min-h-screen bg-[#050505] p-2 md:p-4">
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-2
          md:gap-4
        "
      >
        {machines.map((m) => {
          const targetSec =
            m.targetMinute * 60;

          const progress =
            Math.min(
              (m.seconds /
                targetSec) *
                100,
              100
            ) || 0;

          const remain =
            targetSec - m.seconds;

          const warning =
            remain <= 60 &&
            remain > 0;

          return (
            <div
              key={m.id}
              className={`
                relative
                overflow-hidden

                rounded-3xl
                border

                p-3
                md:p-5

                flex
                flex-col
                justify-between

                min-h-[48vh]

                transition-all
                duration-500

                shadow-2xl

                ${
                  m.finished
                    ? "bg-red-950 border-red-500 animate-pulse"
                    : warning
                    ? "bg-yellow-950 border-yellow-500"
                    : "bg-zinc-950 border-zinc-800"
                }
              `}
            >
              {/* glow */}
              <div
                className={`
                  absolute
                  inset-0
                  opacity-20
                  blur-3xl

                  ${
                    m.finished
                      ? "bg-red-500"
                      : warning
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }
                `}
              />

              {/* top */}
              <div className="relative z-10 flex items-center justify-between mb-3">
                <div>
                  <div className="text-zinc-500 text-xs">
                    MACHINE
                  </div>

                  <div className="text-lg md:text-2xl font-black">
                    {m.name}
                  </div>
                </div>

                <div
                  className={`
                    text-xs
                    font-bold
                    px-3
                    py-1
                    rounded-full

                    ${
                      m.running
                        ? "bg-green-500 text-black animate-pulse"
                        : "bg-zinc-800 text-zinc-300"
                    }
                  `}
                >
                  {m.finished
                    ? "DONE"
                    : m.running
                    ? "RUNNING"
                    : "IDLE"}
                </div>
              </div>

              {/* CLOCK */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <div className="flex items-center justify-center gap-1 md:gap-2">
                  {splitTime(
                    m.seconds
                  ).map((char, i) =>
                    char === ":" ? (
                      <div
                        key={i}
                        className="
                          text-red-500
                          text-5xl
                          md:text-7xl
                          font-black
                          px-1
                          animate-pulse
                        "
                      >
                        :
                      </div>
                    ) : (
                      <FlipDigit
                        key={i}
                        value={char}
                      />
                    )
                  )}
                </div>
              </div>

              {/* progress */}
              <div className="relative z-10 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-zinc-500 text-xs">
                    TARGET
                  </div>

                  <div className="text-white font-bold">
                    {m.targetMinute} นาที
                  </div>
                </div>

                <div className="h-5 bg-black rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className={`
                      h-full
                      transition-all
                      duration-500

                      ${
                        m.finished
                          ? "bg-red-500"
                          : warning
                          ? "bg-yellow-400"
                          : "bg-green-500"
                      }
                    `}
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="text-center text-3xl font-black mt-2">
                  {Math.floor(progress)}%
                </div>
              </div>

              {/* controls */}
              <div className="relative z-10 grid grid-cols-3 gap-2 mt-4">
                <input
                  type="number"
                  value={m.targetMinute}
                  onChange={(e) =>
                    updateMinute(
                      m.id,
                      e.target.value
                    )
                  }
                  className="
                    h-12
                    rounded-2xl
                    bg-black
                    border
                    border-zinc-700
                    text-center
                    text-lg
                    font-bold
                    outline-none
                  "
                />

                <button
                  onClick={() =>
                    toggle(m.id)
                  }
                  className={`
                    h-12
                    rounded-2xl
                    font-black
                    text-lg
                    active:scale-95
                    transition-all

                    ${
                      m.running
                        ? "bg-orange-500"
                        : "bg-green-500 text-black"
                    }
                  `}
                >
                  {m.running
                    ? "Pause"
                    : "Start"}
                </button>

                <button
                  onClick={() =>
                    reset(m.id)
                  }
                  className="
                    h-12
                    rounded-2xl
                    bg-zinc-800
                    font-black
                    text-lg
                    active:scale-95
                  "
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