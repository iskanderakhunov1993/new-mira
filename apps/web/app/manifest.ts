import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mira — цикл и самочувствие",
    short_name: "Mira",
    description: "Бережный трекер менструального цикла и самочувствия.",
    start_url: "/today",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#E872A0",
    orientation: "portrait",
    icons: [
      { src: "/icons/mira-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/mira-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
