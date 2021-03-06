const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const cheerio = require("cheerio");
const simpleGit = require("simple-git");

const buildRoot = path.join("..", "client", "build");

test("content built foo page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  const builtFolder = path.join(buildRoot, "en-us", "docs", "web", "foo");
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.title).toBe("<foo>: A test tag");
  expect(doc.summary).toBe("This is a sample page");
  expect(doc.mdn_url).toBe("/en-US/docs/Web/Foo");
  expect(doc.popularity).toBe(0.5);
  expect(doc.modified).toBeTruthy();
  expect(doc.source).toBeTruthy();

  const htmlFile = path.join(builtFolder, "index.html");
  expect(fs.existsSync(htmlFile)).toBeTruthy();
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("p").text()).toMatch(/Below is a sample interactive example/);
  expect($("iframe").length).toEqual(1);
});

test("content built titles.json file", () => {
  const titlesFile = path.join(buildRoot, "en-us", "titles.json");
  expect(fs.existsSync(titlesFile)).toBeTruthy();
  const { titles } = JSON.parse(fs.readFileSync(titlesFile));
  expect(titles["/en-US/docs/Web/Foo"].title).toEqual("<foo>: A test tag");
  expect(titles["/en-US/docs/Web/Foo"].popularity).toEqual(0.5);

  // The archived content's documents should be in there
  expect(titles["/en-US/docs/XUL/ancientness"]).toBeFalsy();
});

test("the 'notranslate' class is correctly inserted", () => {
  const folder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "donttranslatethese"
  );
  const htmlFile = path.join(folder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("pre.notranslate").length).toEqual($("pre").length);
});

test("content with non-ascii characters in the slug", () => {
  const titlesFile = path.join(buildRoot, "en-us", "titles.json");
  expect(fs.existsSync(titlesFile)).toBeTruthy();
  const { titles } = JSON.parse(fs.readFileSync(titlesFile));
  expect(titles["/en-US/docs/Glossary/Bézier_curve"]).toBeTruthy();

  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "glossary",
    "bézier_curve"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.title).toBe("Bézier curve");
  expect(doc.mdn_url).toBe("/en-US/docs/Glossary/Bézier_curve");
});

