"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header";
import { Lang, normalizeLang } from "@/i18n/lang";

type UnboxingVideo = {
  id: string;
  title: Partial<Record<Lang, string>>;
  caption?: Partial<Record<Lang, string>>;
  src: string;
  poster?: string;
  ctaHref?: string;
};

const COPY: Record<Lang, { sticky: string; cta: string; audioOn: string; audioOff: string }> = {
  it: { sticky: "🎁 Acquista la tua Mystery Box", cta: "Scopri le box", audioOn: "Audio ON", audioOff: "Audio OFF" },
  en: { sticky: "🎁 Get your Mystery Box", cta: "Shop boxes", audioOn: "Sound ON", audioOff: "Sound OFF" },
  es: { sticky: "🎁 Compra tu Mystery Box", cta: "Ver cajas", audioOn: "Audio ON", audioOff: "Audio OFF" },
  fr: { sticky: "🎁 Acheter ta Mystery Box", cta: "Voir les box", audioOn: "Son ON", audioOff: "Son OFF" },
  de: { sticky: "🎁 Mystery Box kaufen", cta: "Boxen ansehen", audioOn: "Ton ON", audioOff: "Ton OFF" },
};

const VIDEOS: UnboxingVideo[] = [
  {
    id: "u-001",
    title: { it: "Unboxing 2kg – pacchi smarriti" },
    caption: { it: "Nessun filtro. Solo sorpresa." },
    src: "/videos/unboxing/u-001.mp4",
    poster: "/videos/unboxing/posters/u-001.jpg",
    ctaHref: "/products#buy-standard-10",
  },
  {
    id: "u-002",
    title: { it: "Unboxing 3kg – cosa c’era dentro?" },
    caption: { it: "Potrebbe esserci QUALSIASI COSA…" },
    src: "/videos/unboxing/u-002.mp4",
    poster: "/videos/unboxing/posters/u-002.jpg",
    ctaHref: "/products#buy-premium-10",
  },
];

function useActiveIndex(count: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-snap-item='true']"));

    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({ idx: Number((e.target as HTMLElement).dataset.index), ratio: e.intersectionRatio }))
          .sort((a, b) => b.ratio - a.ratio)[0];

        if (best && !Number.isNaN(best.idx)) setActive(best.idx);
      },
      { root: el, threshold: [0.25, 0.5, 0.75, 0.9] }
    );

    items.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [count]);

  return { containerRef, active };
}

/** Snap “inchiodato”: quando smetti di scrollare, va alla slide più vicina */
function useHardSnap(containerRef: React.RefObject<HTMLDivElement | null>, count: number) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let t: ReturnType<typeof setTimeout> | null = null;

    const snapNow = () => {
      const h = el.clientHeight || window.innerHeight;
      const idx = Math.round(el.scrollTop / h);
      const clamped = Math.max(0, Math.min(count - 1, idx));
      const target = clamped * h;

      if (Math.abs(el.scrollTop - target) < 2) return;
      el.scrollTo({ top: target, behavior: "auto" }); // secco
    };

    const onScroll = () => {
      if (t) clearTimeout(t);
      t = setTimeout(snapNow, 80);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (t) clearTimeout(t);
      el.removeEventListener("scroll", onScroll);
    };
  }, [containerRef, count]);
}

