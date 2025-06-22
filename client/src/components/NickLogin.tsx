import React, { useState, useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import logo from "@/assets/goccord-logo.png";
import MusicPlayer from "@/components/music/MusicPlayer";

export default function NickLogin({ onLogin }: { onLogin: (nickname: string) => void }) {
  const [nickname, setNickname] = useState("");

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  const particlesOptions = {
    particles: {
      number: { value: 56, density: { enable: true, value_area: 1100 } },
      color: { value: ["#ffe099", "#4dc9fa", "#fff"] },
      shape: { type: "circle" },
      opacity: { value: 0.22, random: true },
      size: { value: 3.5, random: true },
      line_linked: {
        enable: true,
        distance: 110,
        color: "#ffe09966",
        opacity: 0.19,
        width: 1.2
      },
      move: { enable: true, speed: 1.1, direction: "none" as const, straight: false }
    },
    interactivity: {
      detect_on: "canvas" as const,
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: false },
        resize: true
      },
      modes: {
        grab: { distance: 130, line_linked: { opacity: 0.32 } }
      }
    },
    retina_detect: true
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onLogin(nickname.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#101320] overflow-hidden">
      {/* Particles arka plan */}
      <Particles id="particles-js" className="absolute inset-0 z-0" init={particlesInit} options={particlesOptions} />
      {/* Ana kart */}
      <main className="glass max-w-md w-full flex flex-col relative z-10 border-[#23253a] border pt-10 pr-10 pb-10 pl-10 shadow-2xl items-center">
        {/* Logo */}
        <div className="fade-in fade-in-1 flex w-28 h-28 logo-emoji border rounded-full mb-7 items-center justify-center overflow-hidden">
          <img src={logo} alt="Goçcord Logo" className="w-full h-full object-cover" />
        </div>
        {/* Başlık */}
        <h2 className="main-title fade-in fade-in-2 leading-tight select-none font-semibold text-white tracking-tight text-center mb-2">Gocccuuum Hoşgeldin</h2>
        <div className="divider"></div>
        {/* Giriş Formu */}
        <form className="fade-in fade-in-3 w-full flex flex-col gap-6" autoComplete="off" onSubmit={handleSubmit}>
          <label className="w-full">
            <span className="block text-sm font-medium text-[#aab7e7] mb-2 pl-1">Takma Ad (Nickname)</span>
            <input
              id="nickname"
              required
              spellCheck={false}
              name="nickname"
              maxLength={22}
              placeholder="Nickini giriver gocum"
              className="input-glow w-full bg-[#15182a] text-[1.15rem] placeholder-[#7c8dbb] transition focus:ring-0 outline-none font-medium text-[#e5eaff] border-[#23253a] border rounded-lg pt-3 pr-5 pb-3 pl-5"
              autoComplete="off"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="btn-shine w-full py-3 rounded-xl flex items-center justify-center gap-2 text-lg font-semibold tracking-tight text-[#e4eaff] shadow-lg transition cursor-pointer select-none group relative overflow-hidden"
          >
            <span>Giriş Yap</span>
            <span>
              {/* Lucide mic-2 ikonu SVG */}
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </span>
          </button>
        </form>
        {/* Alt yazı */}
        <div className="text-[#6a7bfdbb] select-none text-xs tracking-wide text-center mt-7">Goçlarla gerçek zamanlı s2şşşşşşş</div>
      </main>
    </div>
  );
} 