test("content built bar page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  const builtFolder = path.join(buildRoot, "en-us", "docs", "web", "bar");
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.title).toBe("bar: A collection of xref macro calls");
  expect(doc.summary).toBe("This is the Bar test page.");
  expect(doc.mdn_url).toBe("/en-US/docs/Web/Bar");
  expect(doc.popularity).toBe(0.51);
  expect(doc.modified).toBeTruthy();
  expect(doc.source).toBeTruthy();
  expect(doc.flaws.macros.length).toBe(12);
  expect(doc.flaws.macros[0].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[0].macroSource).toBe('{{CSSxRef("bigfoot")}}');
  expect(doc.flaws.macros[0].line).toBe(10);
  expect(doc.flaws.macros[0].column).toBe(6);
  expect(doc.flaws.macros[1].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[1].macroSource).toBe('{{CSSxRef("dumber")}}');
  expect(doc.flaws.macros[1].line).toBe(11);
  expect(doc.flaws.macros[1].column).toBe(6);
  expect(doc.flaws.macros[1].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[1].redirectInfo.current).toBe("dumber");
  expect(doc.flaws.macros[1].redirectInfo.suggested).toBe("number");
  expect(doc.flaws.macros[2].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[2].macroSource).toBe('{{DOMxRef("bigfoot")}}');
  expect(doc.flaws.macros[2].line).toBe(13);
  expect(doc.flaws.macros[2].column).toBe(6);
  expect(doc.flaws.macros[3].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[3].macroSource).toBe('{{DOMxRef("Bob")}}');
  expect(doc.flaws.macros[3].line).toBe(14);
  expect(doc.flaws.macros[3].column).toBe(6);
  expect(doc.flaws.macros[3].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[3].redirectInfo.current).toBe("Bob");
  expect(doc.flaws.macros[3].redirectInfo.suggested).toBe("Blob");
  expect(doc.flaws.macros[4].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[4].macroSource).toBe(
    '{{htmlattrxref("href", "bigfoot")}}'
  );
  expect(doc.flaws.macros[4].line).toBe(16);
  expect(doc.flaws.macros[4].column).toBe(6);
  expect(doc.flaws.macros[5].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[5].macroSource).toBe(
    '{{htmlattrxref("href", "anchor")}}'
  );
  expect(doc.flaws.macros[5].line).toBe(17);
  expect(doc.flaws.macros[5].column).toBe(6);
  expect(doc.flaws.macros[5].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[5].redirectInfo.current).toBe("anchor");
  expect(doc.flaws.macros[5].redirectInfo.suggested).toBe("a");
  expect(doc.flaws.macros[6].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[6].macroSource).toBe('{{jsxref("bigfoot")}}');
  expect(doc.flaws.macros[6].line).toBe(19);
  expect(doc.flaws.macros[6].column).toBe(6);
  expect(doc.flaws.macros[7].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[7].macroSource).toBe('{{jsxref("Stern_mode")}}');
  expect(doc.flaws.macros[7].line).toBe(20);
  expect(doc.flaws.macros[7].column).toBe(6);
  expect(doc.flaws.macros[7].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[7].redirectInfo.current).toBe("Stern_mode");
  expect(doc.flaws.macros[7].redirectInfo.suggested).toBe("Strict_mode");
  expect(doc.flaws.macros[8].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[8].macroSource).toBe('{{jsxref("Flag")}}');
  expect(doc.flaws.macros[8].line).toBe(22);
  expect(doc.flaws.macros[8].column).toBe(6);
  expect(doc.flaws.macros[8].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[8].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[8].redirectInfo.suggested).toBe("Boolean");
  expect(doc.flaws.macros[9].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[9].macroSource).toBe("{{ jsxref('Flag') }}");
  expect(doc.flaws.macros[9].line).toBe(23);
  expect(doc.flaws.macros[9].column).toBe(6);
  expect(doc.flaws.macros[9].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[9].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[9].redirectInfo.suggested).toBe("Boolean");
  expect(doc.flaws.macros[10].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[10].macroSource).toBe('{{JSXref("Flag")}}');
  expect(doc.flaws.macros[10].line).toBe(24);
  expect(doc.flaws.macros[10].column).toBe(6);
  expect(doc.flaws.macros[10].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[10].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[10].redirectInfo.suggested).toBe("Boolean");
  expect(doc.flaws.macros[11].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[11].macroSource).toBe('{{JSXref("Flag")}}');
  expect(doc.flaws.macros[11].line).toBe(25);
  expect(doc.flaws.macros[11].column).toBe(6);
  expect(doc.flaws.macros[11].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[11].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[11].redirectInfo.suggested).toBe("Boolean");

  const htmlFile = path.join(builtFolder, "index.html");
  expect(fs.existsSync(htmlFile)).toBeTruthy();
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("a[data-flaw-src]").length).toEqual(12);

  const brokenLinks = $("a.new");
  expect(brokenLinks.length).toEqual(4);
  expect(brokenLinks.eq(0).data("flaw-src")).toBe('{{CSSxRef("bigfoot")}}');
  expect(brokenLinks.eq(0).text()).toBe("bigfoot");
  expect(brokenLinks.eq(1).data("flaw-src")).toBe('{{DOMxRef("bigfoot")}}');
  expect(brokenLinks.eq(1).text()).toBe("bigfoot");
  expect(brokenLinks.eq(2).data("flaw-src")).toBe(
    '{{htmlattrxref("href", "bigfoot")}}'
  );
  expect(brokenLinks.eq(2).text()).toBe("href");
  expect(brokenLinks.eq(3).data("flaw-src")).toBe('{{jsxref("bigfoot")}}');
  expect(brokenLinks.eq(3).text()).toBe("bigfoot");
  brokenLinks.each((index, element) => {
    expect($(element).attr("title")).toMatch(
      /The documentation about this has not yet been written/
    );
  });

  const numberLinks = $('a[href="/en-US/docs/Web/CSS/number"]');
  expect(numberLinks.length).toEqual(2);
  numberLinks.each((index, element) => {
    expect($(element).attr("title")).toBe("This is the number test page.");
  });
  expect(numberLinks.eq(0).text()).toBe("<dumber>");
  expect(numberLinks.eq(0).data("flaw-src")).toBe('{{CSSxRef("dumber")}}');
  expect(numberLinks.eq(1).text()).toBe("<number>");
  expect(numberLinks.eq(1).data("flaw-src")).toBeFalsy();

  const blobLinks = $('a[href="/en-US/docs/Web/API/Blob"]:not([title])');
  expect(blobLinks.length).toEqual(2);
  expect(blobLinks.eq(0).text()).toBe("Bob");
  expect(blobLinks.eq(0).data("flaw-src")).toBe('{{DOMxRef("Bob")}}');
  expect(blobLinks.eq(1).text()).toBe("Blob");
  expect(blobLinks.eq(1).data("flaw-src")).toBeFalsy();

  const hrefLinks = $(
    'a[href="/en-US/docs/Web/HTML/Element/a#attr-href"]:not([title])'
  );
  expect(hrefLinks.length).toEqual(2);
  hrefLinks.each((index, element) => {
    expect($(element).text()).toBe("href");
  });
  expect(hrefLinks.eq(0).data("flaw-src")).toBe(
    '{{htmlattrxref("href", "anchor")}}'
  );
  expect(hrefLinks.eq(1).data("flaw-src")).toBeFalsy();

  const strictModeLinks = $(
    'a[href="/en-US/docs/Web/JavaScript/Reference/Strict_mode"]:not([title])'
  );
  expect(strictModeLinks.length).toEqual(2);
  expect(strictModeLinks.eq(0).text()).toBe("Stern_mode");
  expect(strictModeLinks.eq(0).data("flaw-src")).toBe(
    '{{jsxref("Stern_mode")}}'
  );
  expect(strictModeLinks.eq(1).text()).toBe("Strict_mode");
  expect(strictModeLinks.eq(1).data("flaw-src")).toBeFalsy();

  const booleanLinks = $(
    'a[href="/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean"]:not([title])'
  );
  expect(booleanLinks.length).toEqual(6);
  expect(booleanLinks.eq(0).text()).toBe("Flag");
  expect(booleanLinks.eq(0).data("flaw-src")).toBe('{{jsxref("Flag")}}');
  expect(booleanLinks.eq(1).text()).toBe("Flag");
  expect(booleanLinks.eq(1).data("flaw-src")).toBe("{{ jsxref('Flag') }}");
  expect(booleanLinks.eq(2).text()).toBe("Flag");
  expect(booleanLinks.eq(2).data("flaw-src")).toBe('{{JSXref("Flag")}}');
  expect(booleanLinks.eq(3).text()).toBe("Flag");
  expect(booleanLinks.eq(3).data("flaw-src")).toBe('{{JSXref("Flag")}}');
  expect(booleanLinks.eq(4).text()).toBe("Boolean");
  expect(booleanLinks.eq(4).data("flaw-src")).toBeFalsy();
  expect(booleanLinks.eq(5).text()).toBe("bOOleAn");
  expect(booleanLinks.eq(5).data("flaw-src")).toBeFalsy();
});

