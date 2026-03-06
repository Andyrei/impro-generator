import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IMPRO GENERATOR",
    short_name: "IMPRO",
    description: "Generatore di divertimento per il teatro d'improvvisazione",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#991b1b",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icons/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