function Slide({
  video,
  isActive,
  lang,
  ctaLabel,
  globalSoundOn,
  setGlobalSoundOn,
  markUserInteracted,
  userInteracted,
}: {
  video: UnboxingVideo;
  isActive: boolean;
  lang: Lang;
  ctaLabel: string;
  globalSoundOn: boolean;
  setGlobalSoundOn: (v: boolean) => void;
  userInteracted: boolean;
  markUserInteracted: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [pausedByUser, setPausedByUser] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    if (isActive) {
      // autoplay: sempre ok muted
      v.muted = true;

      const p = v.play();
      if (p) p.catch(() => {});

      // se l’utente ha già interagito e ha audio ON, unmute subito
      if (userInteracted && globalSoundOn) {
        v.muted = false;
      }

      setPausedByUser(false);
    } else {
      v.pause();
      v.currentTime = 0;
      setPausedByUser(false);
    }
  }, [isActive, userInteracted, globalSoundOn]);

  // quando cambia toggle audio mentre la slide è attiva
  useEffect(() => {
    const v = ref.current;
    if (!v || !isActive) return;

    if (!userInteracted) {
      v.muted = true;
      return;
    }
    v.muted = !globalSoundOn;
  }, [globalSoundOn, userInteracted, isActive]);

  const title = video.title[lang] ?? video.title.it ?? "";
  const caption = video.caption?.[lang] ?? video.caption?.it ?? "";
  const href = `/${lang}${video.ctaHref || "/products"}`;

  const togglePlayPause = () => {
    const v = ref.current;
    if (!v) return;

    markUserInteracted();

    if (v.paused) {
      const p = v.play();
      if (p) p.catch(() => {});
      setPausedByUser(false);
    } else {
      v.pause();
      setPausedByUser(true);
    }
  };

  const toggleSound = () => {
    markUserInteracted();
    const next = !globalSoundOn;
    setGlobalSoundOn(next);

    const v = ref.current;
    if (!v) return;
    v.muted = !next;
  };

  return (
    <section data-snap-item="true" data-index="" className="km-snap-item relative bg-black">
      <div className="km-video-916 relative" onClick={togglePlayPause}>
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          loop
          preload="metadata"
          poster={video.poster}
          src={video.src}
          muted
        />

        <div className="pointer-events-none absolute inset-0 km-video-overlay" />

        {pausedByUser && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="km-fab">
              <span style={{ fontSize: 18, lineHeight: 1 }}>▶</span>
            </div>
          </div>
        )}

        <div className="absolute right-3 bottom-28 z-10 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="km-fab" onClick={toggleSound} aria-label="Toggle sound">
            <span style={{ fontSize: 18, lineHeight: 1 }}>{globalSoundOn ? "🔊" : "🔇"}</span>
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
          <div className="max-w-xl space-y-2">
            <span className="pill">Unboxing reale</span>

            <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
            {caption ? <p className="text-white/70 text-sm md:text-base">{caption}</p> : null}

            <div className="pt-2 flex items-center gap-2">
              <a href={href} className="btn btn-brand px-5 py-2 inline-flex" onClick={(e) => e.stopPropagation()}>
                {ctaLabel}
              </a>

              <span className="text-xs text-white/60">
                {userInteracted
                  ? globalSoundOn
                    ? COPY[lang]?.audioOn ?? "Audio ON"
                    : COPY[lang]?.audioOff ?? "Audio OFF"
                  : "Tap per audio"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function UnboxingExperiencePage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = COPY[lang] ?? COPY.it;

  const videos = useMemo(() => VIDEOS, []);
  const { containerRef, active } = useActiveIndex(videos.length);

  // ✅ HARD SNAP
  useHardSnap(containerRef, videos.length);

  const [userInteracted, setUserInteracted] = useState(false);
  const markUserInteracted = () => setUserInteracted(true);

  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-snap-item='true']"));
    items.forEach((item, idx) => (item.dataset.index = String(idx)));
  }, [videos.length]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        <Header lang={lang} />
      </div>

      <main className="h-[100svh] w-full">
        <div ref={containerRef} className="km-snap-feed">
          {videos.map((v, idx) => (
            <Slide
              key={v.id}
              video={v}
              isActive={idx === active}
              lang={lang}
              ctaLabel={t.cta}
              globalSoundOn={soundOn}
              setGlobalSoundOn={setSoundOn}
              userInteracted={userInteracted}
              markUserInteracted={markUserInteracted}
            />
          ))}
        </div>

        <div className="fixed inset-x-0 bottom-3 z-50 px-3">
          <div className="mx-auto max-w-2xl">
            <a href={`/${lang}/products`} className="btn btn-brand w-full py-3 rounded-2xl shadow-lg">
              {t.sticky}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