test("broken links flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "brokenlinks"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.broken_links.length).toBe(8);
  // Map them by 'href'
  const map = new Map(flaws.broken_links.map((x) => [x.href, x]));
  expect(map.get("/en-US/docs/Hopeless/Case").suggestion).toBeNull();
  expect(map.get("/en-US/docs/Web/CSS/dumber").line).toBe(11);
  expect(map.get("/en-US/docs/Web/CSS/dumber").column).toBe(12);
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob").suggestion
  ).toBe("/en-US/docs/Web/API/Blob");
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob#Anchor")
      .suggestion
  ).toBe("/en-US/docs/Web/API/Blob#Anchor");
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob?a=b")
      .suggestion
  ).toBe("/en-US/docs/Web/API/Blob?a=b");
  expect(map.get("/en-us/DOCS/Web/api/BLOB").suggestion).toBe(
    "/en-US/docs/Web/API/Blob"
  );
  expect(
    map.get("/en-US/docs/Web/HTML/Element/anchor#fragment").suggestion
  ).toBe("/en-US/docs/Web/HTML/Element/a#fragment");
});

test("check built flaws for /en-us/learn/css/css_layout/introduction/grid page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "learn",
    "css",
    "css_layout",
    "introduction",
    "grid"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // Let's make sure there are only 3 "macros" flaws.
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.flaws.macros.length).toBe(3);
});

