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
          await navigator.wakeLock.request(
            "screen"
          );

        console.log("Wake Lock ON");
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

  // 🎵 melody
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
        type = "triangle"
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
          0.15,
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

      // 🎵 melody
      playNote(1046, 0.18, 0.0);
      playNote(1318, 0.18, 0.2);
      playNote(1567, 0.18, 0.4);
      playNote(2093, 0.35, 0.6);

      playNote(1567, 0.18, 1.1);
      playNote(1760, 0.18, 1.3);
      playNote(2093, 0.45, 1.5);
    } catch (err) {
      console.log(err);
    }
  };

  // 🗣 AI ไทย
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

  // ▶️ start / pause
  const toggle = async (id) => {
    // 🔓 unlock iPhone audio
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

  // ⌨️ เปลี่ยนเวลา
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

  // 🕒 format
  const formatTime = (sec) => {
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

    return `${h}:${m}:${s}`;
  };

  const splitTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");

    return [...h, ":", ...m, ":", ...s];
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-3 py-4 md:p-6">
      {/* header */}
      <div className="mb-4 md:mb-8 flex items-center justify-between">
        <div>
          <div className="text-zinc-500 text-sm uppercase tracking-[0.2em]">
            Production Timer
          </div>

          <h1 className="text-2xl md:text-4xl font-black mt-1">
            Oven Dashboard
          </h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-right shadow-lg">
          <div className="text-xs text-zinc-500">
            Machines
          </div>

          <div className="text-xl font-bold">
            {machines.length}
          </div>
        </div>
      </div>

      {/* cards */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-5">
        {machines.map((m) => {
          const targetSec =
            Number(m.targetMinute) * 60;

          const remain =
            targetSec - m.seconds;

          const warning =
            remain <= 60 && remain > 0;

          return (
            <div
              key={m.id}
              className={`
                relative
                overflow-hidden
                rounded-[30px]
                border
                backdrop-blur-xl
                shadow-2xl
                transition-all
                duration-300
                min-h-[42vh]
                flex
                flex-col
                justify-between
                p-4 md:p-6
                ${
                  m.finished
                    ? "bg-gradient-to-br from-red-900 to-red-700 border-red-500 danger"
                    : warning
                    ? "bg-gradient-to-br from-yellow-800 to-orange-700 border-yellow-400"
                    : "bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800"
                }
              `}
            >
              {/* glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-3xl" />

              <div className="relative z-10">
                {/* top */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-zinc-400 text-xs uppercase tracking-[0.2em] mb-1">
                      Machine
                    </div>

                    <div className="text-xl md:text-2xl font-black">
                      {m.name}
                    </div>
                  </div>

                  <div
                    className={`
                      px-3 py-1 rounded-full text-xs font-bold
                      ${
                        m.finished
                          ? "bg-red-500/20 text-red-200"
                          : m.running
                          ? "bg-green-500/20 text-green-200 glow"
                          : "bg-zinc-700/50 text-zinc-300"
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

                {/* time */}
                <div className="text-center py-2 md:py-5">
                  <div className="text-4xl md:text-6xl font-black tracking-wider font-mono">
                    <div className="flex items-center justify-center gap-1 md:gap-2">

                      {splitTime(m.seconds).map((char, i) =>
                        char === ":" ? (
                          <div key={i} className="px-1 text-red-500 text-3xl md:text-5xl font-bold">
                            :
                          </div>
                        ) : (
                          <FlipDigit key={i} value={char} />
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-zinc-400 text-sm">
                    Target {m.targetMinute} นาที
                  </div>
                </div>

                {/* progress */}
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      Progress
                    </span>
                    <span
                      className="
                        text-2xl md:text-4xl
                        font-black
                        leading-none
                        led-red
                        led-glow
                        tabular-nums
                      "
                    >
                      {Math.min(
                        Math.floor(
                          (m.seconds / targetSec) * 100
                        ),
                        100
                      )}
                      <span className="text-lg md:text-2xl ml-1">
                        %
                      </span>
                    </span>
                  </div>

                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`
                        h-full rounded-full transition-all duration-500
                        ${
                          m.finished
                            ? "bg-red-400"
                            : warning
                            ? "bg-yellow-300"
                            : "bg-green-400"
                        }
                      `}
                      style={{
                        width: `${Math.min(
                          (m.seconds /
                            targetSec) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* input */}
                <div className="mb-5">
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
                      bg-black/40
                      border
                      border-zinc-700
                      rounded-2xl
                      px-4
                      py-3
                      text-lg
                      outline-none
                      focus:border-green-400
                    "
                  />
                </div>
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
                    rounded-2xl
                    py-3 md:py-4
                    text-base md:text-lg
                    font-black
                    shadow-lg
                    transition-all
                    active:scale-95
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
                    rounded-2xl
                    py-3 md:py-4
                    text-base md:text-lg
                    font-black
                    shadow-lg
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