import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Book,
  X,
  Images
} from "lucide-react";

export interface PhotoItem {
  id: string;
  url: string;
  name: string;
  caption?: string;
  date?: string;
  grade: "grade10" | "grade11" | "grade12";
}

export const TIMELINES = [
  {
    id: "grade10",
    title: "2024 - 2025: Lớp 10",
    shortTitle: "Lớp 10",
    desc: "Những ngày đầu bỡ ngỡ vào trường, tà áo trắng tinh khôi",
    color: "#f43f5e" // Hồng san hô thơ mộng
  },
  {
    id: "grade11",
    title: "2025 - 2026: Lớp 11",
    shortTitle: "Lớp 11",
    desc: "Kỷ niệm gắn kết rực rỡ, những nụ cười thân thương",
    color: "#e11d48" // Đỏ hồng ấm áp
  },
  {
    id: "grade12",
    title: "2026 - 2027: Lớp 12",
    shortTitle: "Lớp 12",
    desc: "Mùa hoa kỷ yếu, trưởng thành và rạng rỡ tỏa sáng",
    color: "#be123c" // Đỏ ruby thắm thiết
  }
];

export const DEFAULT_PHOTOS: PhotoItem[] = [];

// Natural wave offsets and tilts for the polaroid cards
const CARD_POSITIONS = [
  { yOffset: -22, rotate: -5.5 }, // Photo 0
  { yOffset: 24, rotate: 4.5 },   // Photo 1
  { yOffset: -18, rotate: -4 },   // Photo 2
  { yOffset: 20, rotate: 5.5 },   // Photo 3
  { yOffset: -24, rotate: -3.5 }, // Photo 4
  { yOffset: 22, rotate: 4 },     // Photo 5
  { yOffset: -20, rotate: -5 },   // Photo 6
  { yOffset: 25, rotate: 4.5 },   // Photo 7
  { yOffset: -16, rotate: -3 }    // Photo 8
];

const CHARM_LIST = ["🌸", "🔔", "💖", "🌸", "🔔", "💖", "🌸", "🔔"];

interface WireConnectorProps {
  fromPos: { yOffset: number; rotate: number };
  toPos: { yOffset: number; rotate: number };
  color: string;
  charm?: string;
  isMilestone?: boolean;
  milestoneTitle?: string;
  milestoneColor?: string;
}

