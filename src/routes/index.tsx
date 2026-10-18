import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Album3D, DEFAULT_PHOTOS, type PhotoItem } from "../components/Album3D";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chúc mừng ngày Phụ nữ Việt Nam 20/10" },
      { name: "description", content: "Thiệp chúc mừng 20/10 với album ảnh kỷ niệm 3D đầy yêu thương." },
      { property: "og:title", content: "Chúc mừng ngày Phụ nữ Việt Nam 20/10" },
      { property: "og:description", content: "Mở album ảnh kỷ niệm 3D và gửi lời chúc yêu thương nhân ngày 20/10." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 8 + Math.random() * 10,
        size: 10 + Math.random() * 18,
      })),
    [],
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
// Flowers are emitted as mathematically even spiral layers. Every ring has a
// fixed number of equally spaced slots, which prevents the empty gaps and the
// parabolic streaks produced by a single point-by-point Archimedean sequence.
const ringPoint = (
  index: number,
  counts: number[],
  radiusX: number[],
  radiusY: number[],
  seed: number,
) => {
  let layer = 0;
  let offset = index;
  while (layer < counts.length - 1 && offset >= counts[layer]) {
    offset -= counts[layer];
    layer += 1;
  }
  const slot = offset / counts[layer];
  const angle = layer * 0.34 + slot * Math.PI * 2 + (rand(seed + layer) - 0.5) * 0.045;
  const p1Angle = angle + 1.55;
  const p2Angle = angle + 3.05;
  const p3Angle = angle + 4.45;
  const p4Angle = angle + 5.55;
  const rx = radiusX[layer];
  const ry = radiusY[layer];
  const x = Math.cos(angle) * radiusX[layer];
  const y = Math.sin(angle) * radiusY[layer];
  return {
    layer,
    x,
    y,
    p1X: Math.cos(p1Angle) * rx * 0.16,
    p1Y: Math.sin(p1Angle) * ry * 0.16,
    p2X: Math.cos(p2Angle) * rx * 0.36,
    p2Y: Math.sin(p2Angle) * ry * 0.36,
    p3X: Math.cos(p3Angle) * rx * 0.61,
    p3Y: Math.sin(p3Angle) * ry * 0.61,
    p4X: Math.cos(p4Angle) * rx * 0.82,
    p4Y: Math.sin(p4Angle) * ry * 0.82,
    // A ring gets its own window. The tiny slot offset keeps the ring alive
    // without allowing all layers to pile up at the centre at once.
    delay: layer * 0.65 + slot * 0.02,
  };
};

const OUTER_LAYER_COUNTS = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
const OUTER_RADIUS_X = [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53];
const OUTER_RADIUS_Y = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43];
const OUTER_BLOOM_COUNT = OUTER_LAYER_COUNTS.reduce((sum, count) => sum + count, 0);
const INTRO_BLOOMS = Array.from({ length: OUTER_BLOOM_COUNT }, (_, i) => {
  const point = ringPoint(i, OUTER_LAYER_COUNTS, OUTER_RADIUS_X, OUTER_RADIUS_Y, i + 11);

  return {
    id: i,
    type: Math.floor(rand(i + 71) * 5),
    petals: 6 + Math.floor(rand(i + 81) * 7),
    x: point.x,
    y: point.y,
    p1X: point.p1X,
    p1Y: point.p1Y,
    p2X: point.p2X,
    p2Y: point.p2Y,
    p3X: point.p3X,
    p3Y: point.p3Y,
    p4X: point.p4X,
    p4Y: point.p4Y,
    layer: point.layer,
    scale: 0.56 + (1 - point.layer / 11) * 0.18 + rand(i + 201) * 0.08,
    delay: 0.08 + point.delay + rand(i + 301) * 0.12,
    duration: 1.8 + rand(i + 401) * 0.2,
    rotation: (rand(i + 501) - 0.5) * 38,
    spin: 10 + rand(i + 551) * 14,
    motion: Math.floor(rand(i + 601) * 3),
    floatDuration: 3.8 + rand(i + 651) * 3.8,
    floatDelay: rand(i + 701) * 2.2,
    floatX: (rand(i + 751) - 0.5) * 5.2,
    floatY: (rand(i + 801) - 0.5) * 6.5,
    floatRotate: (rand(i + 851) - 0.5) * 30,
    depth: (rand(i + 901) - 0.5) * 140,
    hue: [338, 348, 18, 52, 324][i % 5],
  };
});

