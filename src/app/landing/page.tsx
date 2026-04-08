"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const excuses = [
  {
    id: "01",
    text: "I will do it later.",
    verdict: "Verdict: Classic. Pathetic.",
  },
  {
    id: "02",
    text: "I need more coffee.",
    verdict: "Verdict: Caffeine will not save you.",
  },
  {
    id: "03",
    text: "Just one more video.",
    verdict: "Verdict: 3 hours later. Nothing done.",
  },
  {
    id: "04",
    text: "I work better under pressure.",
    verdict: "Verdict: You do not. You proved it.",
  },
  {
    id: "05",
    text: "I am not feeling motivated.",
    verdict: "Verdict: Machines do not feel. They execute.",
  },
  {
    id: "06",
    text: "Tomorrow is a fresh start.",
    verdict: "Verdict: You said that yesterday.",
  },
];

const timelineSteps = [
  {
    step: "Step 01",
    title: "Commit",
    desc: "Each morning, declare your tasks. Specific timed commitments. The system records everything.",
  },
  {
    step: "Step 02",
    title: "Execute",
    desc: "Enter the Roast Chamber. Focus only. Every distraction is logged. No escape.",
  },
  {
    step: "Step 03",
    title: "Get Roasted",
    desc: "Mid-session check-ins deliver direct performance feedback. Brutal, specific, accurate.",
  },
  {
    step: "Step 04",
    title: "Daily Judgment",
    desc: "At day end, The Chronicler delivers your verdict and patterns. Permanent record.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [time, setTime] = useState("--:--:--");
  const [progress, setProgress] = useState(0);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const next = docH <= 0 ? 0 : (window.scrollY / docH) * 100;
      setProgress(Math.min(100, Math.max(0, next)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const revealEls = Array.from(
      document.querySelectorAll(".rl-reveal, .rl-reveal-left"),
    );
    const steps = Array.from(document.querySelectorAll(".rl-timeline-step"));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            stepObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
    steps.forEach((el) => stepObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      stepObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline) return;

    let glitchInterval: ReturnType<typeof setInterval> | null = null;

    const onEnter = () => {
      glitchInterval = setInterval(() => {
        headline.style.textShadow = `${Math.random() * 6 - 3}px 0 red, ${Math.random() * 6 - 3}px 0 cyan`;
        setTimeout(() => {
          headline.style.textShadow = "none";
        }, 80);
      }, 200);
    };

    const onLeave = () => {
      if (glitchInterval) {
        clearInterval(glitchInterval);
        glitchInterval = null;
      }
      headline.style.textShadow = "none";
    };

    headline.addEventListener("mouseenter", onEnter);
    headline.addEventListener("mouseleave", onLeave);

    return () => {
      if (glitchInterval) clearInterval(glitchInterval);
      headline.removeEventListener("mouseenter", onEnter);
      headline.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="rl-root">
      <div className="rl-progress" style={{ width: `${progress}%` }} />

      <nav className="rl-nav">
        <a className="rl-nav-logo" href="#hero">
          ROASTLE<span>.</span>AI
        </a>
        <div className="rl-nav-links">
          {!user && (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/plan"
              fallbackRedirectUrl="/plan"
            >
              <button className="rl-btn-ghost">Log In</button>
            </SignInButton>
          )}
          {!user && (
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/plan"
              fallbackRedirectUrl="/plan"
            >
              <button className="rl-btn-cta">
                <span>Stop Being Mid</span>
              </button>
            </SignUpButton>
          )}
          {user && (
            <button className="rl-btn-cta" onClick={() => router.push("/plan")}>
              <span>Enter Chamber</span>
            </button>
          )}
        </div>
      </nav>

      <section id="hero" className="rl-hero">
        <div className="rl-hero-eyebrow">
          // System initialized - Accountability protocol active
        </div>
        <h1 className="rl-hero-headline" ref={headlineRef}>
          Stop Being
          <br />
          <span className="accent">Mid,</span>
          <br />
          Start Being
          <br />a Machine.
        </h1>
        <p className="rl-hero-sub">
          ROASTLE.AI weaponizes accountability. Plan your day, enter the Roast
          Chamber, and execute - or get burned. No mercy. No excuses. Just
          results.
        </p>

        <div className="rl-hero-cta-row">
          {!user && (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/plan"
              fallbackRedirectUrl="/plan"
            >
              <button className="rl-btn-hero">Start Your Ritual</button>
            </SignInButton>
          )}
          {user && (
            <button
              className="rl-btn-hero"
              onClick={() => router.push("/plan")}
            >
              Enter Chamber
            </button>
          )}
          <div className="rl-hero-stat">
            <strong>14,291</strong>
            machines currently active
          </div>
        </div>

        <div className="rl-hero-deco">
          <div className="rl-glitch-box">
            <div className="rl-terminal-text">
              $ roastle --init{"\n"}&gt; Scanning excuses...{"\n"}&gt; Found: 47
              unfinished tasks{"\n"}&gt; Mode: AGGRESSIVE{"\n"}&gt; Roaster:
              ONLINE ████████{"\n"}&gt; Chronicler: WATCHING{"\n"}&gt; Status:
              YOU ARE LATE.{"\n\n"}[ENTER CHAMBER TO PROCEED]{"\n"}_
            </div>
          </div>
        </div>
      </section>

      <section id="shame" className="rl-section rl-shame">
        <div className="rl-section-label">02 - Wall of Shame</div>
        <h2 className="rl-shame-headline rl-reveal">
          Why you fail:
          <br />
          Your to-do list
          <br />
          is <em>too polite.</em>
        </h2>
        <div className="rl-excuse-list">
          {excuses.map((item, i) => (
            <div
              key={item.id}
              className="rl-excuse-item rl-reveal"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="rl-excuse-num">{item.id}</div>
              <div className="rl-excuse-text">&quot;{item.text}&quot;</div>
              <div className="rl-excuse-verdict">X {item.verdict}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="solution" className="rl-section rl-solution">
        <div className="rl-section-label">03 - The System</div>
        <h2 className="rl-solution-headline rl-reveal">
          Pressure.
          <br />
          Contrast.
          <br />
          Consequence.
        </h2>

        <div className="rl-agents-grid">
          <div className="rl-agent-card rl-agent-card-red rl-reveal">
            <div className="rl-agent-tag">Agent 01</div>
            <div className="rl-agent-name">The Roaster</div>
            <div className="rl-agent-role">Real-time Accountability Engine</div>
            <div className="rl-agent-desc">
              Your AI drill sergeant. Tracks commitments, monitors execution,
              and delivers direct feedback when you fall behind.
            </div>
          </div>
          <div className="rl-agent-card rl-reveal">
            <div className="rl-agent-tag">Agent 02</div>
            <div className="rl-agent-name">The Chronicler</div>
            <div className="rl-agent-role">Daily Judgment System</div>
            <div className="rl-agent-desc">
              Every evening, The Chronicler renders a verdict on your day.
              Patterns exposed. Excuses archived.
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="rl-section rl-features">
        <div className="rl-section-label">04 - Arsenal</div>
        <h2 className="rl-shame-headline rl-reveal" style={{ marginBottom: 0 }}>
          Features that
          <br />
          do not take no
          <br />
          for an answer.
        </h2>

        <div className="rl-bento-grid">
          <div className="rl-bento-cell rl-reveal">
            <div className="rl-bento-icon">⚡</div>
            <div className="rl-bento-tag">01 - Planning</div>
            <div className="rl-bento-title">Planning Ritual</div>
            <div className="rl-bento-desc">
              Structured daily commitment. No random hopping. You commit, system
              locks it.
            </div>
          </div>

          <div className="rl-bento-cell rl-bento-chamber rl-bento-span2 rl-bento-tall rl-reveal">
            <div className="rl-chamber-badge">LIVE</div>
            <div className="rl-bento-icon">🔴</div>
            <div className="rl-bento-tag" style={{ color: "var(--rl-red)" }}>
              02 - Focus Mode
            </div>
            <div className="rl-bento-title">The Roast Chamber</div>
            <div className="rl-bento-desc">
              Fullscreen focus. Every minute away is logged and reported.
            </div>
          </div>

          <div className="rl-bento-cell rl-reveal">
            <div className="rl-bento-icon">📜</div>
            <div className="rl-bento-tag">03 - Evening</div>
            <div className="rl-bento-title">The Chronicler</div>
            <div className="rl-bento-desc">
              Daily judgment with score, streak tracking, and pattern analysis.
            </div>
          </div>

          <div className="rl-bento-cell rl-reveal">
            <div className="rl-bento-icon">🔥</div>
            <div className="rl-bento-tag">04 - Progress</div>
            <div className="rl-bento-title">Streak Wars</div>
            <div className="rl-bento-desc">
              Do not break the chain. Miss a day and watch it burn.
            </div>
          </div>

          <div className="rl-bento-cell rl-reveal">
            <div className="rl-bento-icon">◈</div>
            <div className="rl-bento-tag">05 - Analytics</div>
            <div className="rl-bento-title">Brutal Analytics</div>
            <div className="rl-bento-desc">
              Data that exposes patterns. The numbers do not lie.
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="rl-section rl-how">
        <div className="rl-section-label">05 - Protocol</div>
        <h2 className="rl-shame-headline rl-reveal">
          Four steps to
          <br />
          becoming a
          <br />
          machine.
        </h2>

        <div className="rl-timeline">
          {timelineSteps.map((item, idx) => (
            <div key={item.step} className="rl-timeline-step">
              <div className="rl-timeline-dot" />
              <div className="rl-step-num">{item.step}</div>
              <div
                className="rl-step-title"
                style={idx === 2 ? { color: "var(--rl-red)" } : undefined}
              >
                {item.title}
              </div>
              <div className="rl-step-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="rl-section rl-cta">
        <h2 className="rl-cta-headline">The Chronicler is waiting.</h2>
        <p className="rl-cta-sub">
          Will you be a machine or a statistic? Every hour you delay is another
          data point in your report.
        </p>
        {!user && (
          <SignUpButton
            mode="modal"
            forceRedirectUrl="/plan"
            fallbackRedirectUrl="/plan"
          >
            <button className="rl-btn-join">Join the Ritual</button>
          </SignUpButton>
        )}
        {user && (
          <button className="rl-btn-join" onClick={() => router.push("/plan")}>
            Enter Plan
          </button>
        )}
      </section>

      <footer className="rl-footer">
        <div className="rl-footer-logo">
          ROASTLE<span>.</span>AI
        </div>
        <div className="rl-footer-links">
          <a href="#solution">System</a>
          <a href="#features">Features</a>
          <a href="#how">Protocol</a>
          <a href="#cta">Start</a>
        </div>
        <div className="rl-footer-meta">
          <div className="rl-system-status">
            <div className="rl-status-dot" />
            System Status: Aggressive
          </div>
          <div className="rl-clock">{time}</div>
        </div>
      </footer>

      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }

        .rl-root {
          --rl-black: #000;
          --rl-white: #fff;
          --rl-red: #ff0000;
          --rl-acid: #ccff00;
          --rl-midgray: #222;
          --rl-textgray: #888;
          background: var(--rl-black);
          color: var(--rl-white);
          overflow-x: hidden;
          position: relative;
          cursor: crosshair;
        }

        .rl-root::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
          opacity: 0.35;
        }

        .rl-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: var(--rl-red);
          z-index: 10000;
          box-shadow: 0 0 8px var(--rl-red);
          transition: width 0.1s linear;
        }

        .rl-nav {
          position: fixed;
          top: 3px;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1.2rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .rl-nav-logo {
          font-size: 1.6rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          color: var(--rl-white);
          text-decoration: none;
        }

        .rl-nav-logo span {
          color: var(--rl-red);
        }

        .rl-nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rl-btn-ghost,
        .rl-btn-cta,
        .rl-btn-hero,
        .rl-btn-join {
          cursor: crosshair;
          text-transform: uppercase;
          transition: all 0.2s;
        }

        .rl-btn-ghost {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--rl-white);
          padding: 0.5rem 1.2rem;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }

        .rl-btn-ghost:hover {
          border-color: var(--rl-white);
          background: rgba(255, 255, 255, 0.05);
        }

        .rl-btn-cta {
          background: var(--rl-red);
          border: none;
          color: var(--rl-white);
          padding: 0.55rem 1.4rem;
          font-weight: 900;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          position: relative;
          overflow: hidden;
        }

        .rl-btn-cta::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--rl-acid);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }

        .rl-btn-cta:hover::before {
          transform: scaleX(1);
        }

        .rl-btn-cta span {
          position: relative;
          z-index: 1;
        }

        .rl-btn-cta:hover span {
          color: var(--rl-black);
        }

        .rl-section {
          position: relative;
          overflow: hidden;
        }

        .rl-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 10rem 2.5rem 6rem;
          border-bottom: 1px solid var(--rl-midgray);
        }

        .rl-hero-eyebrow {
          font-size: 0.75rem;
          letter-spacing: 0.25em;
          color: var(--rl-red);
          text-transform: uppercase;
          margin-bottom: 2rem;
          opacity: 0;
          animation: rl-fade-up 0.6s 0.3s forwards;
        }

        .rl-hero-headline {
          font-size: clamp(3.5rem, 9vw, 9rem);
          line-height: 0.92;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          max-width: 14ch;
          opacity: 0;
          font-weight: 900;
          animation: rl-glitch-in 0.8s 0.5s forwards;
        }

        .rl-hero-headline .accent {
          color: var(--rl-red);
        }

        .rl-hero-sub {
          margin-top: 2.5rem;
          font-size: clamp(0.85rem, 1.5vw, 1.05rem);
          color: var(--rl-textgray);
          max-width: 55ch;
          line-height: 1.7;
          opacity: 0;
          animation: rl-fade-up 0.6s 0.9s forwards;
        }

        .rl-hero-cta-row {
          margin-top: 3rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
          opacity: 0;
          animation: rl-fade-up 0.6s 1.1s forwards;
        }

        .rl-btn-hero {
          background: var(--rl-white);
          color: var(--rl-black);
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          letter-spacing: 0.12em;
          border: none;
          font-weight: 900;
        }

        .rl-btn-hero:hover {
          background: var(--rl-acid);
          box-shadow:
            0 0 40px rgba(204, 255, 0, 0.4),
            0 0 80px rgba(204, 255, 0, 0.15);
          transform: translateY(-2px);
        }

        .rl-hero-stat {
          font-size: 0.7rem;
          color: var(--rl-textgray);
          letter-spacing: 0.1em;
        }

        .rl-hero-stat strong {
          color: var(--rl-acid);
          font-size: 1.2rem;
          display: block;
          letter-spacing: 0.05em;
        }

        .rl-hero-deco {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 40%;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem;
          opacity: 0;
          animation: rl-fade-in 1s 1.4s forwards;
        }

        .rl-glitch-box {
          border: 1px solid rgba(255, 0, 0, 0.3);
          padding: 2rem;
          position: relative;
          display: none;
        }

        .rl-glitch-box::before,
        .rl-glitch-box::after {
          content: "";
          position: absolute;
          background: var(--rl-red);
          height: 1px;
        }

        .rl-glitch-box::before {
          top: -1px;
          left: 20%;
          right: 20%;
        }

        .rl-glitch-box::after {
          bottom: -1px;
          left: 30%;
          right: 30%;
        }

        .rl-terminal-text {
          font-size: 0.72rem;
          line-height: 1.8;
          color: var(--rl-acid);
          white-space: pre;
        }

        .rl-shame,
        .rl-features,
        .rl-how {
          padding: 8rem 2.5rem;
          border-bottom: 1px solid var(--rl-midgray);
        }

        .rl-section-label {
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          color: var(--rl-red);
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .rl-section-label::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 0, 0, 0.25);
          max-width: 80px;
        }

        .rl-shame-headline,
        .rl-solution-headline {
          font-size: clamp(2.5rem, 6vw, 6rem);
          text-transform: uppercase;
          line-height: 0.95;
          max-width: 18ch;
          margin-bottom: 4rem;
          font-weight: 900;
        }

        .rl-excuse-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1px;
          border: 1px solid var(--rl-midgray);
        }

        .rl-excuse-item {
          padding: 2.5rem 2rem;
          border: 1px solid transparent;
          background: var(--rl-black);
          transition: all 0.2s;
        }

        .rl-excuse-item:hover {
          border-color: var(--rl-red);
        }

        .rl-excuse-num,
        .rl-step-num,
        .rl-agent-role,
        .rl-bento-tag {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .rl-excuse-num,
        .rl-step-num {
          color: var(--rl-red);
          margin-bottom: 0.75rem;
        }

        .rl-excuse-text {
          font-size: 1.05rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.75rem;
        }

        .rl-excuse-verdict {
          font-size: 0.72rem;
          color: var(--rl-red);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .rl-solution {
          padding: 8rem 2.5rem;
          background: var(--rl-white);
          color: var(--rl-black);
          border-bottom: 4px solid var(--rl-black);
        }

        .rl-solution .rl-section-label {
          color: var(--rl-black);
        }

        .rl-solution .rl-section-label::after {
          background: rgba(0, 0, 0, 0.2);
        }

        .rl-solution-headline {
          font-size: clamp(3rem, 7vw, 8rem);
          line-height: 0.9;
          margin-bottom: 5rem;
          max-width: 16ch;
        }

        .rl-agents-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          background: var(--rl-black);
          border: 2px solid var(--rl-black);
        }

        .rl-agent-card {
          background: var(--rl-white);
          padding: 3rem 2.5rem;
        }

        .rl-agent-card-red {
          background: var(--rl-red);
          color: var(--rl-white);
        }

        .rl-agent-tag {
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          background: var(--rl-black);
          color: var(--rl-white);
          display: inline-block;
          padding: 0.2rem 0.6rem;
          margin-bottom: 1.5rem;
        }

        .rl-agent-card-red .rl-agent-tag {
          background: var(--rl-white);
          color: var(--rl-black);
        }

        .rl-agent-name {
          font-size: clamp(2rem, 4vw, 3.5rem);
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 0.75rem;
          font-weight: 900;
        }

        .rl-agent-role {
          color: var(--rl-textgray);
          margin-bottom: 1.5rem;
        }

        .rl-agent-card-red .rl-agent-role,
        .rl-agent-card-red .rl-agent-desc {
          color: rgba(255, 255, 255, 0.82);
        }

        .rl-agent-desc,
        .rl-step-desc,
        .rl-bento-desc,
        .rl-cta-sub {
          font-size: 0.85rem;
          line-height: 1.7;
        }

        .rl-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--rl-midgray);
          border: 1px solid var(--rl-midgray);
          margin-top: 3rem;
        }

        .rl-bento-cell {
          background: var(--rl-black);
          padding: 2.5rem 2rem;
          transition: background 0.2s;
        }

        .rl-bento-cell:hover {
          background: #0a0a0a;
        }

        .rl-bento-span2 {
          grid-column: span 2;
        }

        .rl-bento-tall {
          min-height: 320px;
        }

        .rl-bento-icon {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .rl-bento-tag {
          color: var(--rl-acid);
          margin-bottom: 0.75rem;
        }

        .rl-bento-title,
        .rl-step-title {
          font-size: clamp(1.8rem, 3.5vw, 3rem);
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 1rem;
          font-weight: 900;
        }

        .rl-bento-chamber {
          border: 2px solid var(--rl-red);
          animation: rl-pulse-red 2s ease-in-out infinite;
          position: relative;
        }

        .rl-chamber-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: var(--rl-red);
          color: var(--rl-white);
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          padding: 0.2rem 0.5rem;
          text-transform: uppercase;
          animation: rl-blink 1.2s step-end infinite;
        }

        .rl-timeline {
          margin-top: 4rem;
          position: relative;
          padding-left: 3rem;
          max-width: 700px;
        }

        .rl-timeline::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, var(--rl-red), transparent);
        }

        .rl-timeline-step {
          position: relative;
          padding-bottom: 4rem;
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.5s ease;
        }

        .rl-timeline-step.visible,
        .rl-reveal.visible,
        .rl-reveal-left.visible {
          opacity: 1;
          transform: translateX(0) translateY(0);
        }

        .rl-timeline-dot {
          position: absolute;
          left: -3.35rem;
          top: 0.25rem;
          width: 12px;
          height: 12px;
          background: var(--rl-red);
          border: 2px solid var(--rl-black);
          box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.3);
        }

        .rl-cta {
          padding: 10rem 2.5rem;
          background: var(--rl-red);
          color: var(--rl-white);
          text-align: center;
          position: relative;
        }

        .rl-cta::before {
          content: "MACHINE";
          position: absolute;
          font-size: 25vw;
          color: rgba(255, 255, 255, 0.04);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          white-space: nowrap;
          pointer-events: none;
          letter-spacing: 0.05em;
        }

        .rl-cta-headline {
          font-size: clamp(2rem, 5vw, 5rem);
          text-transform: uppercase;
          line-height: 0.95;
          margin-bottom: 1.5rem;
          max-width: 22ch;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          font-weight: 900;
        }

        .rl-cta-sub {
          color: rgba(255, 255, 255, 0.75);
          max-width: 45ch;
          margin: 0 auto 3rem;
          position: relative;
        }

        .rl-btn-join {
          background: var(--rl-black);
          color: var(--rl-white);
          padding: 1.2rem 3.5rem;
          font-size: 1.3rem;
          letter-spacing: 0.15em;
          border: none;
          position: relative;
          font-weight: 900;
        }

        .rl-btn-join:hover {
          background: var(--rl-acid);
          color: var(--rl-black);
          box-shadow: 0 0 50px rgba(204, 255, 0, 0.5);
          transform: scale(1.04);
        }

        .rl-footer {
          padding: 3rem 2.5rem;
          border-top: 1px solid var(--rl-midgray);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .rl-footer-logo {
          font-size: 1.3rem;
          letter-spacing: 0.05em;
          font-weight: 900;
        }

        .rl-footer-logo span {
          color: var(--rl-red);
        }

        .rl-footer-links {
          display: flex;
          gap: 1.25rem;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .rl-footer-links a {
          color: var(--rl-textgray);
          text-decoration: none;
        }

        .rl-footer-links a:hover {
          color: var(--rl-white);
        }

        .rl-footer-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.4rem;
        }

        .rl-system-status {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--rl-acid);
        }

        .rl-status-dot {
          width: 7px;
          height: 7px;
          background: var(--rl-acid);
          border-radius: 9999px;
          animation: rl-pulse-dot 1.5s ease-in-out infinite;
        }

        .rl-clock {
          font-size: 0.65rem;
          color: var(--rl-textgray);
          letter-spacing: 0.1em;
        }

        .rl-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity 0.6s ease,
            transform 0.6s ease;
        }

        .rl-reveal-left {
          opacity: 0;
          transform: translateX(-32px);
          transition:
            opacity 0.6s ease,
            transform 0.6s ease;
        }

        @keyframes rl-fade-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rl-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes rl-glitch-in {
          0% {
            opacity: 0;
            transform: translateX(-8px) skewX(-2deg);
            clip-path: inset(40% 0 40% 0);
          }
          20% {
            opacity: 1;
            clip-path: inset(0% 0 60% 0);
          }
          40% {
            clip-path: inset(50% 0 0% 0);
            transform: translateX(4px) skewX(1deg);
          }
          60% {
            clip-path: inset(0% 0 0% 0);
            transform: translateX(-2px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) skewX(0);
            clip-path: none;
          }
        }

        @keyframes rl-pulse-red {
          0%,
          100% {
            border-color: var(--rl-red);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
          50% {
            border-color: #ff4444;
            box-shadow:
              0 0 20px rgba(255, 0, 0, 0.3),
              inset 0 0 20px rgba(255, 0, 0, 0.05);
          }
        }

        @keyframes rl-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes rl-pulse-dot {
          0%,
          100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(204, 255, 0, 0.4);
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 0 5px rgba(204, 255, 0, 0);
          }
        }

        @media (min-width: 900px) {
          .rl-glitch-box {
            display: block;
          }
        }

        @media (max-width: 900px) {
          .rl-bento-grid {
            grid-template-columns: 1fr 1fr;
          }

          .rl-bento-span2 {
            grid-column: span 1;
          }
        }

        @media (max-width: 700px) {
          .rl-agents-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .rl-nav {
            padding: 1rem 1.5rem;
          }

          .rl-btn-ghost {
            display: none;
          }

          .rl-hero,
          .rl-shame,
          .rl-solution,
          .rl-features,
          .rl-how,
          .rl-cta {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }

          .rl-footer {
            padding: 2rem 1.5rem;
            flex-direction: column;
            align-items: flex-start;
          }

          .rl-footer-meta {
            align-items: flex-start;
          }

          .rl-hero-deco {
            display: none;
          }

          .rl-bento-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
