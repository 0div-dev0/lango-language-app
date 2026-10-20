"use client";
/* Midnight Atlas: asymmetric editorial layout, ink-dark surfaces, signal-lime actions, and contextual learning layers. */
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BeamsBackground } from "@/components/ui/beams-background";
import { toast } from "sonner";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Globe2,
  Headphones,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings2,
  Sparkles,
  Star,
  Volume2,
  X,
  Zap,
} from "lucide-react";

const languages = [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Dutch",
  "Swedish",
  "Mandarin",
];
const modes = [
  "Casual conversation",
  "Restaurant",
  "Travel",
  "Job interview",
  "Small talk",
  "Surprise me",
];

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [translate, setTranslate] = useState(true);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hola, ¿qué te gustaría pedir?",
      translation: "Hello, what would you like to order?",
    },
    { role: "user", text: "I'd like a coffee with oat milk." },
    {
      role: "ai",
      text: "Me gustaría un café con leche de avena.",
      translation: "I would like a coffee with oat milk.",
    },
  ]);

  const revealTargetRef = useRef<((id: string) => void) | null>(null);
  const scrollTo = (id: string) => {
    revealTargetRef.current?.(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const begin = () => {
    setStarted(true);
    setTimeout(() => scrollTo("practice"), 30);
  };
  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      { role: "user", text: message },
      {
        role: "ai",
        text: "Perfecto. Suena muy bien.",
        translation: "Perfect. That sounds great.",
      },
    ]);
    setMessage("");
    toast.success("Your tutor replied", {
      description: "Keep the conversation going.",
    });
  };
  const comingSoon = () =>
    toast("That space is ready for your learning history", {
      description: "Connect an account to unlock it.",
    });

  /* Motion layer (GSAP): hero entrance, scroll-scrubbed parallax, interactive headline, and per-section reveals.
     Every effect bails out under prefers-reduced-motion, leaving the page static and fully visible. */
  useGSAP(
    (context, contextSafe) => {
      const root = rootRef.current;
      if (!root) return;
      gsap.registerPlugin(ScrollTrigger);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const safe: <T extends () => void>(fn: T) => T =
        contextSafe ?? (fn => fn);

      /* Every entrance tween (the ones that start elements at autoAlpha:0 and are unlocked by a
         ScrollTrigger) is collected here so the fast-scroll guard below can complete them. */
      const entranceAnims: gsap.core.Tween[] = [];

      /* Hero entrance: eyebrow → title lines → copy → actions → stats → floating card.
         fromTo (not from) so start/end values are explicit — robust against StrictMode remounts
         and CSS transitions that would otherwise corrupt the captured "natural" end state.
         The CTA buttons and card clear their inline styles on completion so Tailwind
         hover/active transforms keep working afterwards. */
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-hero-eyebrow]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6 }
        )
        .fromTo(
          "[data-title-line]",
          { autoAlpha: 0, y: 48 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 },
          "-=0.3"
        )
        .fromTo(
          "[data-hero-copy]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          "-=0.45"
        )
        .fromTo(
          "[data-hero-cta] > *",
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            clearProps: "all",
          },
          "-=0.4"
        )
        .fromTo(
          "[data-hero-stats] > *",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 },
          "-=0.35"
        )
        .fromTo(
          "[data-parallax-card]",
          { autoAlpha: 0, scale: 0.9 },
          { autoAlpha: 1, scale: 1, duration: 0.9, clearProps: "all" },
          "-=0.55"
        );

      /* Hero parallax, tied to scroll (scrub): the media layer drifts slower than the page
         (scaled up 1.08 so no edge is ever exposed), the copy lifts gently without prematurely fading,
         and the card tracks scroll smoothly without high-lag scrub. */
      gsap.set("[data-hero-media]", { scale: 1.08 });
      gsap.to("[data-hero-media]", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-hero]",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to("[data-hero-content]", {
        y: -50,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-hero]",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to("[data-parallax-card]", {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-hero]",
          start: "top top",
          end: "bottom top",
          scrub: 0.3,
        },
      });

      /* Interactive headline: pointer depth on the h1 (via gsap.quickTo — one reused tween per
         axis instead of a new tween per pointermove), per-line hover focus, card tilt. */
      const heroEl = root.querySelector<HTMLElement>("[data-hero]");
      const titleEl = root.querySelector<HTMLElement>("[data-hero-title]");
      const tiltEl = root.querySelector<HTMLElement>("[data-card-tilt]");
      const lines = Array.from(
        root.querySelectorAll<HTMLElement>("[data-title-line]")
      );

      let onPointerMove: ((event: PointerEvent) => void) | undefined;
      if (heroEl && titleEl) {
        const titleX = gsap.quickTo(titleEl, "x", {
          duration: 0.7,
          ease: "power3",
        });
        const titleY = gsap.quickTo(titleEl, "y", {
          duration: 0.7,
          ease: "power3",
        });
        const tiltX = tiltEl
          ? gsap.quickTo(tiltEl, "x", { duration: 0.6, ease: "power3" })
          : undefined;
        const tiltY = tiltEl
          ? gsap.quickTo(tiltEl, "y", { duration: 0.6, ease: "power3" })
          : undefined;
        const tiltRotation = tiltEl
          ? gsap.quickTo(tiltEl, "rotation", { duration: 0.6, ease: "power3" })
          : undefined;
        onPointerMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return; // touch pointers don't drive parallax
          const rect = heroEl.getBoundingClientRect();
          const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          titleX(nx * 16);
          titleY(ny * 9);
          tiltX?.(nx * 12);
          tiltY?.(ny * 8);
          tiltRotation?.(-5 + nx * 5);
        };
        heroEl.addEventListener("pointermove", onPointerMove);
      }

      /* Hovering a headline line lifts it 16px and dims the others — transform/opacity only. */
      const lineBindings: Array<[HTMLElement, string, EventListener]> = [];
      lines.forEach(line => {
        const enter: EventListener = safe(() => {
          lines.forEach(other => {
            const target =
              other === line
                ? { x: 16, autoAlpha: 1 }
                : { x: 0, autoAlpha: 0.45 };
            gsap.to(other, {
              ...target,
              duration: 0.4,
              ease: "power3.out",
              overwrite: "auto",
            });
          });
        });
        const leave: EventListener = safe(() => {
          gsap.to(lines, {
            x: 0,
            autoAlpha: 1,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
        line.addEventListener("pointerenter", enter);
        line.addEventListener("pointerleave", leave);
        lineBindings.push(
          [line, "pointerenter", enter],
          [line, "pointerleave", leave]
        );
      });

      /* Section reveals. Snappy, editorial entrances with early triggers and responsive fastScrollEnd.
         Everything uses fromTo with explicit start/end values and clearProps: "all" on completion.
         fastScrollEnd: 350 ensures any scroll velocity > 350px/s immediately completes the reveal. */
      gsap.utils.toArray<HTMLElement>("[data-reveal]", root).forEach(el => {
        entranceAnims.push(
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
              clearProps: "all",
              scrollTrigger: {
                trigger: el,
                start: "top bottom+=40px",
                once: true,
                fastScrollEnd: 350,
              },
            }
          )
        );
      });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal-stagger]", root)
        .forEach(group => {
          const kids = Array.from(group.children).filter(
            el => !el.hasAttribute("data-reveal-title")
          );
          entranceAnims.push(
            gsap.fromTo(
              kids,
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.035,
                ease: "power2.out",
                clearProps: "all",
                scrollTrigger: {
                  trigger: group,
                  start: "top 95%",
                  once: true,
                  fastScrollEnd: 350,
                },
              }
            )
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal-title]", root)
        .forEach(title => {
          entranceAnims.push(
            gsap.fromTo(
              title,
              { y: 18, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.45,
                ease: "power2.out",
                clearProps: "all",
                scrollTrigger: {
                  trigger: title,
                  start: "top 95%",
                  once: true,
                  fastScrollEnd: 350,
                },
              }
            )
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal-fade]", root)
        .forEach(group => {
          const tiles = Array.from(group.children);
          entranceAnims.push(
            gsap.fromTo(
              tiles,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                duration: 0.35,
                stagger: 0.02,
                ease: "power1.out",
                clearProps: "all",
                scrollTrigger: {
                  trigger: group,
                  start: "top 95%",
                  once: true,
                  fastScrollEnd: 350,
                },
              }
            )
          );
          entranceAnims.push(
            gsap.fromTo(
              tiles,
              { backgroundColor: "rgba(215,243,91,0.16)" },
              {
                backgroundColor: "#0e121a",
                duration: 0.45,
                stagger: 0.02,
                ease: "power2.out",
                clearProps: "backgroundColor",
                scrollTrigger: {
                  trigger: group,
                  start: "top 95%",
                  once: true,
                  fastScrollEnd: 350,
                },
              }
            )
          );
        });

      gsap.utils
        .toArray<HTMLElement>(".section-title span", root)
        .forEach(span => {
          entranceAnims.push(
            gsap.fromTo(
              span,
              { color: "#d7f35b" },
              {
                color: "rgba(255,255,255,0.38)",
                duration: 0.8,
                ease: "power2.out",
                clearProps: "color",
                scrollTrigger: {
                  trigger: span,
                  start: "top 95%",
                  once: true,
                  fastScrollEnd: 350,
                },
              }
            )
          );
        });

      /* Bidirectional Instant Visibility & Fast-Scroll Manager:
         Solves root cause of missing/delayed content during fast scrolls (both downwards AND upwards).
         1. Generous IntersectionObserver (300px margin) pre-completes entrance animations before
            elements reach the visible screen.
         2. High-frequency velocity detection: if scroll velocity > 200px/s, all approaching elements
            in the scroll direction are immediately fast-forwarded to progress(1).
         3. Ultra-fast flings (> 700px/s): instantly reveals ALL elements on the page.
         4. Reverse scrolling (down-to-up): instantly completes any element entering from above
            or positioned at/above the viewport. */
      const completeAnim = (anim: gsap.core.Tween) => {
        if (anim.progress() < 1) {
          anim.progress(1);
        }
      };

      const completeAllAnims = () => {
        for (let i = 0; i < entranceAnims.length; i++) {
          completeAnim(entranceAnims[i]);
        }
      };

      const checkNearbyAnims = (direction: "up" | "down" | "any") => {
        const vh = window.innerHeight;
        for (let i = 0; i < entranceAnims.length; i++) {
          const anim = entranceAnims[i];
          if (anim.progress() >= 1) continue;
          const targets = anim.targets() as HTMLElement[];
          if (!targets || targets.length === 0) continue;

          let shouldReveal = false;
          for (let t = 0; t < targets.length; t++) {
            const rect = targets[t].getBoundingClientRect();
            if (direction === "up") {
              if (rect.top < vh + 200 && rect.bottom > -400) {
                shouldReveal = true;
                break;
              }
            } else if (direction === "down") {
              if (rect.top < vh + 450 && rect.bottom > -200) {
                shouldReveal = true;
                break;
              }
            } else {
              if (rect.top < vh + 450 && rect.bottom > -450) {
                shouldReveal = true;
                break;
              }
            }
          }
          if (shouldReveal) completeAnim(anim);
        }
      };

      // 300px lookahead buffer in both directions (pre-reveals elements before visible)
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              for (let i = 0; i < entranceAnims.length; i++) {
                const anim = entranceAnims[i];
                if (anim.progress() >= 1) continue;
                const targets = anim.targets() as HTMLElement[];
                if (
                  targets.includes(el) ||
                  targets.some(t => el.contains(t) || t.contains(el))
                ) {
                  completeAnim(anim);
                }
              }
            }
          });
        },
        { rootMargin: "300px 0px 300px 0px" }
      );

      const revealContainers = root.querySelectorAll<HTMLElement>(
        "[data-reveal], [data-reveal-stagger], [data-reveal-title], [data-reveal-fade]"
      );
      revealContainers.forEach(el => observer.observe(el));

      // Initial check for anything in or near the starting viewport
      checkNearbyAnims("any");

      let lastY = window.scrollY;
      let lastTime = performance.now();
      let scrollTimer: ReturnType<typeof setTimeout> | null = null;

      const onScroll = () => {
        const now = performance.now();
        const currentY = window.scrollY;
        const dt = (now - lastTime) / 1000;
        const dy = currentY - lastY;
        const velocity = dt > 0.003 ? Math.abs(dy) / dt : 0;
        const scrollingUp = dy < 0;

        lastY = currentY;
        lastTime = now;

        if (velocity > 700) {
          completeAllAnims();
        } else if (velocity > 180) {
          checkNearbyAnims(scrollingUp ? "up" : "down");
        } else if (scrollingUp) {
          checkNearbyAnims("up");
        }

        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          checkNearbyAnims("any");
        }, 40);
      };

      window.addEventListener("scroll", onScroll, { passive: true });

      /* Playful hover pops on language tiles and step cards (mouse pointers only). */
      const popBindings: Array<[HTMLElement, string, EventListener]> = [];
      Array.from(root.querySelectorAll<HTMLElement>("[data-pop]")).forEach(
        el => {
          const enter: EventListener = safe(() => {
            gsap.to(el, {
              scale: 1.03,
              y: -4,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
          });
          const leave: EventListener = safe(() => {
            gsap.to(el, {
              scale: 1,
              y: 0,
              duration: 0.45,
              ease: "back.out(2)",
              overwrite: "auto",
            });
          });
          el.addEventListener("pointerenter", enter);
          el.addEventListener("pointerleave", leave);
          popBindings.push(
            [el, "pointerenter", enter],
            [el, "pointerleave", leave]
          );
        }
      );

      /* Decorative rings drift against the scroll (scrubbed, transform only). */
      gsap.utils.toArray<HTMLElement>("[data-ring]", root).forEach(ring => {
        gsap.to(ring, {
          y: -70,
          ease: "none",
          scrollTrigger: {
            trigger: ring.closest("section") ?? ring,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      revealTargetRef.current = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        entranceAnims.forEach(anim => {
          if (anim.progress() >= 1) return;
          const targets = anim.targets() as HTMLElement[];
          if (targets.some(t => el.contains(t) || t.contains(el))) {
            anim.progress(1);
          }
        });
      };

      return () => {
        revealTargetRef.current = null;
        window.removeEventListener("scroll", onScroll);
        observer.disconnect();
        if (scrollTimer) clearTimeout(scrollTimer);
        if (heroEl && onPointerMove)
          heroEl.removeEventListener("pointermove", onPointerMove);
        lineBindings.forEach(([element, type, handler]) =>
          element.removeEventListener(type, handler)
        );
        popBindings.forEach(([element, type, handler]) =>
          element.removeEventListener(type, handler)
        );
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="min-h-screen overflow-x-hidden bg-[#090b10] text-[#f5f6f2] selection:bg-[#d7f35b] selection:text-[#090b10]"
    >
      <header className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-[1380px] overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#090b10]/35 shadow-[0_12px_48px_rgba(0,0,0,.28)] backdrop-blur-2xl backdrop-saturate-150 transition-[background-color] duration-300 ease-out hover:bg-[#090b10]/60 lg:left-6 lg:right-6 lg:top-6">
        <div className="mx-auto flex h-[68px] max-w-[1380px] items-center justify-between px-5 lg:px-10">
          <button
            onClick={() => scrollTo("top")}
            className="group flex items-center gap-3"
            aria-label="Lingo home"
          >
            <span className="relative grid size-9 place-items-center rounded-xl bg-[#d7f35b] text-[#090b10] shadow-[0_0_32px_rgba(215,243,91,.17)]">
              <span className="size-3 rounded-full border-[2px] border-[#090b10] border-r-transparent rotate-45" />
              <span className="absolute size-5 rounded-full border-[2px] border-[#090b10]/60 border-l-transparent -rotate-45" />
            </span>
            <span className="font-display flex items-baseline text-[22px] font-bold tracking-[-0.09em]">
              <span className="relative mr-0.5">
                l
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-3 bg-[#d7f35b]" />
              </span>
              ingo<span className="ml-0.5 text-[#d7f35b]">◌</span>
            </span>
          </button>
          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-white/55 md:flex">
            <button onClick={() => scrollTo("how")}>How it works</button>
            <button onClick={() => scrollTo("languages")}>Languages</button>
            <button onClick={() => scrollTo("practice")}>Practice</button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={comingSoon}
              className="hidden px-3 py-2 text-[13px] font-semibold text-white/65 transition hover:text-white sm:block"
            >
              Sign in
            </button>
            <button
              onClick={begin}
              className="rounded-full bg-[#d7f35b] px-4 py-2.5 text-[13px] font-bold text-[#090b10] transition hover:-translate-y-0.5 hover:bg-[#e4fb7a] active:scale-[.97]"
            >
              Start talking <ArrowUpRight className="ml-1 inline size-3.5" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="grid size-10 place-items-center rounded-full border border-white/10 md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="bg-white/[0.045] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-5 text-sm text-white/70">
              <button
                onClick={() => {
                  scrollTo("how");
                  setMobileOpen(false);
                }}
              >
                How it works
              </button>
              <button
                onClick={() => {
                  scrollTo("languages");
                  setMobileOpen(false);
                }}
              >
                Languages
              </button>
              <button
                onClick={() => {
                  scrollTo("practice");
                  setMobileOpen(false);
                }}
              >
                Practice
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section
          data-hero
          className="relative min-h-[780px] overflow-hidden border-b border-white/[0.07] pt-[112px] lg:pt-[120px]"
        >
          <div
            data-hero-media
            className="absolute inset-0 will-change-transform"
          >
            <img
              src="/hero.svg"
              alt="Abstract luminous language signals"
              className="absolute inset-0 size-full object-cover opacity-[0.14]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(55,125,168,.16),transparent_33%),linear-gradient(90deg,#090b10_10%,rgba(9,11,16,.66)_46%,rgba(9,11,16,.1))]" />
            <BeamsBackground className="absolute inset-0" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,16,.15),#090b10_94%)]" />
          </div>
          <div
            data-hero-content
            className="relative mx-auto flex min-h-[708px] max-w-[1380px] items-center px-5 py-24 will-change-transform lg:px-10"
          >
            <div className="max-w-[920px]">
              <div
                data-hero-eyebrow
                className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.22em] text-[#d7f35b]"
              >
                <span className="size-2 rounded-full bg-[#d7f35b] shadow-[0_0_18px_#d7f35b]" />
                The conversation-first language studio
              </div>
              <h1
                data-hero-title
                className="font-display max-w-[920px] text-[clamp(2.4rem,9.5vw,7rem)] font-bold leading-[.94] tracking-[-.045em]"
              >
                <span data-title-line className="block">
                  Speak first.
                </span>
                <span data-title-line className="block text-white/55">
                  Understand more
                </span>
                <span data-title-line className="block text-[#d7f35b]">
                  every time.
                </span>
              </h1>
              <p
                data-hero-copy
                className="mt-9 max-w-[460px] text-[17px] leading-7 text-white/70"
              >
                Have real conversations with an AI that speaks your language —
                and teaches you theirs, one natural exchange at a time.
              </p>
              <div
                data-hero-cta
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={begin}
                  className="rounded-full bg-[#d7f35b] px-6 py-3.5 text-sm font-bold text-[#090b10] transition hover:-translate-y-1 hover:bg-[#e4fb7a] active:scale-[.97]"
                >
                  Start a conversation{" "}
                  <ArrowUpRight className="ml-2 inline size-4" />
                </button>
                <button
                  onClick={() => scrollTo("how")}
                  className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:bg-white/5"
                >
                  See how it works
                </button>
              </div>
              <div
                data-hero-stats
                className="mt-16 flex items-center gap-7 text-[11px] font-semibold uppercase tracking-[.14em] text-white/35"
              >
                <span>30+ languages</span>
                <span className="h-3 w-px bg-white/15" />
                <span>Adaptive difficulty</span>
                <span className="hidden h-3 w-px bg-white/15 sm:block" />
                <span className="hidden sm:block">Learn in context</span>
              </div>
            </div>
            <div
              data-parallax-card
              className="absolute bottom-12 right-10 hidden w-[270px] lg:block will-change-transform"
            >
              <div
                data-card-tilt
                className="rotate-[-5deg] will-change-transform"
              >
                <div className="animate-float rounded-2xl border border-white/15 bg-[#11151d]/75 p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-white/35">
                    <span>Live signal</span>
                    <span className="text-[#d7f35b]">+24 words</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-1.5 w-4/5 rounded-full bg-[#d7f35b]/80" />
                    <div className="h-1.5 w-3/5 rounded-full bg-cyan-300/50" />
                    <div className="h-1.5 w-2/5 rounded-full bg-violet-300/45" />
                  </div>
                  <p className="mt-5 text-xs leading-5 text-white/60">
                    Your tutor is listening for patterns, not perfection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how"
          className="relative mx-auto max-w-[1380px] scroll-mt-28 overflow-hidden px-5 py-28 lg:px-10 lg:py-36"
        >
          <div className="pointer-events-none absolute right-10 top-14 hidden text-[10px] font-bold uppercase tracking-[.25em] text-white/15 lg:block">
            ATLAS / 01 — LISTEN → SPEAK
          </div>
          <div className="pointer-events-none absolute left-5 top-24 h-px w-24 bg-[#d7f35b]/40 lg:left-10" />
          <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-28">
            <div data-reveal-stagger>
              <p className="eyebrow">01 / The method</p>
              <h2 data-reveal-title className="section-title mt-5">
                A better way to
                <br />
                <span>find your words.</span>
              </h2>
              <p className="mt-7 max-w-[340px] text-[15px] leading-7 text-white/50">
                No drills to grind through. No red marks interrupting your
                thought. Just a patient, perceptive tutor who meets you where
                you are.
              </p>
            </div>
            <div data-reveal-stagger className="grid gap-3 sm:grid-cols-3">
              <Step
                n="01"
                icon={<Globe2 />}
                title="Pick a language"
                body="Choose from a growing universe of languages and find a reason to speak."
              />
              <Step
                n="02"
                icon={<MessageCircle />}
                title="Start talking"
                body="Type naturally, even in English. Your tutor will meet you halfway."
              />
              <Step
                n="03"
                icon={<Sparkles />}
                title="Learn in context"
                body="Translations, pronunciation, and nuance appear exactly when you need them."
              />
            </div>
          </div>
        </section>

        <section
          id="practice"
          className="relative scroll-mt-28 overflow-hidden border-y border-white/[0.07] bg-[#0e121a] py-20 lg:py-28"
        >
          <div
            data-ring
            className="pointer-events-none absolute right-[-40px] top-[-80px] size-[270px] rounded-full border border-cyan-300/10"
          />
          <div
            data-ring
            className="pointer-events-none absolute right-[20px] top-[-20px] size-[150px] rounded-full border border-violet-300/10"
          />
          <div className="mx-auto max-w-[1380px] px-5 lg:px-10">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
              <div data-reveal-stagger>
                <p className="eyebrow text-[#d7f35b]">02 / Try the feeling</p>
                <h2 data-reveal-title className="section-title mt-4">
                  A conversation,
                  <br />
                  <span>not a worksheet.</span>
                </h2>
              </div>
              <div
                data-reveal
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] p-1"
              >
                <button className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                  Spanish
                </button>
                <button
                  onClick={() =>
                    toast("More languages are waiting", {
                      description: "Choose your first language to begin.",
                    })
                  }
                  className="rounded-full px-4 py-2 text-xs font-semibold text-white/45"
                >
                  + 30 languages
                </button>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
              <div
                data-reveal
                className="overflow-hidden rounded-[24px] border border-white/10 bg-[#090b10] shadow-[0_30px_100px_rgba(0,0,0,.28)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-[#d7f35b] text-[#090b10]">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Café conversation</p>
                      <p className="text-[11px] text-white/40">
                        Spanish · Beginner
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toast("Conversation options", {
                        description: "Save, rename, or start fresh.",
                      })
                    }
                    className="text-white/40 hover:text-white"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <div
                  data-reveal-stagger
                  className="min-h-[370px] space-y-6 p-5 sm:p-8"
                >
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[78%]"
                          : "max-w-[78%]"
                      }
                    >
                      <div
                        className={
                          m.role === "user"
                            ? "rounded-2xl rounded-br-sm bg-[#26303d] px-4 py-3 text-[15px] leading-6 text-white"
                            : "rounded-2xl rounded-bl-sm border border-white/10 bg-[#141a23] px-4 py-3 text-[16px] leading-7 text-white"
                        }
                      >
                        {m.text}
                      </div>
                      {m.role === "ai" && translate && (
                        <div className="mt-2 pl-2 text-[12px] leading-5 text-white/40">
                          {m.translation}
                        </div>
                      )}
                      {m.role === "ai" && (
                        <div className="mt-2 flex gap-3 pl-2 text-white/30">
                          <button
                            onClick={() =>
                              toast("Playing pronunciation", {
                                description:
                                  "Your tutor is speaking naturally.",
                              })
                            }
                            aria-label="Listen"
                          >
                            <Volume2 size={14} />
                          </button>
                          <button
                            onClick={() => setTranslate(!translate)}
                            className="text-[11px] font-semibold hover:text-[#d7f35b]"
                          >
                            {translate ? "Hide translation" : "Translate"}
                          </button>
                          <button
                            onClick={() => {
                              setSaved(!saved);
                              toast(
                                saved
                                  ? "Removed from saved phrases"
                                  : "Phrase saved to vocabulary"
                              );
                            }}
                            className={
                              saved
                                ? "text-[#d7f35b]"
                                : "text-[11px] font-semibold hover:text-[#d7f35b]"
                            }
                          >
                            {saved ? <Check size={14} /> : "Save"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 p-4">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-2 pl-4 focus-within:border-[#d7f35b]/60">
                    <input
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder="Say anything… English is okay"
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                      aria-label="Your message"
                    />
                    <button
                      onClick={() => toast("Voice mode coming soon")}
                      className="grid size-9 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white"
                      aria-label="Voice input"
                    >
                      <Mic size={17} />
                    </button>
                    <button
                      onClick={sendMessage}
                      className="grid size-9 place-items-center rounded-lg bg-[#d7f35b] text-[#090b10] transition hover:bg-[#e4fb7a] active:scale-95"
                      aria-label="Send message"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <aside data-reveal-stagger className="hidden space-y-3 lg:block">
                <div className="rounded-2xl border border-white/10 bg-[#141a23] p-5">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">Learning context</p>
                    <button className="text-white/35">
                      <Settings2 size={15} />
                    </button>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">Beginner</p>
                      <p className="mt-1 text-xs text-white/40">
                        Your current level
                      </p>
                    </div>
                    <span className="rounded-full bg-[#d7f35b]/10 px-2 py-1 text-[10px] font-bold text-[#d7f35b]">
                      12% to A1
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[12%] rounded-full bg-[#d7f35b]" />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#141a23] p-5">
                  <div className="flex items-center gap-2 text-[#d7f35b]">
                    <BookOpen size={15} />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Useful phrase
                    </p>
                  </div>
                  <p className="mt-4 text-sm font-semibold">Me gustaría…</p>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    I would like… · A friendly way to make a request.
                  </p>
                  <button
                    onClick={() => toast("Phrase saved to your vocabulary")}
                    className="mt-4 text-xs font-bold text-[#d7f35b]"
                  >
                    Add to vocabulary +
                  </button>
                </div>
                <div className="rounded-2xl border border-[#d7f35b]/20 bg-[#d7f35b]/[.05] p-5">
                  <p className="text-xs font-bold text-[#d7f35b]">Tutor note</p>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    You're communicating clearly. Keep the sentence short and
                    let the conversation carry you.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section
          id="languages"
          className="relative mx-auto max-w-[1380px] scroll-mt-28 overflow-hidden px-5 py-28 lg:px-10 lg:py-36"
        >
          <div className="pointer-events-none absolute left-5 top-16 hidden text-[10px] font-bold uppercase tracking-[.25em] text-white/15 lg:block">
            COORDINATES / 40° 43′ N, 74° 00′ W
          </div>
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
            <div data-reveal-stagger>
              <p className="eyebrow">03 / Your atlas</p>
              <h2 data-reveal-title className="section-title mt-5">
                Go where the
                <br />
                <span>conversation leads.</span>
              </h2>
              <p className="mt-7 max-w-[340px] text-[15px] leading-7 text-white/50">
                Start with Spanish. Stay for the worlds it opens. Every language
                is an invitation to notice more.
              </p>
              <button
                onClick={begin}
                className="mt-8 text-sm font-bold text-[#d7f35b]"
              >
                Explore all languages{" "}
                <ArrowUpRight className="ml-1 inline size-4" />
              </button>
            </div>
            <div
              data-reveal-fade
              className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-4"
            >
              {languages.map((lang, i) => (
                <button
                  key={lang}
                  onClick={() =>
                    toast(`${lang} selected`, {
                      description: "Your tutor is ready when you are.",
                    })
                  }
                  data-pop
                  className="group flex min-h-[106px] flex-col justify-between bg-[#0e121a] p-4 text-left transition-colors duration-200 hover:bg-[#171e2a]"
                >
                  <span className="text-[11px] text-white/25">0{i + 1}</span>
                  <span className="flex items-center justify-between text-sm font-semibold text-white/75 group-hover:text-[#d7f35b]">
                    {lang}
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-white/[0.07] bg-[#0e121a] text-white">
          <div
            data-ring
            className="pointer-events-none absolute -right-24 -top-24 size-[380px] rounded-full border border-[#d7f35b]/15"
          />
          <div
            data-ring
            className="pointer-events-none absolute right-[-10px] top-[-10px] size-[220px] rounded-full border border-[#d7f35b]/10"
          />
          <div className="mx-auto flex max-w-[1380px] flex-col items-start justify-between gap-10 px-5 py-20 sm:flex-row sm:items-end lg:px-10 lg:py-28">
            <div data-reveal-stagger>
              <p className="eyebrow text-[#d7f35b]">04 / The next word</p>
              <h2
                data-reveal-title
                className="font-display mt-5 max-w-[670px] text-[clamp(3rem,6vw,6.5rem)] font-bold leading-[.9] tracking-[-.08em]"
              >
                Your next language starts with a{" "}
                <span className="text-[#d7f35b]">conversation.</span>
              </h2>
            </div>
            <button
              data-reveal
              onClick={begin}
              className="shrink-0 rounded-full bg-[#090b10] px-6 py-4 text-sm font-bold text-[#d7f35b] transition hover:-translate-y-1 hover:bg-[#171e2a]"
            >
              Start talking <ArrowUpRight className="ml-2 inline size-4" />
            </button>
          </div>
        </section>
      </main>
      <footer className="bg-[#090b10] px-5 py-8 lg:px-10">
        <div
          data-reveal
          className="mx-auto flex max-w-[1380px] flex-col justify-between gap-5 text-xs text-white/35 sm:flex-row"
        >
          <p>© 2026 lingo. Conversation is the curriculum.</p>
          <div className="flex gap-5">
            <button
              onClick={comingSoon}
              className="transition hover:text-white"
            >
              Privacy
            </button>
            <button
              onClick={comingSoon}
              className="transition hover:text-white"
            >
              Terms
            </button>
            <button
              onClick={comingSoon}
              className="transition hover:text-white"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div data-pop className="border-t border-white/15 pt-5">
      <div className="flex items-center justify-between text-white/35">
        <span className="text-[11px] font-bold tracking-[.18em]">{n}</span>
        <span className="text-[#d7f35b]">{icon}</span>
      </div>
      <h3 className="mt-14 font-display text-xl font-bold tracking-[-.04em]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/45">{body}</p>
    </div>
  );
}
