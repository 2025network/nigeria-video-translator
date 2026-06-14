(function () {
  var container = document.getElementById("sermonbridge-widget");

  if (!container) {
    console.warn("[SermonBridge] Widget container #sermonbridge-widget was not found.");
    return;
  }

  var churchSlug = container.getAttribute("data-church-slug");
  var branchSlug = container.getAttribute("data-branch-slug");

  if (!churchSlug) {
    container.innerHTML =
      '<div style="padding:16px;border:1px solid rgba(16,185,129,.35);border-radius:12px;background:#06110d;color:#ecfdf5;font-family:Arial,sans-serif;">SermonBridge setup error: missing data-church-slug.</div>';
    return;
  }

  var script = document.currentScript;
  var baseUrl = script && script.src ? new URL(script.src).origin : window.location.origin;
  var iframe = document.createElement("iframe");

  iframe.src = branchSlug
    ? baseUrl +
      "/embed/" +
      encodeURIComponent(churchSlug) +
      "/" +
      encodeURIComponent(branchSlug) +
      "/live"
    : baseUrl + "/embed/" + encodeURIComponent(churchSlug) + "/live";
  iframe.title = "SermonBridge live sermon translation";
  iframe.width = "100%";
  iframe.height = "720";
  iframe.style.width = "100%";
  iframe.style.height = "720px";
  iframe.style.border = "0";
  iframe.style.borderRadius = "16px";
  iframe.style.overflow = "hidden";
  iframe.setAttribute("allow", "autoplay; encrypted-media; microphone");
  iframe.setAttribute("allowfullscreen", "true");

  container.innerHTML = "";
  container.appendChild(iframe);
})();
