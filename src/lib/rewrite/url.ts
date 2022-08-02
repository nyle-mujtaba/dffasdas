import config from "../../config";

function combine (url: URL, path: string) {
  url.pathname = url.pathname.replace(/[^/]+?\.[^/]+?$/, "");
  if (/^\//.test(path)) {
    return url.origin + path;
  } else if (/^\.\//.test(path)) {
    return url.href.replace(/\/$/, "") + path.replace(/^\./, "");
  } else if (/^\.\.\//.test(path)) {
    return url.href.replace(/\/[^/]+?\/?$/, "") + path.replace(/^\.\./, "");
  } else {
    return url.href.replace(/\/?$/, "/") + path;
  }
}

export default function rewriteURL (url: string, origin?: string): string {
  let fakeLocation = {} as any;
  if ("window" in self) {
    fakeLocation = new URL(config.codec.decode(location.pathname.replace(new RegExp(`^${config.prefix}`), "")));
  }
  if (origin) {
    fakeLocation = new URL(origin);
  }

  if (/^(data|mailto):/.test(url)) {
    return url;
  } else if (/^https?:\/\//.test(url)) {
    return `${config.prefix}${config.codec.encode(url)}`;
  } else if (/^\/\//.test(url)) {
    return `${config.prefix}${config.codec.encode((fakeLocation.protocol ? fakeLocation.protocol : "https:") + url)}`;
  } else {
    if (!fakeLocation) return url;
    return `${config.prefix}${config.codec.encode(combine(fakeLocation, url))}`;
  }
}

export function unwriteURL (url: string): string {
  if(!url) return url;
  let newURL;
  if (/^https?:\/\//.test(url)) {
    newURL = new URL(config.codec.decode(new URL(url).pathname.replace(new RegExp(`^${config.prefix}`), "")));
  } else {
    newURL = new URL(config.codec.decode(url.replace(new RegExp(`^${config.prefix}`), "")));
  }
  return newURL.href;
}
