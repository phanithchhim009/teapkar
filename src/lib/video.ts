/** Parses youtube.com/watch?v=, youtu.be/, /shorts/, /embed/ and /live/ links. Returns null for anything else. */
export function parseYouTube(url: string): { id: string; vertical: boolean } | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, rest] = u.pathname.split("/");
    id = kind === "watch" ? u.searchParams.get("v") : ["shorts", "embed", "live"].includes(kind) ? rest : null;
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  return { id, vertical: u.pathname.startsWith("/shorts/") };
}

export const youTubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youTubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