const INTRO_SPARKLES = Array.from({ length: 118 }, (_, i) => ({
  id: i,
  x: (rand(i + 601) - 0.5) * 100,
  y: (rand(i + 701) - 0.5) * 100,
  size: 2 + rand(i + 801) * 5,
  delay: rand(i + 901) * 0.65,
  duration: 1.4 + rand(i + 1001) * 0.8,
}));

const CENTER_LAYER_COUNTS = [6, 8, 8, 8];
const CENTER_RADIUS_X = [4, 11, 18, 25];
const CENTER_RADIUS_Y = [4, 9, 14, 19];
const INTRO_CENTER_BLOOMS = Array.from({ length: 30 }, (_, i) => {
  const point = ringPoint(i, CENTER_LAYER_COUNTS, CENTER_RADIUS_X, CENTER_RADIUS_Y, i + 1201);
  return {
  id: `center-${i}`,
  type: Math.floor(rand(i + 1871) * 5),
  petals: 7 + Math.floor(rand(i + 1881) * 6),
  x: point.x,
  y: point.y,
  p1X: point.p1X,
  p1Y: point.p1Y,
  p2X: point.p2X,
  p2Y: point.p2Y,
  p3X: point.p3X,
  p3Y: point.p3Y,
  p4X: point.p4X,
  p4Y: point.p4Y,
  layer: point.layer + 10,
  scale: 0.4 + rand(i + 1401) * 0.2,
  delay: 0.12 + point.delay + rand(i + 1501) * 0.12,
  duration: 1.9 + rand(i + 1601) * 0.2,
  rotation: (rand(i + 1701) - 0.5) * 120,
  spin: 8 + rand(i + 1801) * 12,
  motion: Math.floor(rand(i + 1901) * 3),
  floatDuration: 4.4 + rand(i + 1951) * 3.4,
  floatDelay: rand(i + 2001) * 2.4,
  floatX: (rand(i + 2051) - 0.5) * 4.5,
  floatY: (rand(i + 2101) - 0.5) * 5.5,
  floatRotate: (rand(i + 2151) - 0.5) * 24,
  depth: (rand(i + 2201) - 0.5) * 160,
  hue: [340, 350, 18, 44, 326][i % 5],
  };
});

const INTRO_BUBBLES = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  x: rand(i + 2101) * 100,
  y: 48 + rand(i + 2201) * 55,
  size: 5 + rand(i + 2301) * 18,
  delay: rand(i + 2401) * 2.4,
  duration: 3.8 + rand(i + 2501) * 3.2,
}));
const css = (value: number, digits = 4) => value.toFixed(digits);

