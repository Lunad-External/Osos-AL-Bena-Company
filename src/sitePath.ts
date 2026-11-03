declare const __BASE_PATH__: string;

export const basePath =
  typeof __BASE_PATH__ !== "undefined"
    ? __BASE_PATH__
    : typeof process !== "undefined"
      ? process.env.BASE_PATH || "/"
      : "/";

export function sitePath(path: string) {
  if (!path.startsWith("/")) return path;
  return `${basePath.replace(/\/$/, "")}${path}`;
}

export function siteSrcSet(srcSet: string) {
  return srcSet
    .split(",")
    .map((source) => {
      const [path, ...descriptor] = source.trim().split(/\s+/);
      return [sitePath(path), ...descriptor].join(" ");
    })
    .join(", ");
}
