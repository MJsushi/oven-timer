"use client";

import { useEffect, useRef, useState } from "react";
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

  const wakeLockRef = useRef(null);

  // 🔆 กันหน้าจอดับ
  const enableWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current =
          await navigator.wakeLock.request("screen");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ⏱ timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines((prev) =>
        prev.map((m) => {
          if (!m.running) return m;

          const next = m.seconds + 1;
          const targetSec =
            Number(m.targetMinute) * 60;

          // 🔔 ครบเวลา
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

  // 🎵 alarm
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
        delay
      ) => {
        const oscillator =
          audioContext.createOscillator();

        const gainNode =
          audioContext.createGain();

        oscillator.type = "triangle";
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
          0.12,
          start + 0.02
        );

        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          start + duration
        );

        oscillator.start(start);
        oscillator.stop(start + duration);
      };

      playNote(1046, 0.18, 0.0);
      playNote(1318, 0.18, 0.2);
      playNote(1567, 0.18, 0.4);
      playNote(2093, 0.35, 0.6);
    } catch (err) {
      console.log(err);
    }
  };

  // 🗣 speech
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

  // ▶️ start/pause
  const toggle = async (id) => {
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
            }
          : m
      )
    );
  };

  // ⌨️ update minute
  const updateMinute = (id, value) => {
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

  // 🕒 split time
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
    <main className="min-h-screen bg-[#050505] text-white px-2 py-2 md:px-4 md:py-4">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-500">
            Production Timer
          </div>

          <h1 className="text-lg md:text-3xl font-black">
            Oven Dashboard
          </h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1 shadow-lg">
          <div className="text-[10px] text-zinc-500">
            MACHINES
          </div>

          <div className="text-lg md:text-2xl font-black text-center">
            {machines.length}
          </div>
        </div>
      </div>

      {/* cards */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-2 md:gap-4
        "
      >
        {machines.map((m) => {
          const targetSec =
            Number(m.targetMinute) * 60;

          const remain =
            targetSec - m.seconds;

          const warning =
            remain <= 60 && remain > 0;

          const progress = Math.min(
            Math.floor(
              (m.seconds / targetSec) * 100
            ),
            100
          );

          return (
            <div
              key={m.id}
              className={`
                relative
                overflow-hidden
                rounded-2xl
                border
                shadow-2xl
                p-3 md:p-4
                flex
                flex-col
                justify-between
                min-h-[280px]
                md:min-h-[320px]
                transition-all
                duration-300
                ${
                  m.finished
                    ? "bg-gradient-to-br from-red-950 to-red-800 border-red-500"
                    : warning
                    ? "bg-gradient-to-br from-yellow-900 to-orange-800 border-yellow-400"
                    : "bg-gradient-to-br from-zinc-900 to-black border-zinc-800"
                }
              `}
            >
              {/* glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_45%)] pointer-events-none" />

              {/* top */}
              <div className="relative z-10 flex items-start justify-between mb-2">
                <div>
                  <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-500">
                    MACHINE
                  </div>

                  <div className="text-lg md:text-2xl font-black">
                    {m.name}
                  </div>
                </div>

                <div
                  className={`
                    px-2 py-1 rounded-full text-[10px] md:text-xs font-bold
                    ${
                      m.finished
                        ? "bg-red-500/20 text-red-200"
                        : m.running
                        ? "bg-green-500/20 text-green-200"
                        : "bg-zinc-700/60 text-zinc-300"
                    }
                  `}
                >
                  {m.finished
                    ? "DONE"
                    : m.running
                    ? "RUN"
                    : "IDLE"}
                </div>
              </div>

              {/* timer */}
              <div className="relative z-10 py-2">
                <div className="flex items-center justify-center gap-[2px] md:gap-1">
                  {splitTime(m.seconds).map(
                    (char, i) =>
                      char === ":" ? (
                        <div
                          key={i}
                          className="
                            text-red-500
                            text-2xl
                            md:text-4xl
                            font-black
                            mb-1
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

                <div className="mt-2 text-center text-[11px] md:text-sm text-zinc-400">
                  Target{" "}
                  <span className="text-white font-bold">
                    {m.targetMinute}
                  </span>{" "}
                  นาที
                </div>
              </div>

              {/* progress */}
              <div className="relative z-10 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs text-zinc-500 uppercase">
                    Progress
                  </span>

                  <span className="text-lg md:text-2xl font-black text-white tabular-nums">
                    {progress}%
                  </span>
                </div>

                <div className="w-full h-3 md:h-4 rounded-full overflow-hidden bg-black/50 border border-zinc-800">
                  <div
                    className={`
                      h-full
                      transition-all
                      duration-500
                      ${
                        m.finished
                          ? "bg-red-400"
                          : warning
                          ? "bg-yellow-300"
                          : "bg-green-400"
                      }
                    `}
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* input */}
              <div className="relative z-10 mb-3">
                <div className="text-[11px] md:text-sm text-zinc-400 mb-1">
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
                  className="
                    w-full
                    bg-black/40
                    border border-zinc-700
                    rounded-xl
                    px-3
                    py-2
                    md:py-3
                    text-base md:text-lg
                    outline-none
                    focus:border-green-400
                  "
                />
              </div>

              {/* buttons */}
              <div className="relative z-10 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toggle(m.id)
                  }
                  className={`
                    flex-1
                    rounded-xl
                    py-2.5 md:py-3
                    text-sm md:text-lg
                    font-black
                    transition-all
                    active:scale-95
                    shadow-lg
                    ${
                      m.running
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }
                  `}
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
                  className="
                    flex-1
                    bg-zinc-700
                    rounded-xl
                    py-2.5 md:py-3
                    text-sm md:text-lg
                    font-black
                    active:scale-95
                    shadow-lg
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