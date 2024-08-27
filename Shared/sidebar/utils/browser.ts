const manifest_version = process.env.MANIFEST_VERSION;
export const INTIAL_SIDEBAR_OFFICE_URL = `sidebar_v${(manifest_version ?? [])[0]}.html`;
export const INTIAL_SIDEBAR_CHROME_URL = "/index.html";

export function getZoomLevel() {
  const ratio = window.devicePixelRatio || 1;
  const zoomLevel = ratio * 100;
  return zoomLevel;
}

export const handleClearCache = () => {
  localStorage.clear();
  const url = process.env.PLATFORM_TYPE === "outlook_addin" ? INTIAL_SIDEBAR_OFFICE_URL : INTIAL_SIDEBAR_CHROME_URL;
  window.location.href = url;
};

export const handleReload = () => {
  const url = process.env.PLATFORM_TYPE === "outlook_addin" ? INTIAL_SIDEBAR_OFFICE_URL : INTIAL_SIDEBAR_CHROME_URL;
  window.location.href = url;
};
