const path = require("path");

const LRU = require("lru-cache");
const sanitizeFilename = require("sanitize-filename");

function buildURL(locale, slug) {
  if (!locale) throw new Error("locale falsy!");
  if (!slug) throw new Error("slug falsy!");
  return `/${locale}/docs/${slug}`.toLowerCase();
}

function slugToFoldername(slug) {
  return (
    slug
      // We have slugs with these special characters that would be
      // removed by the sanitizeFilename() function. What might then
      // happen is that it leads to two *different slugs* becoming
      // *same* folder name.
      .replace(/\*/g, "_star_")
      .replace(/::/g, "_doublecolon_")
      .replace(/:/g, "_colon_")
      .replace(/\?/g, "_question_")

      .toLowerCase()
      .split("/")
      .map(sanitizeFilename)
      .join(path.sep)
  );
}

function humanFileSize(size) {
  if (size < 1024) return size + " B";
  let i = Math.floor(Math.log(size) / Math.log(1024));
  let num = size / Math.pow(1024, i);
  let round = Math.round(num);
  num = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round;
  return `${num} ${"KMGTPEZY"[i - 1]}B`;
}

function memoizeDuringBuild(fn, cacheKeyFn = null) {
  if (process.env.NODE_ENV === "development") {
    return fn;
  }

  const cache = new LRU(100);
  return (...args) => {
    const key = cacheKeyFn ? cacheKeyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const value = fn(...args);
    cache.set(key, value);
    return value;
  };
}

module.exports = {
  buildURL,
  slugToFoldername,
  humanFileSize,
  memoizeDuringBuild,
};
