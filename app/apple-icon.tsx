import { ImageResponse } from "next/og";
import { AppIconArtwork } from "@/components/AppIconArtwork";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<AppIconArtwork pixels={size.width} />, size);
}
