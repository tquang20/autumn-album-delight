import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chúc mừng ngày Phụ nữ Việt Nam 20/10" },
      { name: "description", content: "Thiệp chúc mừng 20/10 với album ảnh kỷ niệm đầy yêu thương." },
      { property: "og:title", content: "Chúc mừng ngày Phụ nữ Việt Nam 20/10" },
      { property: "og:description", content: "Mở album ảnh kỷ niệm và gửi lời chúc yêu thương nhân ngày 20/10." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Photo = { url: string; name: string };

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
const INTRO_PETALS = Array.from({ length: 220 }, (_, i) => ({
  id: i,
  x: Math.pow(rand(i + 1), 1.4) * 105 - 5,
  y: rand(i + 101) * 30,
  dur: 1.8 + rand(i + 601) * 1.1,
  sw: (rand(i + 701) - 0.5) * 12,
  s: 26 + rand(i + 201) * 60,
  d: 0,
  r: rand(i + 401) * 360,
  dx: (rand(i + 501) - 0.3) * 10,
}));

function Intro() {
  const petals = INTRO_PETALS;
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 4200);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <div className="intro" aria-hidden>
      <div className="intro-veil" />
      {petals.map((p) => (
        <span
          key={p.id}
          className="intro-petal"
          style={{
            left: `${p.x}%`,
            top: `${100 + p.y}%`,
            width: p.s,
            height: p.s,
            animationDelay: `${(p.x / 100) * 0.7 + rand(p.id + 801) * 0.4}s`,
            animationDuration: `${p.dur}s`,
            ["--sw" as string]: `${p.sw}vw`,
            ["--r" as string]: `${p.r}deg`,
            ["--dx" as string]: `${p.dx}vw`,
          }}
        />
      ))}
    </div>
  );
}

function Index() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.setAttribute("webkitdirectory", "");
    inputRef.current?.setAttribute("directory", "");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected === null) return;
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight") setSelected((s) => (s! + 1) % photos.length);
      if (e.key === "ArrowLeft") setSelected((s) => (s! - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, photos.length]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    const list = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setPhotos(list);
    if (list.length) setOpen(true);
  };

  const onAlbumClick = () => {
    if (!photos.length) inputRef.current?.click();
    else setOpen(true);
  };

  return (
    <main className="festive-bg relative min-h-screen overflow-hidden">
      <Petals />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      <Intro />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center px-4 py-12">
        <p className="reveal text-sm uppercase tracking-[0.4em] text-muted-foreground" style={{ animationDelay: "2.4s" }}>
          Ngày Phụ nữ Việt Nam
        </p>
        <h1 className="font-script shimmer-text mt-2 text-center text-6xl md:text-8xl" aria-label="Chúc mừng 20/10">
          {"Chúc mừng 20/10".split("").map((c, i) => (
            <span key={i} className="letter" style={{ animationDelay: `${2.6 + i * 0.08}s` }}>
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </h1>
        <p className="reveal mx-auto mt-4 max-w-xl text-center text-foreground/80" style={{ animationDelay: "3.8s" }}>
          Gửi tới những người phụ nữ tuyệt vời nhất — luôn xinh đẹp, hạnh phúc và tràn đầy yêu thương.
        </p>

        {!open ? (
          <div className="album-enter mt-14 flex flex-col items-center gap-6">
            <button onClick={onAlbumClick} className="album group" aria-label="Mở album ảnh">
              <div className="album-cover">
                <div className="album-frame">
                  <span className="text-5xl">🌸</span>
                  <span className="font-script mt-2 text-4xl">Kỷ niệm</span>
                  <span className="mt-1 text-xs uppercase tracking-[0.3em] opacity-80">20 · 10</span>
                </div>
              </div>
            </button>
            <p className="animate-pulse text-sm text-muted-foreground">
              {photos.length ? "Nhấn vào album để mở" : "Nhấn vào album để chọn thư mục ảnh"}
            </p>
          </div>
        ) : (
          <div className="album-open mt-10 w-full">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => setOpen(false)} className="btn-soft">
                ← Gập album
              </button>
              <button onClick={() => inputRef.current?.click()} className="btn-primary">
                Chọn thư mục khác
              </button>
            </div>
            <div className="album-pages grid grid-cols-2 gap-5 p-6 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((p, i) => (
                <button
                  key={p.url}
                  onClick={() => setSelected(i)}
                  className="polaroid"
                  style={{ animationDelay: `${Math.min(i, 20) * 0.06}s`, ["--r" as string]: `${(i % 5) - 2}deg` }}
                >
                  <img src={p.url} alt={p.name} className="aspect-square w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {selected !== null && photos[selected] && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <img
            key={selected}
            src={photos[selected].url}
            alt={photos[selected].name}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Đóng">
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
