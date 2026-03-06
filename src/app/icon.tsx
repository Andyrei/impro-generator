import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Icon() {
  const file = await readFile(join(process.cwd(), "public/icons/icon.png"));
  const base64 = `data:image/png;base64,${file.toString("base64")}`;
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={base64} width={32} height={32} style={{ objectFit: "cover" }} alt="" />,
    { ...size }
  );
}
