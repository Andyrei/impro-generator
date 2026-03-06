import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = sizeStr === "512" ? 512 : 192;
  const fontSize = size === 512 ? 200 : 80;
  const borderRadius = size === 512 ? 80 : 32;
  const maskSize = size === 512 ? 160 : 62;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#000000",
          borderRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "monospace",
        }}
      >
        {/* Theater mask ring */}
        <div
          style={{
            width: maskSize,
            height: maskSize,
            borderRadius: "50%",
            border: `${size === 512 ? 12 : 5}px solid #15803d`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize,
              lineHeight: 1,
              color: "#15803d",
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            IG
          </span>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
