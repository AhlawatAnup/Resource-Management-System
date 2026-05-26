const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { minify } = require("html-minifier-terser");
const { entries, output } = require("../hpack.config");

class HTMLBundler {
  constructor() {
    this.entryDependencies = new Map(); // entry -> files
    this.fileToEntries = new Map(); // file -> entries

    this.watcher = chokidar.watch([], {
      ignoreInitial: true,
      persistent: true
    });

    this.watcher.on("change", filePath => {
      console.log("File changed:", filePath);
      this.rebuildAffected(filePath);
    });
  }

  async build(entryName, entryFile) {
    try {
      const html = fs.readFileSync(entryFile, "utf8");
      const $ = cheerio.load(html);

      const dependencies = new Set();

      this.processIncludeTags($, entryFile, dependencies);

      this.removeComments($);

      const minifiedHTML = await minify($.html(), {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      });

      const outputDir = path.join(output.path, entryName + ".pack");

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputFile = path.join(outputDir, path.basename(entryFile));

      fs.writeFileSync(outputFile, minifiedHTML, "utf8");

      console.log("Bundled:", entryName);

      this.updateDependencyGraph(entryName, entryFile, dependencies);

      // WATCH ALL DEPENDENCIES
      this.addWatchFiles([entryFile, ...dependencies]);
    } catch (err) {
      console.error("Build Error:", err);
    }
  }

  processIncludeTags($, referenceFile, dependencies) {
    $("include").each((index, element) => {
      const src = $(element).attr("src");

      if (!src) return;

      const componentPath = path.join(path.dirname(referenceFile), src);

      if (!fs.existsSync(componentPath)) {
        console.error("Component not found:", componentPath);
        return;
      }

      dependencies.add(componentPath);

      const content = fs.readFileSync(componentPath, "utf8");

      const component$ = cheerio.load(content);

      this.processIncludeTags(component$, componentPath, dependencies);

      $(element).replaceWith(component$.html());
    });
  }

  removeComments($) {
    $("*")
      .contents()
      .each(function() {
        if (this.type === "comment") {
          $(this).remove();
        }
      });
  }

  updateDependencyGraph(entryName, entryFile, dependencies) {
    dependencies.add(entryFile);

    this.entryDependencies.set(entryName, dependencies);

    dependencies.forEach(file => {
      if (!this.fileToEntries.has(file)) {
        this.fileToEntries.set(file, new Set());
      }

      this.fileToEntries.get(file).add(entryName);
    });
  }

  addWatchFiles(files) {
    files.forEach(file => {
      this.watcher.add(file);
    });
  }

  async rebuildAffected(filePath) {
    const affectedEntries = this.fileToEntries.get(filePath);

    if (!affectedEntries) return;

    for (const entryName of affectedEntries) {
      const entryFile = entries[entryName];

      console.log("Rebuilding:", entryName);

      await this.build(entryName, entryFile);
    }
  }

  async buildAllEntries() {
    for (const entryName in entries) {
      await this.build(entryName, entries[entryName]);
    }
  }
}

async function startBundler() {
  const bundler = new HTMLBundler();

  await bundler.buildAllEntries();
}

startBundler();
