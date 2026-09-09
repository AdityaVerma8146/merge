import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

/* ============================================================
   DATA — pulled straight from the September training plan
   ============================================================ */

const WEEKS = [
  {
    id: 1,
    range: "Sep 1 – 7",
    label: "IGNITION",
    dsa: "Day 9–15 — Recursion, Linked List, Stack & Queues",
    web: "Tailwind wrap-up · Next.js + Prisma + NextAuth (OAuth/JWT)",
    aiml: "Deep Learning Foundations — Parts 1–6",
  },
  {
    id: 2,
    range: "Sep 8 – 14",
    label: "STRUCTURE",
    dsa: "Day 16–22 — Binary Trees & BST",
    web: "Dashboard UI · Template modal · File Explorer",
    aiml: "Deep Learning Parts 7–10 · OpenAI APIs",
  },
  {
    id: 3,
    range: "Sep 15 – 21",
    label: "EXPANSION",
    dsa: "Day 23–28 — Heaps, Tries, Graphs",
    web: "WebContainers · Monaco Editor · Ollama AI Module",
    aiml: "Flask API · Agentic AI · AI Attendance System",
  },
  {
    id: 4,
    range: "Sep 22 – 30",
    label: "FINISH LINE",
    dsa: "Day 29–34 — Dynamic Programming, Greedy, Misc",
    web: "AI Module Part 2 · Final IDE deployment",
    aiml: "Neural Style Transfer · Gym Trainer · Resume ATS",
  },
];

const WEEKDAY_BLOCKS = [
  { time: "06:00 – 19:00", title: "College", detail: "Use breaks & commute for video lectures at 1.5–2x speed", tag: "passive" },
  { time: "19:00 – 20:00", title: "DSA — 1h", detail: "One targeted Striver problem, done properly, before dinner.", tag: "dsa" },
  { time: "20:00 – 21:00", title: "Dinner", detail: "Reset & unwind", tag: "rest" },
  { time: "21:00 – 23:30", title: "Build — 2.5h", detail: "Next.js build-out or model training. Hands on keyboard.", tag: "build" },
];

const WEEKEND_BLOCKS = [
  { time: "07:00 – 10:00", title: "DSA Deep Dive — 3h", detail: "Clear the backlog: Graphs, DP, Trees.", tag: "dsa" },
  { time: "10:00 – 13:00", title: "Full-Stack Build — 3h", detail: "Next.js, Prisma, WebContainers, Monaco.", tag: "build" },
  { time: "13:00 – 14:00", title: "Break", detail: "Lunch", tag: "rest" },
  { time: "14:00 – 18:00", title: "AI/ML Lab — 4h", detail: "Deep learning modules, Flask API, OpenCV/PyTorch.", tag: "aiml" },
  { time: "18:00 – 19:00", title: "Break", detail: "Evening reset", tag: "rest" },
  { time: "19:00 – 21:00", title: "AI Project — 2h", detail: "Attendance system, NST, ATS, or Gym Trainer.", tag: "build" },
];

const RULES = [
  { n: "01", title: "20-Minute Cap", body: "Never sit stuck on one DSA problem past 20–25 minutes. Read the approach, absorb the pattern, write it clean yourself." },
  { n: "02", title: "1.75x Playback", body: "Speed through theory on video modules. Skip code-typing clips — read the repo instead." },
  { n: "03", title: "Build Alongside", body: "Write project code while the video plays, not after it ends." },
  { n: "04", title: "Cut the Optional", body: "Skip redundant modules you've already covered elsewhere. No wasted reps." },
];

/* Build the 7 real days starting tomorrow, each broken into checkable blocks */
function buildUpcomingDays() {
  const days = [];
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay(); // 0 Sun .. 6 Sat
    const isWeekend = dow === 0 || dow === 6;
    const blocks = (isWeekend ? WEEKEND_BLOCKS : WEEKDAY_BLOCKS).filter(
      (b) => b.tag !== "rest" && b.tag !== "passive"
    );
    days.push({
      key: d.toISOString().slice(0, 10),
      dateLabel: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
      isWeekend,
      blocks,
    });
  }
  return days;
}