function WireConnector({
  fromPos,
  toPos,
  color,
  charm,
  isMilestone,
  milestoneTitle,
  milestoneColor
}: WireConnectorProps) {
  const width = isMilestone ? 130 : 90;
  const height = 110;
  const centerY = 55;

  // Calculate start and end Y anchor points matching the card heights
  const y1 = centerY + fromPos.yOffset * 0.45;
  const y2 = centerY + toPos.yOffset * 0.45;

  // Natural catenary curve (sagging thread)
  const sag = isMilestone ? 28 : 22;
  const cp1X = width * 0.35;
  const cp1Y = Math.max(y1, y2) + sag;
  const cp2X = width * 0.65;
  const cp2Y = Math.max(y1, y2) + sag;

  const midX = width / 2;
  const midY = (y1 + y2) / 2 + sag * 0.85;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center select-none"
      style={{ width }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible pointer-events-none"
      >
        {/* Soft shadow for depth */}
        <path
          d={`M 0,${y1} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${width},${y2}`}
          fill="none"
          stroke="rgba(0, 0, 0, 0.08)"
          strokeWidth="2.5"
          transform="translate(1, 2.5)"
        />

        {/* Organic curved thread */}
        <path
          d={`M 0,${y1} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${width},${y2}`}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Drooping thread holding charm */}
        {charm && (
          <>
            <path
              d={`M ${midX},${midY} Q ${midX + 1.5},${midY + 10} ${midX},${midY + 22}`}
              fill="none"
              stroke={color}
              strokeWidth="1.4"
              strokeDasharray="2.5 1.5"
            />
            <circle cx={midX} cy={midY} r="2.2" fill={color} />
          </>
        )}
      </svg>

      {/* Swaying hanging charm (flower, bell, heart) */}
      {charm && (
        <div
          className="absolute charm-sway pointer-events-auto cursor-pointer"
          style={{
            left: midX - 9,
            top: midY + 20,
            fontSize: "17px",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
          }}
          title="Kỷ niệm thanh xuân"
        >
          {charm}
        </div>
      )}

      {/* Milestone badge when transitioning to next year */}
      {isMilestone && milestoneTitle && (
        <div
          className="absolute z-10 flex flex-col items-center pointer-events-none"
          style={{
            top: midY - 32,
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          <div
            className="px-3.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-md whitespace-nowrap"
            style={{ backgroundColor: milestoneColor || color }}
          >
            {milestoneTitle}
          </div>
          <div
            className="w-[1.5px] h-3.5"
            style={{ backgroundColor: milestoneColor || color }}
          />
        </div>
      )}
    </div>
  );
}

interface Album3DProps {
  photos: PhotoItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Album3D({
  photos,
  isOpen,
  setIsOpen
}: Album3DProps) {
  const [isOpeningAnimation, setIsOpeningAnimation] = useState(false);
  const [isClosingAnimation, setIsClosingAnimation] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [galleryGrade, setGalleryGrade] = useState<"all" | PhotoItem["grade"]>("all");
  const [activeGrade, setActiveGrade] = useState<string>("grade10");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const grade10Ref = useRef<HTMLDivElement>(null);
  const grade11Ref = useRef<HTMLDivElement>(null);
  const grade12Ref = useRef<HTMLDivElement>(null);

  // Subtle 3D tilt for closed cover
  const bookRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookRef.current || isOpen || isOpeningAnimation) return;
    const rect = bookRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const triggerOpenBook = () => {
    if (isOpeningAnimation || isOpen) return;
    setHasInteracted(true);
    setIsOpeningAnimation(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpeningAnimation(false);
    }, 1380);
  };

  const triggerCloseBook = () => {
    if (isClosingAnimation || !isOpen) return;
    setIsClosingAnimation(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosingAnimation(false);
    }, 1380);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  const scrollToGrade = (gradeId: string) => {
    setActiveGrade(gradeId);
    let targetEl: HTMLDivElement | null = null;
    if (gradeId === "grade10") targetEl = grade10Ref.current;
    if (gradeId === "grade11") targetEl = grade11Ref.current;
    if (gradeId === "grade12") targetEl = grade12Ref.current;

    if (targetEl && scrollContainerRef.current) {
      const containerLeft = scrollContainerRef.current.getBoundingClientRect().left;
      const targetLeft = targetEl.getBoundingClientRect().left;
      const offset = targetLeft - containerLeft + scrollContainerRef.current.scrollLeft - 60;
      scrollContainerRef.current.scrollTo({ left: offset, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;

    const g11Pos = grade11Ref.current ? grade11Ref.current.offsetLeft - 150 : 800;
    const g12Pos = grade12Ref.current ? grade12Ref.current.offsetLeft - 150 : 1600;

    if (scrollLeft < g11Pos) {
      setActiveGrade("grade10");
    } else if (scrollLeft < g12Pos) {
      setActiveGrade("grade11");
    } else {
      setActiveGrade("grade12");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex !== null) {
        if (e.key === "Escape") setSelectedPhotoIndex(null);
        if (e.key === "ArrowRight") setSelectedPhotoIndex((prev) => (prev! + 1) % photos.length);
        if (e.key === "ArrowLeft") setSelectedPhotoIndex((prev) => (prev! - 1 + photos.length) % photos.length);
        return;
      }
      if (showAllPhotos && e.key === "Escape") {
        setShowAllPhotos(false);
        return;
      }
      if (isOpen) {
        if (e.key === "ArrowRight") scrollRight();
        if (e.key === "ArrowLeft") scrollLeft();
        if (e.key === "Escape") triggerCloseBook();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedPhotoIndex, photos.length, showAllPhotos, setIsOpen, isClosingAnimation]);

  const galleryPhotos = galleryGrade === "all" ? photos : photos.filter((photo) => photo.grade === galleryGrade);

  return (
    <div className="w-full min-w-0 flex flex-col items-center">
      {!isOpen ? (
        /* ================= 3D CLOSED BOOK / OPEN FLUTTERING TRANSITION ================= */
          <div className={`album-enter ${hasInteracted ? "album-returning" : ""} relative flex flex-col items-center select-none py-8 min-h-[460px] justify-center`}>
          <div className="absolute -bottom-4 w-72 h-10 bg-rose-400/20 rounded-full blur-xl pointer-events-none" />

          {isOpeningAnimation ? (
            /* ================= OPEN FLUTTERING BOOK SPREAD (2 MẶT MỞ RA, NGỬA RA SAU 3D) ================= */
            <div className="open-fluttering-book-container">
              {/* Các trang sách bị xé bay ra không trung và mờ dần */}
              <div className="torn-pages-container">
                <div className="torn-flying-page tp1">
                  <div className="torn-lines" />
                </div>
                <div className="torn-flying-page tp2">
                  <div className="torn-lines" />
                </div>
                <div className="torn-flying-page tp3">
                  <div className="torn-lines" />
                </div>
                <div className="torn-flying-page tp4">
                  <div className="torn-lines" />
                </div>
                <div className="torn-flying-page tp5">
                  <div className="torn-lines" />
                </div>
              </div>

              <div className="open-fluttering-book">
                {/* Trang mở bên trái */}
                <div className="open-spread-page left-page">
                  <div className="page-lines" />
                  <div className="page-poetry" />
                </div>

                {/* Gáy sách & ruy băng ở giữa */}
                <div className="open-spread-spine">
                  <div className="spine-ribbon-tab" />
                </div>

                {/* Trang mở bên phải */}
                <div className="open-spread-page right-page">
                  <div className="page-lines" />
                  <div className="page-poetry" />
                </div>

                {/* Vô vàn trang sách lật bay phấp phới ở giữa với motion blur */}
                <div className="center-flutter-fan">
                  <div className="fan-page fp1" />
                  <div className="fan-page fp2" />
                  <div className="fan-page fp3" />
                  <div className="fan-page fp4" />
                  <div className="fan-page fp5" />
                  <div className="fan-page fp6" />
                </div>
              </div>
            </div>
          ) : (
            /* ================= BÌA SÁCH GẬP (TRẠNG THÁI CHỜ MỞ) ================= */
            <>
              <div
                ref={bookRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={triggerOpenBook}
                className="poetic-album-wrapper group cursor-pointer"
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                }}
              >
                <div className="poetic-album-book">
                  <div className="poetic-cover">
                    <div className="poetic-cover-sheen" />

                    <div className="poetic-inner-frame">
                      <div className="corner-ornament tl" />
                      <div className="corner-ornament tr" />
                      <div className="corner-ornament bl" />
                      <div className="corner-ornament br" />

                      <div className="poetic-medallion">
                        <h2 className="font-script poetic-book-title">Kỷ Niệm</h2>
                        <div className="flex items-center gap-2 my-2">
                          <span className="h-[1px] w-6 bg-amber-300/60" />
                          <span className="text-xs uppercase tracking-[0.35em] text-amber-100 font-medium">
                            20 · 10
                          </span>
                          <span className="h-[1px] w-6 bg-amber-300/60" />
                        </div>
                        <p className="text-[11px] text-amber-100/80 tracking-wide font-light mt-1">
                          Kỉ niệm 3 năm cấp 3 của các bạn nữ 12A4
                        </p>
                      </div>
                    </div>

                    <div className="poetic-ribbon">
                      <div className="poetic-ribbon-tail" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-2">
                <button
                  onClick={triggerOpenBook}
                  className="px-7 py-3 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white font-medium flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-200" />
                  <span className="tracking-wide text-sm">Mở Album Kỷ Niệm</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ================= MEMORY WIRE TIMELINE VIEW ================= */
        <div className={`w-full min-w-0 max-w-7xl mt-2 px-2 sm:px-6 animate-in fade-in zoom-in-95 duration-700 ${isClosingAnimation ? "album-closing-content" : ""}`}>
          {/* Top Control Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white/75 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-rose-100">
            <div className="flex items-center gap-2.5">
              <button
                onClick={triggerCloseBook}
                className="btn-soft flex items-center gap-1.5 text-xs font-medium px-4 py-2 hover:bg-rose-50"
                disabled={isClosingAnimation}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Gập Sách</span>
              </button>

              <button
                onClick={() => setShowAllPhotos(true)}
                className="btn-primary flex items-center gap-1.5 text-xs font-medium px-4 py-2 shadow-sm"
              >
                <Images className="w-3.5 h-3.5" />
                <span>Xem tất cả ảnh</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-rose-900/80 font-medium">
              <span>🌸</span>
              <span className="font-script text-base text-rose-950">
                Sợi dây ký ức 3 năm cấp 3
              </span>
            </div>
          </div>

          {/* 3 HANGING TIMELINE STRINGS & TAGS (3 sợi dây nhánh nối lên hiển thị 3 timeline) */}
          <div className="relative w-full max-w-3xl mx-auto mb-6 pt-4 pb-2">
            <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-rose-300 via-rose-400 to-rose-500 opacity-60" />

            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {TIMELINES.map((tl) => {
                const isActive = activeGrade === tl.id;
                return (
                  <div
                    key={tl.id}
                    onClick={() => scrollToGrade(tl.id)}
                    className="group cursor-pointer flex flex-col items-center text-center transition-all duration-300"
                  >
                    {/* Hanging thread */}
                    <div
                      className={`w-[1.5px] transition-all duration-300 ${
                        isActive ? "h-6 sm:h-8 bg-rose-500 scale-y-110" : "h-5 sm:h-7 bg-rose-300/70"
                      }`}
                    />

                    {/* Cute bow/knot */}
                    <div
                      className={`w-2 h-2 rounded-full mb-1 transition-transform ${
                        isActive ? "bg-rose-500 scale-125 shadow-sm" : "bg-rose-300"
                      }`}
                    />

                    {/* Timeline Tag Card */}
                    <div
                      className={`w-full py-2 px-2 sm:px-3 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-b from-white to-rose-50 border-rose-300 shadow-md scale-105"
                          : "bg-white/80 border-rose-100 hover:bg-white hover:border-rose-200 shadow-sm"
                      }`}
                    >
                      <h4
                        className={`text-xs sm:text-sm font-semibold tracking-wide ${
                          isActive ? "text-rose-900" : "text-foreground/80"
                        }`}
                      >
                        {tl.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 line-clamp-1 italic font-light">
                        {tl.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN MEMORY WIRE SCROLL AREA */}
          <div className="relative w-full py-6">
            <button
              onClick={scrollLeft}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-rose-900 shadow-lg border border-rose-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Xem ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={scrollRight}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-rose-900 shadow-lg border border-rose-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Xem ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="w-full min-w-0 overflow-x-auto overflow-y-hidden py-16 px-10 sm:px-16 scrollbar-none select-none flex items-center"
              style={{ scrollBehavior: "smooth" }}
            >
              {/* Start decoration bow */}
              <div className="flex items-center flex-shrink-0 mr-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-sm shadow-sm">
                  🎀
                </div>
                <div className="w-8 h-[2px] bg-rose-400 opacity-80" />
              </div>

              {/* RENDER ALL PHOTOS CHAINED VIA ORGANIC CURVED SVG CONNECTORS */}
              {photos.map((photo, index) => {
                const pos = CARD_POSITIONS[index % CARD_POSITIONS.length];
                const nextPos = CARD_POSITIONS[(index + 1) % CARD_POSITIONS.length];

                // Detect milestone transition to next year
                const isNextDifferentGrade =
                  index < photos.length - 1 && photo.grade !== photos[index + 1].grade;
                const nextTimeline = isNextDifferentGrade
                  ? TIMELINES.find((t) => t.id === photos[index + 1].grade)
                  : undefined;

                const currentTimeline = TIMELINES.find((t) => t.id === photo.grade) || TIMELINES[0];

                // Milestone ref markers for fast scrolling
                const isFirstOfGrade10 = index === 0;
                const isFirstOfGrade11 =
                  photo.grade === "grade11" && (index === 0 || photos[index - 1].grade !== "grade11");
                const isFirstOfGrade12 =
                  photo.grade === "grade12" && (index === 0 || photos[index - 1].grade !== "grade12");

                const charm = CHARM_LIST[index % CHARM_LIST.length];

                return (
                  <React.Fragment key={photo.id}>
                    {/* Anchor ref marker for smooth scrolling */}
                    <div
                      ref={
                        isFirstOfGrade10
                          ? grade10Ref
                          : isFirstOfGrade11
                          ? grade11Ref
                          : isFirstOfGrade12
                          ? grade12Ref
                          : undefined
                      }
                      className="relative flex flex-col items-center flex-shrink-0"
                      style={{
                        transform: `translateY(${pos.yOffset}px) rotate(${pos.rotate}deg)`,
                        transition: "transform 0.3s ease"
                      }}
                      onClick={() => setSelectedPhotoIndex(index)}
                    >
                      {/* Left tie knot on polaroid margin */}
                      <div
                        className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white shadow-sm z-20"
                        style={{ backgroundColor: currentTimeline.color }}
                      />

                      {/* Right tie knot on polaroid margin */}
                      <div
                        className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white shadow-sm z-20"
                        style={{ backgroundColor: currentTimeline.color }}
                      />

                      {/* Wooden Clip at Top */}
                      <div className="absolute -top-3 z-20 flex flex-col items-center pointer-events-none">
                        <div className="w-3.5 h-6 bg-amber-800/80 rounded-sm shadow-sm border border-amber-950/40" />
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full -mt-1" />
                      </div>

                      {/* Polaroid Card */}
                      <div className="wire-polaroid bg-white p-3 pb-4 rounded shadow-md border border-stone-200/80 w-52 sm:w-60 transition-all hover:scale-105 hover:shadow-xl hover:z-20 group cursor-pointer">
                        <div className="relative aspect-square overflow-hidden rounded bg-stone-100">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/90 text-rose-900 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
                              <Maximize2 className="w-3 h-3" /> Xem ảnh
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-center px-1">
                          <h5 className="font-script text-xl text-rose-950 font-bold truncate">
                            {photo.name}
                          </h5>
                          {photo.caption && (
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 italic font-serif">
                              "{photo.caption}"
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <span className="h-[1px] w-3 bg-rose-200" />
                            <span className="text-[10px] font-mono uppercase text-rose-800/70 tracking-wider">
                              {photo.date || currentTimeline.shortTitle}
                            </span>
                            <span className="h-[1px] w-3 bg-rose-200" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONNECTING CURVED THREAD TO NEXT PHOTO (Never overlaps the photo!) */}
                    {index < photos.length - 1 && (
                      <WireConnector
                        fromPos={pos}
                        toPos={nextPos}
                        color={currentTimeline.color}
                        charm={charm}
                        isMilestone={isNextDifferentGrade}
                        milestoneTitle={nextTimeline?.title}
                        milestoneColor={nextTimeline?.color}
                      />
                    )}
                  </React.Fragment>
                );
              })}

              {/* Empty state — shown when no photos are in local folders */}
              {photos.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full py-16 opacity-60 select-none">
                  <div className="w-16 h-16 rounded-full border-2 border-rose-300 flex items-center justify-center mb-4 shadow-inner"
                    style={{ background: "radial-gradient(ellipse, rgba(255,200,200,0.2) 0%, transparent 70%)" }}>
                    <span className="text-3xl">📷</span>
                  </div>
                  <p className="text-sm text-rose-400 font-light italic text-center max-w-xs">
                    Thêm ảnh vào thư mục <strong>photos/2024-2025</strong>, <strong>2025-2026</strong> hoặc <strong>2026-2027</strong> để xuất hiện tại đây.
                  </p>
                </div>
              )}

              {/* End decoration tie */}
              <div className="flex items-center flex-shrink-0 ml-2">
                <div className="w-8 h-[2px] bg-rose-400 opacity-80" />
                <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-sm shadow-sm">
                  🌸
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div
          className="lightbox"
          onClick={() => setSelectedPhotoIndex(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-amber-100 max-w-full">
              <img
                src={photos[selectedPhotoIndex].url}
                alt={photos[selectedPhotoIndex].name}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />

              <div className="mt-3 text-center px-4 py-2">
                <h3 className="font-script text-3xl text-rose-950 font-bold">
                  {photos[selectedPhotoIndex].name}
                </h3>
                {photos[selectedPhotoIndex].caption && (
                  <p className="text-sm text-foreground/80 mt-1 max-w-xl mx-auto italic font-serif">
                    "{photos[selectedPhotoIndex].caption}"
                  </p>
                )}
                {photos[selectedPhotoIndex].date && (
                  <span className="inline-block mt-2 text-xs uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200">
                    {photos[selectedPhotoIndex].date}
                  </span>
                )}
              </div>

              <button
                onClick={() =>
                  setSelectedPhotoIndex(
                    (prev) => (prev! - 1 + photos.length) % photos.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-rose-950 shadow-md flex items-center justify-center transition-transform hover:scale-110"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setSelectedPhotoIndex(
                    (prev) => (prev! + 1) % photos.length
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-rose-950 shadow-md flex items-center justify-center transition-transform hover:scale-110"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-rose-950 flex items-center justify-center transition-colors shadow"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {isClosingAnimation && (
        <div className="close-fluttering-book-container" aria-hidden="true">
          <div className="torn-pages-container closing-torn-pages">
            <div className="torn-flying-page tp1"><div className="torn-lines" /></div>
            <div className="torn-flying-page tp2"><div className="torn-lines" /></div>
            <div className="torn-flying-page tp3"><div className="torn-lines" /></div>
            <div className="torn-flying-page tp4"><div className="torn-lines" /></div>
            <div className="torn-flying-page tp5"><div className="torn-lines" /></div>
          </div>
          <div className="open-fluttering-book closing-fluttering-book">
            <div className="open-spread-page left-page"><div className="page-lines" /></div>
            <div className="open-spread-spine"><div className="spine-ribbon-tab" /></div>
            <div className="open-spread-page right-page"><div className="page-lines" /></div>
            <div className="center-flutter-fan">
              <div className="fan-page fp1" />
              <div className="fan-page fp2" />
              <div className="fan-page fp3" />
              <div className="fan-page fp4" />
              <div className="fan-page fp5" />
              <div className="fan-page fp6" />
            </div>
          </div>
        </div>
      )}

      {showAllPhotos && (
        <div className="all-photos-overlay" role="dialog" aria-modal="true" aria-label="Tất cả ảnh kỷ niệm">
          <div className="all-photos-shell">
            <div className="all-photos-header">
              <div>
                <p className="all-photos-kicker">Bộ sưu tập thanh xuân</p>
                <h2 className="font-script all-photos-title">Tất cả ảnh kỷ niệm</h2>
                <p className="all-photos-subtitle">{galleryPhotos.length} khoảnh khắc từ 3 năm cấp 3</p>
              </div>
              <button
                onClick={() => setShowAllPhotos(false)}
                className="all-photos-close"
                aria-label="Đóng bộ sưu tập ảnh"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="all-photos-filters" aria-label="Lọc ảnh theo năm học">
              {[
                { id: "all" as const, label: "Tất cả" },
                { id: "grade10" as const, label: "Lớp 10" },
                { id: "grade11" as const, label: "Lớp 11" },
                { id: "grade12" as const, label: "Lớp 12" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setGalleryGrade(filter.id)}
                  className={`all-photos-filter ${galleryGrade === filter.id ? "is-active" : ""}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="all-photos-grid">
              {galleryPhotos.map((photo) => {
                const photoIndex = photos.findIndex((item) => item.id === photo.id);
                const timeline = TIMELINES.find((item) => item.id === photo.grade) ?? TIMELINES[0];
                return (
                  <button
                    key={photo.id}
                    className="all-photo-card"
                    onClick={() => {
                      setShowAllPhotos(false);
                      setSelectedPhotoIndex(photoIndex);
                    }}
                  >
                    <span className="all-photo-image-wrap">
                      <img src={photo.url} alt={photo.name} className="all-photo-image" loading="lazy" />
                      <span className="all-photo-view">Xem ảnh</span>
                    </span>
                    <span className="all-photo-copy">
                      <strong>{photo.name}</strong>
                      <small style={{ color: timeline?.color }}>{photo.date ?? timeline?.shortTitle}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
