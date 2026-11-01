import { ImageResponse } from "next/og";
import { AppIconArtwork } from "@/components/AppIconArtwork";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<AppIconArtwork pixels={size.width} />, size);
}
