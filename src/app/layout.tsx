import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

export const metadata = { title: "Goat's head tracker" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
