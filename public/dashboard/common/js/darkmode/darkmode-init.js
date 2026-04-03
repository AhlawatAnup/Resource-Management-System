(function () {
  const saved = localStorage.getItem("dark-mode");

  if (saved === "enabled") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/darkreader/darkreader.min.js";
    script.onload = function () {
      DarkReader.enable();
    };
    document.head.appendChild(script);
  }
})();