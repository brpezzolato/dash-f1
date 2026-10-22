/**
 * Baixa o vídeo do hero no build e o serve pelo próprio site (public/media),
 * para não depender do YouTube nem de CDNs de terceiros no navegador.
 *
 * Vídeo: "2021 Russian Grand Prix - start for warm-up", por rubin16,
 * CC BY-SA 4.0, via Wikimedia Commons.
 *
 * Com o ffmpeg-static instalado, gera também um MP4 H.264 (Safari/iOS antigos)
 * e um pôster. Se o download falhar, o build continua e o hero usa só o fundo.
 */
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const OUT = join(process.cwd(), "public", "media");
const SOURCE =
  process.env.HERO_VIDEO_SOURCE ??
  "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1e/2021_Russian_Grand_Prix_-_start_for_warm-up.webm/2021_Russian_Grand_Prix_-_start_for_warm-up.webm.720p.vp9.webm";

const webm = join(OUT, "hero.webm");
const mp4 = join(OUT, "hero.mp4");
const poster = join(OUT, "hero.jpg");

async function main() {
  mkdirSync(OUT, { recursive: true });

  if (!existsSync(webm) || statSync(webm).size < 100_000) {
    const res = await fetch(SOURCE, { headers: { "User-Agent": "dash-f1 build (github.com/brpezzolato/dash-f1)" } });
    if (!res.ok) throw new Error(`download falhou: ${res.status}`);
    writeFileSync(webm, Buffer.from(await res.arrayBuffer()));
    console.log(`[media] vídeo baixado (${(statSync(webm).size / 1e6).toFixed(1)} MB)`);
  } else {
    console.log("[media] vídeo já presente");
  }

  let ffmpeg;
  try {
    ffmpeg = (await import("ffmpeg-static")).default;
  } catch {
    console.log("[media] ffmpeg-static ausente; usando só o WebM");
    return;
  }
  if (!existsSync(mp4)) {
    await run(ffmpeg, ["-y", "-loglevel", "error", "-i", webm, "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-vf", "scale=1280:-2", mp4]);
    console.log(`[media] MP4 gerado (${(statSync(mp4).size / 1e6).toFixed(1)} MB)`);
  }
  if (!existsSync(poster)) {
    await run(ffmpeg, ["-y", "-loglevel", "error", "-ss", "6", "-i", webm, "-frames:v", "1", "-q:v", "4", "-vf", "scale=1280:-2", poster]);
    console.log("[media] pôster gerado");
  }
}

main().catch((err) => console.warn(`[media] ignorado: ${err.message}`));
