import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const blockedHostSuffixes = [".localhost", ".local", ".internal", ".home", ".lan"];

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("::ffff:")) return isPrivateIpv4(normalized.slice(7));
  return (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8")
  );
}

export function isPrivateAddress(address: string) {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
}

export function normalizeWebsiteUrl(value: string) {
  const candidate = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Use a public http:// or https:// website.");
  if (url.username || url.password) throw new Error("Website URLs cannot contain credentials.");
  if (url.href.length > 2048) throw new Error("That website URL is too long.");
  url.hash = "";
  return url;
}

export async function assertPublicHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (
    host === "localhost" ||
    host === "metadata.google.internal" ||
    blockedHostSuffixes.some((suffix) => host.endsWith(suffix))
  ) {
    throw new Error("Only public websites can be captured.");
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new Error("Private network addresses cannot be captured.");
    return;
  }
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("That hostname does not resolve to a public website.");
  }
}