/* ============================================================
   3D SCENE — original low-poly striker-in-a-cage, not IP art
   ============================================================ */

function CageScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03050c, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Ambient + rim lights — cold blue vs hot red, the Blue Lock duality
    scene.add(new THREE.AmbientLight(0x1a2540, 1.1));
    const blueLight = new THREE.PointLight(0x3d7bff, 6, 20);
    blueLight.position.set(-4, 3, 4);
    scene.add(blueLight);
    const redLight = new THREE.PointLight(0xff2d4d, 3.5, 20);
    redLight.position.set(4, -1, 3);
    scene.add(redLight);

    // Central figure: abstract low-poly "striker" — an icosahedron core
    const coreGeo = new THREE.IcosahedronGeometry(1.15, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0a1226,
      emissive: 0x1c3f8f,
      emissiveIntensity: 0.55,
      metalness: 0.6,
      roughness: 0.25,
      flatShading: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const coreWire = new THREE.Mesh(
      coreGeo,
      new THREE.MeshBasicMaterial({ color: 0x6fa8ff, wireframe: true, transparent: true, opacity: 0.35 })
    );
    coreWire.scale.setScalar(1.02);
    scene.add(coreWire);

    // The "Lock" — three nested rotating rings caging the core
    const rings = [];
    const ringColors = [0x2f6bff, 0x7fd3ff, 0xff3b5c];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.1 + i * 0.35, 0.015, 8, 64),
        new THREE.MeshBasicMaterial({ color: ringColors[i], transparent: true, opacity: 0.55 })
      );
      ring.rotation.x = Math.PI / 2 + i * 0.6;
      ring.rotation.y = i * 0.4;
      scene.add(ring);
      rings.push(ring);
    }

    // Particle field — stadium dust under floodlights
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0x5c8dff, size: 0.03, transparent: true, opacity: 0.55 })
    );
    scene.add(particles);

    // Floor grid — pitch reference
    const grid = new THREE.GridHelper(30, 30, 0x1c3f8f, 0x0a1730);
    grid.position.y = -2.6;
    scene.add(grid);

    let frame;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      core.rotation.y = t * 0.25;
      core.rotation.x = Math.sin(t * 0.2) * 0.15;
      coreWire.rotation.y = core.rotation.y;
      coreWire.rotation.x = core.rotation.x;
      rings.forEach((r, i) => {
        r.rotation.z = t * (0.15 + i * 0.07) * (i % 2 === 0 ? 1 : -1);
      });
      particles.rotation.y = t * 0.02;
      camera.position.x = Math.sin(t * 0.08) * 1.1;
      camera.lookAt(0, 0.3, 0);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="scene-mount" />;
}

/* ============================================================
   UI PIECES
   ============================================================ */

function Countdown() {
  const [remaining, setRemaining] = useState(getRemaining());

  function getRemaining() {
    const now = new Date();
    const target = new Date();
    target.setDate(now.getDate() + (now.getHours() >= 20 ? 1 : 1));
    target.setHours(20, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return Math.max(0, target - now);
  }

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(remaining / 3.6e6)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3.6e6) / 6e4)).padStart(2, "0");
  const s = String(Math.floor((remaining % 6e4) / 1000)).padStart(2, "0");

  return (
    <div className="countdown">
      <span className="countdown-label">First night window begins in</span>
      <div className="countdown-digits">
        <span>{h}</span>:<span>{m}</span>:<span>{s}</span>
      </div>
    </div>
  );
}