describe("fixing flaws", () => {
  const basePattern = path.join("testing", "content", "files");
  const pattern = path.join("web", "fixable_flaws");

  // If we don't specify this, doing things like `await git.diffSummary()`
  // will report files as they appear relative to the `.git/` root which
  // might be different from the current `process.cwd()` which makes it
  // impossible to look at file paths in a predictable way.
  const baseDir = path.resolve("..");

  async function getChangedFiles() {
    const git = simpleGit();
    const diff = await git.diffSummary();
    return diff.files
      .filter((f) => f.file.includes(basePattern) && f.file.includes(pattern))
      .map((f) => f.file);
  }

  beforeAll(async () => {
    // We assume we can test changes to the local git repo. If there were
    // already existing fixes to the fixtures we intend to actually change,
    // then tests are a no-go.
    // We basically want to check that none of the files we intend to mess
    // with, from jest, are already messed with.
    const files = await getChangedFiles();
    if (files.length) {
      // This is draconian but necessary.
      // See https://github.com/facebook/jest/issues/2713
      // which is closed but it't still not a feature for our version of
      // jest to have it so that it stops running the tests if you throw
      // an error in here.
      console.error(
        `Can't test these things when ${files} already has its own changes`
      );
      // Basically, if the files that we care to test changing, were
      // already changed (manually) then we can't run our tests and we
      // want to bail hard.
      process.exit(1);
    }
  });

  // Aka. clean up by checking out any unstaged file changes made by the tests
  afterAll(async () => {
    // Undo any changed files of the interesting pattern
    const git = simpleGit({
      baseDir,
    });
    const diff = await git.diffSummary();
    const files = diff.files
      .map((f) => f.file)
      .filter((f) => f.includes(basePattern) && f.includes(pattern));
    if (files.length) {
      try {
        await git.checkout(files);
      } catch (err) {
        // Otherwise any error here would be swallowed
        console.error(err);
        throw err;
      }
    }
  });

  // Got to test dry-run mode and non-dry-run mode in serial otherwise
  // test my run those two things in parallel and it's not thread-safe
  // to change files on disk.
  // This is why this test does so much.
  test("build with --fix-flaws", async () => {
    const command = `node content build --fix-flaws -f ${pattern}`;
    const dryrunCommand = command + " --fix-flaws-dry-run";
    const dryrunStdout = execSync(dryrunCommand, {
      cwd: baseDir,
      windowsHide: true,
    }).toString();

    const regexPattern = /Would have modified "(.*)", if this was not a dry run/g;
    const dryRunNotices = dryrunStdout
      .split("\n")
      .filter((line) => regexPattern.test(line));
    expect(dryRunNotices.length).toBe(1);
    expect(dryRunNotices[0]).toContain(pattern);
    const dryrunFiles = await getChangedFiles();
    expect(dryrunFiles.length).toBe(0);

    // Now, let's do it without dry-run
    const stdout = execSync(command + " --fix-flaws-verbose", {
      cwd: baseDir,
      windowsHide: true,
    }).toString();
    expect(stdout).toContain(pattern);

    const files = await getChangedFiles();
    expect(files.length).toBe(1);
    const newRawHtml = fs.readFileSync(path.join(baseDir, files[0]), "utf-8");
    expect(newRawHtml).toContain("{{CSSxRef('number')}}");
    expect(newRawHtml).toContain('{{htmlattrxref("href", "a")}}');
    // XXX Note, at the moment, we're only fixing macros.
    // But as part of https://github.com/mdn/yari/issues/680 it is intended
    // to fix other things such as broken links.
  });
});
