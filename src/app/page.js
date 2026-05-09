"use client";

import { useEffect, useRef, useState } from "react";

const defaultMachines = [
  {
    id: 1,
    name: "เครื่อง A",
    targetMinute: 1,
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

  // 🎵 alarm melody
  const playAlarm = () => {
    try {
      const audioContext =
        new (window.AudioContext ||
          window.webkitAudioContext)();

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
      playNote(1046, 0.18, 0.00);
      playNote(1318, 0.18, 0.20);
      playNote(1567, 0.18, 0.40);
      playNote(2093, 0.35, 0.60);

      playNote(1567, 0.18, 1.10);
      playNote(1760, 0.18, 1.30);
      playNote(2093, 0.45, 1.50);

    } catch (err) {
      console.log(err);
    }
  };

  // 🗣 AI พูดไทย
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
    // 🔓 unlock audio/speech iPhone
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
              targetMinute: value,
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

    const s = String(sec % 60).padStart(2, "0");

    return `${h}:${m}:${s}`;
  };

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Oven Timer
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                rounded-3xl
                p-6
                border
                shadow-xl
                transition-all
                ${
                  m.finished
                    ? "bg-red-800 border-red-500"
                    : warning
                    ? "bg-yellow-700 border-yellow-400"
                    : "bg-zinc-900 border-zinc-700"
                }
              `}
            >
              {/* ชื่อ */}
              <div className="text-2xl font-bold mb-4">
                {m.name}
              </div>

              {/* เวลา */}
              <div className="text-center text-5xl font-mono mb-6">
                {formatTime(m.seconds)}
              </div>

              {/* ตั้งเวลา */}
              <div className="mb-6">
                <div className="text-sm mb-2 text-zinc-300">
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
                    bg-zinc-800
                    border
                    border-zinc-600
                    rounded-2xl
                    px-4
                    py-3
                    text-xl
                    outline-none
                  "
                />
              </div>

              {/* progress */}
              <div className="mb-6">
                <div className="w-full h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full
                      transition-all
                      ${
                        m.finished
                          ? "bg-red-500"
                          : "bg-green-500"
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

              {/* buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toggle(m.id)
                  }
                  className="
                    flex-1
                    bg-green-500
                    rounded-2xl
                    py-4
                    text-xl
                    font-bold
                    active:scale-95
                  "
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
                    py-4
                    text-xl
                    font-bold
                    active:scale-95
                  "
                >
                  Reset
                </button>
              </div>

              {/* status */}
              <div className="mt-4 text-center text-sm text-zinc-300">
                {m.finished
                  ? "ครบเวลาแล้ว"
                  : m.running
                  ? "กำลังทำงาน"
                  : "หยุดอยู่"}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}