function DailyTemplate() {
  const [mode, setMode] = useState("weekday");
  const blocks = mode === "weekday" ? WEEKDAY_BLOCKS : WEEKEND_BLOCKS;

  return (
    <section className="section" id="template">
      <div className="section-head">
        <span className="eyebrow">Daily Rhythm</span>
        <h2>Two templates. Same discipline.</h2>
      </div>
      <div className="toggle">
        <button className={mode === "weekday" ? "active" : ""} onClick={() => setMode("weekday")}>
          Weekday
        </button>
        <button className={mode === "weekend" ? "active" : ""} onClick={() => setMode("weekend")}>
          Weekend
        </button>
      </div>
      <div className="timeline">
        {blocks.map((b, i) => (
          <div className={`timeline-row tag-${b.tag}`} key={i}>
            <div className="timeline-time">{b.time}</div>
            <div className="timeline-line">
              <span className="dot" />
              {i < blocks.length - 1 && <span className="bar" />}
            </div>
            <div className="timeline-body">
              <h4>{b.title}</h4>
              <p>{b.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WeekOverview() {
  return (
    <section className="section" id="roadmap">
      <div className="section-head">
        <span className="eyebrow">September Roadmap</span>
        <h2>Four weeks. Four phases.</h2>
      </div>
      <div className="week-grid">
        {WEEKS.map((w) => (
          <div className="week-card" key={w.id}>
            <div className="week-card-top">
              <span className="week-num">W{w.id}</span>
              <span className="week-range">{w.range}</span>
            </div>
            <h3>{w.label}</h3>
            <dl>
              <dt>DSA</dt>
              <dd>{w.dsa}</dd>
              <dt>Web Dev</dt>
              <dd>{w.web}</dd>
              <dt>AI / ML</dt>
              <dd>{w.aiml}</dd>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function DayTracker() {
  const days = useMemo(buildUpcomingDays, []);
  const [checked, setChecked] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);

  const toggle = (dayKey, blockIdx) => {
    const key = `${dayKey}-${blockIdx}`;
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  };

  const progressFor = (day) => {
    const total = day.blocks.length;
    const done = day.blocks.filter((_, i) => checked[`${day.key}-${i}`]).length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const active = days[activeIdx];

  return (
    <section className="section" id="tracker">
      <div className="section-head">
        <span className="eyebrow">Your Next 7 Days</span>
        <h2>Starting tomorrow. Track every block.</h2>
      </div>

      <div className="day-tabs">
        {days.map((d, i) => (
          <button
            key={d.key}
            className={`day-tab ${i === activeIdx ? "active" : ""} ${d.isWeekend ? "weekend" : ""}`}
            onClick={() => setActiveIdx(i)}
          >
            <span className="day-tab-date">{d.dateLabel}</span>
            <span className="day-tab-progress">{progressFor(d)}%</span>
          </button>
        ))}
      </div>

      <div className="day-panel">
        <div className="day-panel-head">
          <h3>{active.weekday}{active.isWeekend ? " — Full Execution Window" : " — Night Window"}</h3>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressFor(active)}%` }} />
          </div>
        </div>
        <ul className="check-list">
          {active.blocks.map((b, i) => {
            const key = `${active.key}-${i}`;
            const isChecked = !!checked[key];
            return (
              <li key={key} className={isChecked ? "checked" : ""} onClick={() => toggle(active.key, i)}>
                <span className="checkbox">{isChecked && "✓"}</span>
                <div>
                  <div className="check-title">
                    <span className={`tag-dot tag-${b.tag}`} />
                    {b.title} <span className="check-time">{b.time}</span>
                  </div>
                  <p>{b.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Rules() {
  return (
    <section className="section" id="rules">
      <div className="section-head">
        <span className="eyebrow">Execution Rules</span>
        <h2>Non-negotiables.</h2>
      </div>
      <div className="rules-grid">
        {RULES.map((r) => (
          <div className="rule-card" key={r.n}>
            <span className="rule-n">{r.n}</span>
            <h4>{r.title}</h4>
            <p>{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   APP
   ============================================================ */

export default function App() {
  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --bg: #03050c;
          --bg-soft: #070b16;
          --panel: #0c1224;
          --line: #1c2540;
          --blue: #3d7bff;
          --blue-light: #8fc3ff;
          --red: #ff3b5c;
          --text: #e8ecf7;
          --text-dim: #8590ad;
        }
        * { box-sizing: border-box; }
        .app {
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        h1, h2, h3, h4 { font-family: 'Bebas Neue', 'Inter', sans-serif; letter-spacing: 0.02em; margin: 0; }

        /* HERO */
        .hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 40px 20px;
          overflow: hidden;
          background: radial-gradient(ellipse at 50% 30%, #0a1430 0%, #03050c 70%);
        }
        .scene-mount { position: absolute; inset: 0; z-index: 0; opacity: 0.9; }
        .hero-content { position: relative; z-index: 1; max-width: 780px; }
        .hero-kicker {
          display: inline-block;
          font-size: 13px;
          letter-spacing: 0.35em;
          color: var(--blue-light);
          border: 1px solid var(--line);
          padding: 6px 16px;
          border-radius: 999px;
          margin-bottom: 28px;
          background: rgba(61, 123, 255, 0.08);
        }
        .hero h1 {
          font-size: clamp(48px, 9vw, 108px);
          line-height: 0.95;
          background: linear-gradient(180deg, #fff 0%, #9db8f0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero h1 em {
          font-style: normal;
          background: linear-gradient(180deg, var(--red) 0%, #ff8fa3 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }
        .hero p {
          margin-top: 22px;
          font-size: 17px;
          color: var(--text-dim);
          line-height: 1.6;
          max-width: 540px;
          margin-left: auto;
          margin-right: auto;
        }
        .hero-cta {
          margin-top: 36px;
          display: inline-flex;
          gap: 14px;
          padding: 15px 34px;
          background: var(--blue);
          color: #04070f;
          font-weight: 700;
          font-size: 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          letter-spacing: 0.03em;
          box-shadow: 0 0 40px rgba(61,123,255,0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 0 55px rgba(61,123,255,0.5); }

        .countdown { margin-top: 40px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .countdown-label { font-size: 12px; letter-spacing: 0.15em; color: var(--text-dim); text-transform: uppercase; }
        .countdown-digits { font-family: 'Bebas Neue'; font-size: 42px; letter-spacing: 0.05em; color: var(--blue-light); text-shadow: 0 0 24px rgba(61,123,255,0.5); }

        /* SECTIONS */
        .section { max-width: 1100px; margin: 0 auto; padding: 100px 24px; }
        .section-head { margin-bottom: 48px; }
        .eyebrow { display: block; font-size: 12px; letter-spacing: 0.25em; color: var(--red); text-transform: uppercase; margin-bottom: 12px; }
        .section-head h2 { font-size: clamp(30px, 4vw, 46px); color: var(--text); max-width: 600px; }

        /* WEEK GRID */
        .week-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); }
        .week-card { background: var(--panel); padding: 28px 24px; }
        .week-card-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
        .week-num { font-family: 'Bebas Neue'; font-size: 22px; color: var(--blue-light); }
        .week-range { font-size: 12px; color: var(--text-dim); }
        .week-card h3 { font-size: 26px; margin-bottom: 18px; color: var(--text); }
        .week-card dl { display: flex; flex-direction: column; gap: 4px; }
        .week-card dt { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--red); margin-top: 12px; }
        .week-card dd { margin: 0; font-size: 13.5px; color: var(--text-dim); line-height: 1.5; }

        /* TOGGLE */
        .toggle { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 4px; margin-bottom: 40px; }
        .toggle button { background: none; border: none; color: var(--text-dim); font-size: 13px; padding: 9px 22px; border-radius: 999px; cursor: pointer; font-weight: 600; }
        .toggle button.active { background: var(--blue); color: #04070f; }

        /* TIMELINE */
        .timeline-row { display: grid; grid-template-columns: 110px 24px 1fr; gap: 20px; }
        .timeline-time { font-size: 12px; color: var(--text-dim); padding-top: 3px; text-align: right; }
        .timeline-line { display: flex; flex-direction: column; align-items: center; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--blue); box-shadow: 0 0 10px var(--blue); flex-shrink: 0; }
        .bar { width: 1px; flex: 1; background: var(--line); margin-top: 4px; }
        .timeline-body { padding-bottom: 34px; }
        .timeline-body h4 { font-size: 20px; font-weight: 600; font-family: 'Inter'; color: var(--text); margin-bottom: 4px; }
        .timeline-body p { margin: 0; font-size: 13.5px; color: var(--text-dim); line-height: 1.5; }
        .tag-dsa .dot { background: var(--red); box-shadow: 0 0 10px var(--red); }
        .tag-aiml .dot { background: #7fd3ff; box-shadow: 0 0 10px #7fd3ff; }

        /* DAY TRACKER */
        .day-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 28px; }
        .day-tab { flex-shrink: 0; background: var(--panel); border: 1px solid var(--line); color: var(--text-dim); padding: 12px 18px; border-radius: 6px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; min-width: 108px; }
        .day-tab.weekend { border-color: rgba(255,59,92,0.35); }
        .day-tab.active { background: var(--blue); color: #04070f; border-color: var(--blue); }
        .day-tab.active .day-tab-progress { color: #04070f; }
        .day-tab-date { font-size: 13px; font-weight: 600; }
        .day-tab-progress { font-size: 11px; color: var(--text-dim); }

        .day-panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 32px; }
        .day-panel-head { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
        .day-panel-head h3 { font-family: 'Inter'; font-weight: 700; font-size: 20px; color: var(--text); }
        .progress-track { height: 4px; background: var(--line); border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--blue), var(--blue-light)); transition: width 0.3s ease; }

        .check-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .check-list li { display: flex; gap: 16px; padding: 16px 12px; border-radius: 6px; cursor: pointer; align-items: flex-start; transition: background 0.15s ease; }
        .check-list li:hover { background: rgba(61,123,255,0.06); }
        .check-list li.checked .check-title { color: var(--text-dim); text-decoration: line-through; }
        .check-list li.checked p { opacity: 0.5; }
        .checkbox { flex-shrink: 0; width: 22px; height: 22px; border: 1px solid var(--line); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--blue-light); margin-top: 2px; }
        .check-list li.checked .checkbox { background: var(--blue); border-color: var(--blue); color: #04070f; }
        .check-title { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 8px; }
        .check-time { font-weight: 400; font-size: 12px; color: var(--text-dim); margin-left: 4px; }
        .check-list p { margin: 4px 0 0; font-size: 13px; color: var(--text-dim); }
        .tag-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }
        .tag-dot.tag-dsa { background: var(--red); }
        .tag-dot.tag-aiml { background: #7fd3ff; }
        .tag-dot.tag-build { background: var(--blue); }

        /* RULES */
        .rules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
        .rule-card { border-top: 1px solid var(--line); padding-top: 18px; }
        .rule-n { font-family: 'Bebas Neue'; font-size: 34px; color: var(--red); }
        .rule-card h4 { font-family: 'Inter'; font-weight: 700; font-size: 16px; margin: 8px 0 8px; color: var(--text); }
        .rule-card p { margin: 0; font-size: 13.5px; color: var(--text-dim); line-height: 1.55; }

        footer { text-align: center; padding: 50px 24px 70px; color: var(--text-dim); font-size: 12px; letter-spacing: 0.1em; }

        @media (max-width: 640px) {
          .section { padding: 70px 20px; }
          .timeline-row { grid-template-columns: 70px 20px 1fr; gap: 12px; }
        }
      `}</style>

      <div className="hero">
        <CageScene />
        <div className="hero-content">
          <span className="hero-kicker">SEPTEMBER · TRAINING PROTOCOL</span>
          <h1>ENTER THE<br /><em>EGOIST</em> STATE</h1>
          <p>
            ~200 hours this month. DSA, full-stack, and AI/ML — no wasted reps.
            One roadmap, four phases, and a tracker that starts the moment you close this tab.
          </p>
          <button
            className="hero-cta"
            onClick={() => document.getElementById("tracker").scrollIntoView({ behavior: "smooth" })}
          >
            Start Tomorrow →
          </button>
          <Countdown />
        </div>
      </div>

      <WeekOverview />
      <DailyTemplate />
      <DayTracker />
      <Rules />

      <footer>BUILT FOR THE GRIND · SEPTEMBER 2026</footer>
    </div>
  );
}
