declare global {
  interface Window {
    dataLayer: any[];
  }
}

window.dataLayer = window.dataLayer || [];

export function gtag(command: "event", name: string, params?: any): void;
export function gtag(command: string, value: any): void;
export function gtag() {
  // eslint-disable-next-line
  window.dataLayer.push(arguments);
}

export function initialize(callback?: () => void) {
  gtag("js", new Date());
  gtag("config", "UA-168944052-1");

  const element = document.createElement("script");
  element.src = "https://www.googletagmanager.com/gtag/js?id=UA-168944052-1";
  element.async = true;
  element.addEventListener("load", () => {
    element.remove();
    if (callback) {
      callback();
    }
  });
  document.head.appendChild(element);
}
