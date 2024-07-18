export default function isVideo(url: string): boolean {
  const videoExtensions = ["mp4", "webm", "ogg"];
  const extension = url.split(".").pop()?.toLowerCase();
  return extension ? videoExtensions.includes(extension) : false;
}