function Intro() {
  const [phase, setPhase] = useState<"bloom" | "hold" | "exit">("bloom");
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPhase("hold"), 9000);
    return () => clearTimeout(t);
  }, []);
  const continueIntoAlbum = () => {
    if (phase !== "hold") return;
    setPhase("exit");
    window.setTimeout(() => setDone(true), 1450);
  };
  if (done) return null;
  return (
    <div className={`intro intro-phase-${phase}`} aria-label="Màn hoa mở đầu">
      <div className="intro-veil" />
      <div className="intro-bloom-field">
        {INTRO_BUBBLES.map((bubble) => (
          <span
            key={bubble.id}
            className="intro-bubble"
            style={{
              left: `${css(bubble.x)}%`,
              top: `${css(bubble.y)}%`,
              width: `${css(bubble.size, 3)}px`,
              height: `${css(bubble.size, 3)}px`,
              animationDelay: `${css(bubble.delay, 3)}s`,
              animationDuration: `${css(bubble.duration, 3)}s`,
            }}
          />
        ))}
        {INTRO_SPARKLES.map((sparkle) => (
          <span
            key={sparkle.id}
            className="intro-sparkle"
            style={{
              left: `${css(50 + sparkle.x)}%`,
              top: `${css(50 + sparkle.y)}%`,
              width: `${css(sparkle.size, 3)}px`,
              height: `${css(sparkle.size, 3)}px`,
              animationDelay: `${css(sparkle.delay, 3)}s`,
              animationDuration: `${css(sparkle.duration, 3)}s`,
            }}
          />
        ))}
        <div className="intro-bouquet">
        {INTRO_BLOOMS.map((bloom) => (
          <div
            key={bloom.id}
            className={`intro-bloom intro-motion-${bloom.motion} intro-bloom-${bloom.type}`}
            style={{
              ["--bloom-x" as string]: `${css(bloom.x)}vw`,
              ["--bloom-y" as string]: `${css(bloom.y)}vh`,
              ["--bloom-p1-x" as string]: `${css(bloom.p1X)}vw`,
              ["--bloom-p1-y" as string]: `${css(bloom.p1Y)}vh`,
              ["--bloom-p2-x" as string]: `${css(bloom.p2X)}vw`,
              ["--bloom-p2-y" as string]: `${css(bloom.p2Y)}vh`,
              ["--bloom-p3-x" as string]: `${css(bloom.p3X)}vw`,
              ["--bloom-p3-y" as string]: `${css(bloom.p3Y)}vh`,
              ["--bloom-p4-x" as string]: `${css(bloom.p4X)}vw`,
              ["--bloom-p4-y" as string]: `${css(bloom.p4Y)}vh`,
              ["--bloom-layer" as string]: `${bloom.layer}`,
              ["--bloom-scale" as string]: css(bloom.scale),
              ["--bloom-delay" as string]: `${css(bloom.delay, 3)}s`,
              ["--bloom-duration" as string]: `${css(bloom.duration, 3)}s`,
              ["--bloom-rotation" as string]: `${css(bloom.rotation)}deg`,
              ["--bloom-spin" as string]: `${css(bloom.spin)}deg`,
              ["--motion" as string]: `${bloom.motion}`,
              ["--float-duration" as string]: `${css(bloom.floatDuration, 3)}s`,
              ["--float-delay" as string]: `${css(bloom.floatDelay, 3)}s`,
              ["--float-x" as string]: `${css(bloom.floatX)}vw`,
              ["--float-y" as string]: `${css(bloom.floatY)}vh`,
              ["--float-rotate" as string]: `${css(bloom.floatRotate)}deg`,
              ["--bloom-depth" as string]: `${css(bloom.depth)}px`,
              ["--bloom-hue" as string]: `${css(bloom.hue)}deg`,
            }}
          >
            <div className={`intro-flower intro-flower-${bloom.type}`}>
              {Array.from({ length: bloom.petals }, (_, petal) => (
                <span
                  key={petal}
                  className="intro-flower-petal"
                  style={{ ["--petal-angle" as string]: `${petal * (360 / bloom.petals)}deg` }}
                />
              ))}
              <span className="intro-flower-center" />
            </div>
          </div>
        ))}
        {INTRO_CENTER_BLOOMS.map((bloom) => (
          <div
            key={bloom.id}
            className={`intro-bloom intro-center-bloom intro-motion-${bloom.motion} intro-bloom-${bloom.type}`}
            style={{
              ["--bloom-x" as string]: `${css(bloom.x)}vw`,
              ["--bloom-y" as string]: `${css(bloom.y)}vh`,
              ["--bloom-p1-x" as string]: `${css(bloom.p1X)}vw`,
              ["--bloom-p1-y" as string]: `${css(bloom.p1Y)}vh`,
              ["--bloom-p2-x" as string]: `${css(bloom.p2X)}vw`,
              ["--bloom-p2-y" as string]: `${css(bloom.p2Y)}vh`,
              ["--bloom-p3-x" as string]: `${css(bloom.p3X)}vw`,
              ["--bloom-p3-y" as string]: `${css(bloom.p3Y)}vh`,
              ["--bloom-p4-x" as string]: `${css(bloom.p4X)}vw`,
              ["--bloom-p4-y" as string]: `${css(bloom.p4Y)}vh`,
              ["--bloom-layer" as string]: `${bloom.layer}`,
              ["--bloom-scale" as string]: css(bloom.scale),
              ["--bloom-delay" as string]: `${css(bloom.delay, 3)}s`,
              ["--bloom-duration" as string]: `${css(bloom.duration, 3)}s`,
              ["--bloom-rotation" as string]: `${css(bloom.rotation)}deg`,
              ["--bloom-spin" as string]: `${css(bloom.spin)}deg`,
              ["--motion" as string]: `${bloom.motion}`,
              ["--float-duration" as string]: `${css(bloom.floatDuration, 3)}s`,
              ["--float-delay" as string]: `${css(bloom.floatDelay, 3)}s`,
              ["--float-x" as string]: `${css(bloom.floatX)}vw`,
              ["--float-y" as string]: `${css(bloom.floatY)}vh`,
              ["--float-rotate" as string]: `${css(bloom.floatRotate)}deg`,
              ["--bloom-depth" as string]: `${css(bloom.depth)}px`,
              ["--bloom-hue" as string]: `${css(bloom.hue)}deg`,
            }}
          >
            <div className={`intro-flower intro-flower-${bloom.type}`}>
              {Array.from({ length: bloom.petals }, (_, petal) => (
                <span
                  key={petal}
                  className="intro-flower-petal"
                  style={{ ["--petal-angle" as string]: `${petal * (360 / bloom.petals)}deg` }}
                />
              ))}
              <span className="intro-flower-center" />
            </div>
          </div>
        ))}
        <div className="intro-bloom-core" />
        </div>
      </div>
      {phase === "hold" && (
        <button className="intro-continue" type="button" onClick={continueIntoAlbum}>
          <span>Tiếp tục</span>
          <ArrowRight aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function Index() {
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [open, setOpen] = useState(false);

  const loadLocalFolderPhotos = async () => {
    try {
      const res = await fetch("/api/local-photos");
      if (!res.ok) return;
      const data = await res.json();

      const g10Photos: PhotoItem[] = (data["2024-2025"] || []).map((p: any, idx: number) => ({
        id: `local-g10-${idx}`,
        url: p.url,
        name: p.name,
        caption: "Khoảnh khắc thanh xuân lớp 10",
        date: "2024 - 2025",
        grade: "grade10"
      }));

      const g11Photos: PhotoItem[] = (data["2025-2026"] || []).map((p: any, idx: number) => ({
        id: `local-g11-${idx}`,
        url: p.url,
        name: p.name,
        caption: "Kỷ niệm thân thương lớp 11",
        date: "2025 - 2026",
        grade: "grade11"
      }));

      const g12Photos: PhotoItem[] = (data["2026-2027"] || []).map((p: any, idx: number) => ({
        id: `local-g12-${idx}`,
        url: p.url,
        name: p.name,
        caption: "Mùa hoa rạng rỡ lớp 12",
        date: "2026 - 2027",
        grade: "grade12"
      }));

      // Only use photos that actually exist in local folders
      const finalG10 = g10Photos;
      const finalG11 = g11Photos;
      const finalG12 = g12Photos;

      setPhotos([...finalG10, ...finalG11, ...finalG12]);
    } catch {
      // Fallback: keep current photos
    }
  };

  useEffect(() => {
    loadLocalFolderPhotos();

    // Re-check when window is focused (e.g. user dropped photos in Windows Explorer and switched back)
    const onFocus = () => loadLocalFolderPhotos();
    window.addEventListener("focus", onFocus);

    // Live update when Vite detects file changes
    if (import.meta.hot) {
      import.meta.hot.on("photos-updated", () => {
        loadLocalFolderPhotos();
      });
    }

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <main className="festive-bg relative min-h-screen overflow-hidden pb-20">
      <Petals />

      <Intro />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center px-4 py-12">
        <p className="reveal text-sm uppercase tracking-[0.4em] text-muted-foreground" style={{ animationDelay: "3.35s" }}>
          Ngày Phụ nữ Việt Nam
        </p>
        <h1 className="font-script mt-2 flex flex-wrap justify-center gap-x-[0.3em] text-center text-6xl md:text-8xl" aria-label="Chúc mừng 20/10">
          {["Chúc", "mừng", "20/10"].map((word, w, arr) => {
            const offset = arr.slice(0, w).join("").length + w;
            return (
              <span key={word} className="whitespace-nowrap">
                {word.split("").map((c, i) => (
                  <span key={i} className="letter" style={{ animationDelay: `${3.55 + (offset + i) * 0.08}s` }}>
                    {c}
                  </span>
                ))}
              </span>
            );
          })}
        </h1>
        <p
          className="reveal font-vietnam mt-5 flex max-w-xl items-center justify-center gap-2 px-4 text-center text-lg font-semibold text-rose-deep"
          style={{ animationDelay: "5.45s" }}
        >
          <span>Lời chúc đến các bạn nữ xinh đẹp lớp 12A4</span>
          <Heart className="h-5 w-5 fill-rose-500 text-rose-500" aria-hidden="true" />
        </p>
        <p
          className="reveal font-vietnam mx-auto mt-4 max-w-xl text-center text-foreground/80"
          style={{ animationDelay: "6.45s" }}
        >
          Gửi tới những người phụ nữ tuyệt vời của 12A4 — luôn xinh đẹp, hạnh phúc và tràn đầy yêu thương.
        </p>

        {/* 3D Luxury Album Component */}
        <div className="w-full mt-6">
          <Album3D
            photos={photos}
            isOpen={open}
            setIsOpen={setOpen}
          />
        </div>
      </section>
    </main>
  );
}
