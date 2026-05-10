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

  const wakeLockRef = useRef(null);
  const audioRef = useRef(null);

  // 🔆 wake lock
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
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current) {
        audioRef.current =
          new AudioContextClass();
      }

      const audioContext =
        audioRef.current;

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
          0.18,
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

      playNote(1200, 0.15, 0);
      playNote(1600, 0.15, 0.2);
      playNote(2200, 0.35, 0.4);
    } catch (err) {
      console.log(err);
    }
  };

  // 🗣 speak
  const speakThai = (text) => {
    try {
      if (!window.speechSynthesis) return;

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
    <main className="min-h-screen bg-black text-white p-2 md:p-4">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-[0.25em]">
            Production Timer
          </div>

          <h1 className="text-xl md:text-3xl font-black">
            Oven Dashboard
          </h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
          <div className="text-[10px] text-zinc-500">
            Machines
          </div>

          <div className="text-lg font-black">
            {machines.length}
          </div>
        </div>
      </div>

      {/* cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
              className={`
                rounded-3xl
                border
                p-3 md:p-4
                flex
                flex-col
                gap-3
                shadow-2xl
                ${
                  m.finished
                    ? "bg-red-950 border-red-600"
                    : warning
                    ? "bg-yellow-950 border-yellow-500"
                    : "bg-zinc-950 border-zinc-800"
                }
              `}
            >
              {/* top */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Machine
                  </div>

                  <div className="text-lg md:text-2xl font-black">
                    {m.name}
                  </div>
                </div>

                <div
                  className={`
                    px-3 py-1 rounded-full text-xs font-black
                    ${
                      m.finished
                        ? "bg-red-500 text-white"
                        : m.running
                        ? "bg-green-500 text-black"
                        : "bg-zinc-700 text-zinc-200"
                    }
                  `}
                >
                  {m.finished
                    ? "FINISHED"
                    : m.running
                    ? "RUNNING"
                    : "IDLE"}
                </div>
              </div>

              {/* TIMER */}
              <div className="bg-black rounded-3xl border border-zinc-800 px-2 py-4 md:py-5">
                <div className="flex items-center justify-center gap-1">
                  {splitTime(m.seconds).map(
                    (char, i) =>
                      char === ":" ? (
                        <div
                          key={i}
                          className="
                            text-[42px]
                            md:text-[72px]
                            font-black
                            leading-none
                            text-red-500
                            mb-1
                          "
                        >
                          :
                        </div>
                      ) : (
                        <div
                          key={i}
                          className="
                            w-[44px]
                            h-[62px]
                            md:w-[72px]
                            md:h-[100px]
                            rounded-xl
                            border
                            border-zinc-800
                            bg-[#050505]
                            flex
                            items-center
                            justify-center
                            overflow-hidden
                          "
                        >
                          <div
                            className="
                              text-[40px]
                              md:text-[72px]
                              font-black
                              leading-none
                              text-red-500
                              tracking-tight
                              select-none
                            "
                            style={{
                              fontFamily:
                                "'Courier New', monospace",
                              textShadow:
                                "0 0 8px rgba(255,0,0,0.9)",
                              transform:
                                "translateY(-2px)",
                            }}
                          >
                            {char}
                          </div>
                        </div>
                      )
                  )}
                </div>

                <div className="text-center mt-3 text-zinc-500 text-sm md:text-base">
                  Target{" "}
                  <span className="text-white font-bold">
                    {m.targetMinute}
                  </span>{" "}
                  นาที
                </div>
              </div>

              {/* progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-zinc-400">
                    Progress
                  </div>

                  <div className="text-2xl md:text-3xl font-black text-white">
                    {Math.floor(progress)}%
                  </div>
                </div>

                <div className="h-4 bg-black rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className={`
                      h-full transition-all duration-500
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
              </div>

              {/* input */}
              <div>
                <div className="text-sm text-zinc-400 mb-2">
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
                    rounded-2xl
                    bg-black
                    border
                    border-zinc-700
                    px-4
                    py-3
                    text-lg
                    outline-none
                    text-white
                  "
                />
              </div>

              {/* buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toggle(m.id)
                  }
                  className={`
                    flex-1
                    py-3
                    rounded-2xl
                    font-black
                    text-base
                    active:scale-95
                    transition-all
                    ${
                      m.running
                        ? "bg-orange-500 text-black"
                        : "bg-green-500 text-black"
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
                    py-3
                    rounded-2xl
                    font-black
                    text-base
                    bg-zinc-700
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