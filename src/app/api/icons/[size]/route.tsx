import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = sizeStr === "512" ? 512 : 192;

  const file = await readFile(join(process.cwd(), "public/icons/icon.png"));
  const base64 = `data:image/png;base64,${file.toString("base64")}`;

  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={base64} width={size} height={size} style={{ objectFit: "cover" }} alt="" />,
    { width: size, height: size }
  );
}
