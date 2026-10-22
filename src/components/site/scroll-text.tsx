/**
 * Texto que “acende” palavra por palavra conforme a rolagem, com animação CSS
 * guiada pela rolagem (sem JavaScript por quadro). Cada palavra ocupa uma
 * fatia do trecho em que o parágrafo atravessa a tela.
 */
export function ScrollText({ text, highlight = [] }: { text: string; highlight?: string[] }) {
  const words = text.split(" ");
  // O parágrafo acende entre 10% e 55% da faixa “cover” (entrando até o meio da tela).
  const from = 10;
  const span = 45;

  return (
    <p className="scroll-text font-display max-w-5xl text-3xl leading-[1.15] font-semibold sm:text-5xl lg:text-6xl">
      {words.map((w, i) => {
        const start = from + (i / words.length) * span;
        const end = from + ((i + 1) / words.length) * span;
        const accent = highlight.some((h) => h && w.replace(/[.,]/g, "") === h);
        return (
          <span
            key={i}
            className={`scroll-word mr-[0.25em] inline-block ${accent ? "text-[#ff6b2c]" : ""}`}
            style={{ animationRange: `cover ${start.toFixed(1)}% cover ${end.toFixed(1)}%` }}
          >
            {w}
          </span>
        );
      })}
    </p>
  );
}
