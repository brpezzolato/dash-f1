/** Fundo verde-água com as faixas angulares e blocos “skyline” da referência. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#00e0c6_0%,#00b9a6_45%,#008f86_100%)]" />
      <div className="absolute inset-x-0 top-[30%] h-[40%] bg-[repeating-linear-gradient(90deg,transparent_0_80px,rgb(0_0_0/0.04)_80px_200px,transparent_200px_260px)] [mask-image:linear-gradient(transparent,black_40%,black_70%,transparent)]" />
      {/* Chevrons laterais. */}
      <div className="hidden md:block">
      <div className="absolute bottom-0 -left-10 h-[55%] w-56 bg-white/90 [clip-path:polygon(0_0,100%_30%,100%_100%,72%_100%,72%_42%,0_18%)]" />
      <div className="absolute bottom-0 -left-10 h-[48%] w-44 bg-white/20 [clip-path:polygon(0_10%,100%_40%,100%_100%,0_100%)]" />
      <div className="absolute -right-10 bottom-0 h-[55%] w-56 bg-white/90 [clip-path:polygon(100%_0,0_30%,0_100%,28%_100%,28%_42%,100%_18%)]" />
      <div className="absolute -right-10 bottom-0 h-[48%] w-44 bg-white/20 [clip-path:polygon(100%_10%,0_40%,0_100%,100%_100%)]" />
      </div>
    </div>
  );
}
