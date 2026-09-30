import { useEffect, useRef, useState } from "react";
import "./landing.css";
import { APP_URL } from "./config";

const worlds = [
  {
    name: "La semilla del ahorro",
    tag: "AHORRO",
    title: "Las grandes metas empiezan pequeñas.",
    description:
      "Aprende a separar lo que necesitas de lo que quieres y dale un propósito a cada peso.",
    lesson: "Tu primera bellota",
    question: "Quieres ahorrar para una bicicleta. ¿Por dónde empiezas?",
    options: [
      "Aparto una cantidad cada semana",
      "Guardo lo que sobre al final",
    ],
    correct: 0,
    feedback: "¡Eso es! Un hábito pequeño y constante te acerca a tu meta.",
    retry:
      "Si esperas a ver qué sobra, puede que no guardes nada. Prueba apartar una cantidad primero.",
  },
  {
    name: "Raíces fuertes",
    tag: "PRESUPUESTO",
    title: "Dale un lugar a cada peso.",
    description:
      "Organiza tus gastos, descubre tus prioridades y construye hábitos que se quedan contigo.",
    lesson: "Decide con intención",
    question: "Antes de hacer una compra, ¿qué te ayuda a decidir?",
    options: ["Que la oferta termine hoy", "Revisar si cabe en mi presupuesto"],
    correct: 1,
    feedback:
      "¡Bien pensado! Tu presupuesto te ayuda a elegir sin perder de vista tus metas.",
    retry: "Una oferta puede esperar. Primero revisa cuánto puedes gastar.",
  },
  {
    name: "Un futuro que florece",
    tag: "METAS",
    title: "Haz espacio para lo que sueñas.",
    description:
      "Convierte una idea en una meta concreta y aprende a seguir tu progreso, paso a paso.",
    lesson: "Una meta con rumbo",
    question: "¿Cuál de estas metas es más fácil de seguir?",
    options: [
      "Ahorrar más algún día",
      "Ahorrar $100 por semana durante un mes",
    ],
    correct: 1,
    feedback: "¡Exacto! Una cantidad y un plazo hacen que tu meta sea clara.",
    retry: "Dale una cantidad y una fecha a tu meta para saber cómo vas.",
  },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const seg = (progress: number, start: number, end: number) =>
  clamp((progress - start) / (end - start));
const ease = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={down ? { transform: "rotate(90deg)" } : undefined}
    >
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Acorn({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="30"
      viewBox="0 0 32 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 8c0-4 2-5 4-5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M6 18c0 9 5 13 10 15 5-2 10-6 10-15"
        fill="currentColor"
        opacity=".85"
      />
      <path d="M3 18C3 9 29 9 29 18c0 3-26 3-26 0Z" fill="currentColor" />
    </svg>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [world, setWorld] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [jumping, setJumping] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const bellaZoomRef = useRef<HTMLDivElement>(null);
  const learningIntroRef = useRef<HTMLDivElement>(null);
  const bellaRef = useRef<HTMLDivElement>(null);
  const forestRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionOff = paused || reduced;
  const selected = worlds[world];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const bella = bellaRef.current;
    const forest = forestRef.current;
    const container = containerRef.current;
    const journey = journeyRef.current;
    const bellaZoom = bellaZoomRef.current;
    if (!hero || !bella || !forest || !container || !journey || !bellaZoom)
      return;
    journey.style.removeProperty("--vp-x");
    journey.style.removeProperty("--vp-y");
    const header = hero.querySelector<HTMLElement>(".landing-header");
    const copy = hero.querySelector<HTMLElement>(".hero-copy");
    const bottom = hero.querySelector<HTMLElement>(".hero-bottom");
    const wakes = container.querySelectorAll<HTMLElement>(".water-current i");
    const clearScene = () => {
      for (const property of ["--vp-x", "--vp-y", "--forest-scale", "--banks-scale"])
        container.style.removeProperty(property);
      container.classList.remove("is-travelling");
      wakes.forEach((wake) => wake.removeAttribute("style"));
    };
    let frame = 0;
    let x = 0;
    let y = 0;
    let pointerActive = false;
    let pointerDirty = false;
    let lastProgress = -1;
    let metrics = {
      top: 0,
      travel: 1,
      vpX: 0,
      vpY: 0,
      bellaX: 0,
      bellaY: 0,
      mobile: false,
      width: 0,
      height: 0,
    };
    const reset = () => {
      pointerActive = false;
      bella.style.transform = "";
      forest.style.transform = "";
    };
    if (motionOff) {
      reset();
      journey.removeAttribute("style");
      journey.classList.remove("is-travelling");
      clearScene();
      if (header) header.inert = false;
      if (copy) copy.inert = false;
      if (bottom) bottom.inert = false;
      bellaZoom.inert = false;
      return;
    }
    const render = () => {
      frame = 0;
      const p = clamp((container.scrollTop - metrics.top) / metrics.travel);
      // Once inside, ordinary section scrolling leaves the scene untouched.
      if (p === lastProgress && !pointerDirty) return;
      lastProgress = p;
      pointerDirty = false;
      const advance = ease(seg(p, 0.05, 0.55));
      const copyFade = ease(seg(p, 0, 0.3));
      // Perspective growth: one opaque landscape, continuous camera distance.
      const sharedVariables: Record<string, string | number> = {
        "--vp-x": `${metrics.vpX}px`,
        "--vp-y": `${metrics.vpY}px`,
        "--forest-scale": 1 / (1 - (metrics.mobile ? 0.54 : 0.58) * p),
        "--banks-scale": 0.7 / (1 - 0.6 * p),
      };
      for (const [name, value] of Object.entries(sharedVariables))
        container.style.setProperty(name, String(value));
      const variables: Record<string, string | number> = {
        "--bottom-opacity": 1 - ease(seg(p, 0, 0.1)),
        "--copy-opacity": 1 - copyFade,
        "--copy-y": `${-40 * copyFade}px`,
        "--copy-blur": `${8 * copyFade}px`,
        "--hint-opacity": 1 - ease(seg(p, 0, 0.15)),
        "--bella-x": `${(metrics.vpX - metrics.bellaX) * 0.85 * advance}px`,
        "--bella-y": `${(metrics.vpY - metrics.bellaY) * 0.85 * advance}px`,
        "--bella-scale": 1 - 0.72 * advance,
        "--bella-opacity": 1 - ease(seg(p, 0.42, 0.58)),
        "--fireflies-scale": 1 + 2.2 * ease(seg(p, 0.1, 1)),
        "--fireflies-opacity": 1 - ease(seg(p, 0.75, 0.95)),
        "--header-opacity": 1 - ease(seg(p, 0.85, 1)),
      };
      for (const [name, value] of Object.entries(variables))
        journey.style.setProperty(name, String(value));
      journey.classList.toggle("is-travelling", p > 0 && p < 1);
      container.classList.toggle("is-travelling", p > 0 && p < 1);
      // Reflections sit on the water plane and expand as the camera passes them.
      wakes.forEach((wake, index) => {
        const distance = 0.8 + index * 0.65 - p * 3.2;
        if (distance <= 0.12) {
          wake.style.visibility = "hidden";
          return;
        }
        const perspective = 1 / distance;
        const offset = ((index * 7) % 9 - 4) * 0.028;
        const wakeX = metrics.vpX + metrics.width * offset * perspective;
        const wakeY = metrics.vpY + (metrics.height - metrics.vpY) * 0.45 * perspective;
        wake.style.visibility = "visible";
        wake.style.transform = `translate3d(${wakeX}px,${wakeY}px,0) scale(${perspective})`;
      });
      if (header) header.inert = p > 0.95;
      if (copy) copy.inert = p >= 0.3;
      if (bottom) bottom.inert = p >= 0.1;
      bellaZoom.inert = p >= 0.58;

      // Inner transforms still belong to the pointer; the wrappers own the trip.
      const strength = 1 - seg(p, 0, 0.25);
      if (pointerActive && strength > 0) {
        bella.style.transform = `perspective(1000px) rotateY(${x * 15 * strength}deg) rotateX(${-y * 8 * strength}deg) translate3d(${x * 20 * strength}px,${y * 10 * strength}px,0)`;
        forest.style.transform = `scale(1.04) translate3d(${-x * 12 * strength}px,${-y * 8 * strength}px,0)`;
      } else {
        bella.style.transform = "";
        forest.style.transform = "";
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      // Only measure layout on setup/resize, never in the scroll frame.
      const width = hero.offsetWidth;
      const height = hero.offsetHeight;
      // The generated lake is 1536x1024; the river mouth is at (58%, 53%).
      const scale = Math.max(width / 1536, height / 1024);
      let bellaX = bellaZoom.offsetWidth / 2;
      let bellaY = bellaZoom.offsetHeight / 2;
      let parent: HTMLElement | null = bellaZoom;
      while (parent && parent !== hero) {
        bellaX += parent.offsetLeft;
        bellaY += parent.offsetTop;
        parent = parent.offsetParent as HTMLElement | null;
      }
      metrics = {
        top:
          journey.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop,
        travel: Math.max(1, journey.offsetHeight - height),
        vpX: (width - 1536 * scale) * 0.5 + 0.58 * 1536 * scale,
        vpY: (height - 1024 * scale) * 0.68 + 0.53 * 1024 * scale,
        bellaX,
        bellaY,
        mobile: window.matchMedia("(max-width: 700px)").matches,
        width,
        height,
      };
      lastProgress = -1;
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = hero.getBoundingClientRect();
      x = (event.clientX - box.left) / box.width - 0.5;
      y = (event.clientY - box.top) / box.height - 0.5;
      pointerActive = true;
      pointerDirty = true;
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    observer.observe(journey);
    observer.observe(bellaZoom);
    measure();
    container.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      reset();
      clearScene();
    };
  }, [motionOff]);

  useEffect(() => {
    const intro = learningIntroRef.current;
    const container = containerRef.current;
    if (!intro || !container || intro.classList.contains("is-arrived")) return;
    if (motionOff) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.intersectionRatio >= 0.15)) {
          intro.classList.add("is-arrived");
          observer.disconnect();
        }
      },
      { root: container, threshold: 0.15 },
    );
    observer.observe(intro);
    return () => observer.disconnect();
  }, [motionOff]);

  useEffect(
    () => () => {
      if (jumpTimer.current) clearTimeout(jumpTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const greet = () => {
    if (motionOff) return;
    if (jumpTimer.current) clearTimeout(jumpTimer.current);
    setJumping(true);
    jumpTimer.current = setTimeout(() => setJumping(false), 700);
  };

  return (
    <div
      ref={containerRef}
      className={`finzi-landing${motionOff ? " motion-off" : ""}`}
      onClick={(event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return;
        const link = (event.target as HTMLElement).closest('a[href^="#"]');
        const hash = link?.getAttribute("href");
        const target = hash ? document.getElementById(hash.slice(1)) : null;
        if (!target) return;
        event.preventDefault();
        if (link?.classList.contains("skip-link"))
          target.focus({ preventScroll: true });
        window.history.replaceState(null, "", hash);
        const container = event.currentTarget;
        // Hero anchors return to the start so their content has not faded out.
        const destination =
          !motionOff && heroRef.current?.contains(target)
            ? (journeyRef.current ?? target)
            : target;
        container.scrollTo({
          top:
            container.scrollTop +
            destination.getBoundingClientRect().top -
            container.getBoundingClientRect().top,
          behavior: motionOff ? "instant" : "smooth",
        });
      }}
    >
      <a className="skip-link" href="#aventura">
        Saltar al contenido
      </a>
      <div className="forest-residence" aria-hidden="true">
        <div className="forest-camera">
          <div className="forest-image" ref={forestRef} />
        </div>
        <div className="water-current">
          {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
        </div>
        <div className="forest-banks" />
        <div className="forest-scene-shade" />
      </div>
      <div className="forest-journey" ref={journeyRef}>
        <section
          id="inicio"
          className="forest-hero"
          ref={heroRef}
          aria-labelledby="hero-title"
        >
          <div className="forest-static" aria-hidden="true">
            <div className="forest-static-image" />
          </div>
          <header className="landing-header">
            <a
              href="#inicio"
              className="finzi-wordmark"
              aria-label="Finzi, inicio"
            >
              finzi
              <span className="brand-sprout" aria-hidden="true">
                ✦
              </span>
            </a>
            <button
              className="menu-toggle"
              ref={menuButtonRef}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="landing-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "Cerrar −" : "Menú +"}
            </button>
            <nav
              id="landing-nav"
              className={`landing-nav${menuOpen ? " is-open" : ""}`}
              aria-label="Navegación principal"
            >
              <a href="#aventura" onClick={() => setMenuOpen(false)}>
                La aventura
              </a>
              <a href="#mundos" onClick={() => setMenuOpen(false)}>
                Qué aprenderás
              </a>
              <a href="#bella" onClick={() => setMenuOpen(false)}>
                Conoce a Bella
              </a>
              <a className="nav-login" href={APP_URL}>
                Entrar a Finzi <Arrow />
              </a>
            </nav>
          </header>

          <div className="hero-content" id="aventura" tabIndex={-1}>
            <div className="hero-copy">
              <h1 id="hero-title">
                Tu dinero.
                <br />
                Tu aventura.
                <br />
                <span>Tu futuro.</span>
              </h1>
              <p className="hero-description">
                Aprender de dinero puede ser toda una aventura. Explora, juega y
                haz crecer tu mundo con Finzi.
              </p>
              <div className="hero-actions">
                <a className="primary-cta" href={APP_URL}>
                  Empezar mi aventura <Arrow />
                </a>
                <a className="secondary-cta" href="#mundos">
                  <span className="play-icon" aria-hidden="true">
                    ▷
                  </span>{" "}
                  Prueba un reto
                </a>
              </div>
              <p className="hero-footnote">
                <span aria-hidden="true">✓</span> A tu ritmo{" "}
                <span className="footnote-divider" /> Desde tu primera bellota
              </p>
            </div>
            <div className="bella-stage" id="bella">
              <div className="bella-zoom" ref={bellaZoomRef}>
                <div className="bella-position" ref={bellaRef}>
                  <button
                    className={`bella-character${jumping ? " bella-jump" : ""}`}
                    onClick={greet}
                    aria-label="Saludar a Bella"
                  >
                    <img
                      src="/landing/bella-3d.webp"
                      width="1214"
                      height="1295"
                      alt="Bella, la ardilla de Finzi, te saluda con una bellota dorada"
                      draggable={false}
                      fetchPriority="high"
                    />
                  </button>
                </div>
              </div>
              <div className="bella-shadow" aria-hidden="true" />
              <span className="floating-leaf leaf-one" aria-hidden="true" />
              <span className="floating-leaf leaf-two" aria-hidden="true" />
              <div className="bella-name">
                <span>BELLA</span>Tu compañera de aventura
              </div>
              <p className="interaction-hint">Mueve el cursor o toca a Bella</p>
            </div>
          </div>
          <div className="fireflies" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <i
                key={index}
                style={{
                  left: `${9 + index * 10}%`,
                  top: `${30 + ((index * 17) % 53)}%`,
                  animationDelay: `${index * -0.7}s`,
                }}
              />
            ))}
          </div>
          <div className="hero-bottom">
            <a href="#mundos">
              Hay un mundo por descubrir <Arrow down />
            </a>
            <button
              onClick={() => setPaused(!paused)}
              aria-pressed={motionOff}
              disabled={reduced}
              className="motion-control"
              aria-label={motionOff ? "Activar movimiento" : "Pausar movimiento"}
            >
              <span aria-hidden="true">{motionOff ? "▷" : "Ⅱ"}</span>
              {reduced
                ? "Movimiento reducido"
                : paused
                  ? "Activar movimiento"
                  : "Pausar movimiento"}
            </button>
          </div>
        </section>
      </div>

      <section
        className="learning-section"
        id="mundos"
        aria-labelledby="learning-title"
      >
        <div className="learning-intro" ref={learningIntroRef}>
          <h2 id="learning-title">
            De una bellota
            <br />a un mundo de posibilidades.
          </h2>
          <p>
            No necesitas saber de finanzas para empezar.
            <br />
            Solo curiosidad y ganas de dar el primer paso.
          </p>
        </div>
        <div
          className="world-tabs"
          role="tablist"
          aria-label="Temas de aprendizaje"
        >
          {worlds.map((item, index) => (
            <button
              key={item.tag}
              id={`world-tab-${index}`}
              role="tab"
              aria-selected={index === world}
              aria-controls="world-panel"
              tabIndex={index === world ? 0 : -1}
              onClick={() => {
                setWorld(index);
                setAnswer(null);
              }}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % worlds.length;
                else if (event.key === "ArrowLeft")
                  next = (index + worlds.length - 1) % worlds.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = worlds.length - 1;
                else return;
                event.preventDefault();
                setWorld(next);
                setAnswer(null);
                document.getElementById(`world-tab-${next}`)?.focus();
              }}
            >
              <Acorn />
              <span>
                {item.name}
                <small>{item.tag}</small>
              </span>
              <Arrow />
            </button>
          ))}
        </div>
        <div
          className="world-panel"
          id="world-panel"
          role="tabpanel"
          aria-labelledby={`world-tab-${world}`}
        >
          <div className="world-copy">
            <span className="mini-label">
              UN POCO CADA DÍA, MUCHO PARA TU VIDA
            </span>
            <h3>{selected.title}</h3>
            <p>{selected.description}</p>
            <div className="growth-line">
              <span />
              <span />
              <span />
              <Acorn />
            </div>
            <p className="growth-caption">
              Aprende con retos cortos. Crece con cada decisión.
            </p>
          </div>
          <div className="mini-game">
            <div className="game-heading">
              <span>
                <Acorn /> {selected.lesson}
              </span>
              <span className="demo-label">RETO DE PRUEBA</span>
            </div>
            <h4>{selected.question}</h4>
            <div className="game-options">
              {selected.options.map((option, index) => (
                <button
                  key={`${world}-${index}`}
                  className={
                    answer === index
                      ? index === selected.correct
                        ? "answer-correct"
                        : "answer-retry"
                      : ""
                  }
                  onClick={() => setAnswer(index)}
                  aria-pressed={answer === index}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                  <span aria-hidden="true">
                    {answer === index
                      ? index === selected.correct
                        ? "✓"
                        : "↻"
                      : "↗"}
                  </span>
                </button>
              ))}
            </div>
            <p className="game-feedback" aria-live="polite">
              {answer === null
                ? "Sin presión. Aquí vienes a aprender."
                : answer === selected.correct
                  ? selected.feedback
                  : selected.retry}
            </p>
          </div>
        </div>
      </section>
      <section className="closing-section">
        <Acorn />
        <p>El mejor momento para sembrar tu futuro es hoy.</p>
        <a className="primary-cta" href={APP_URL}>
          Vamos a crecer <Arrow />
        </a>
      </section>
      <footer className="landing-footer">
        <a
          href="#inicio"
          className="finzi-wordmark"
          aria-label="Finzi, volver arriba"
        >
          finzi<span aria-hidden="true">✦</span>
        </a>
        <p>Finanzas para la vida. Una aventura a la vez.</p>
        <span>Hecho para aprender, diseñado para crecer.</span>
      </footer>
    </div>
  );
}
