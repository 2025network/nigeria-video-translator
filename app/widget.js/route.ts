export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const script = `
(function () {
  var currentScript = document.currentScript;
  var churchSlug = currentScript && currentScript.getAttribute("data-church") || "grace-city";
  var baseUrl = "${origin}";
  var panelId = "sermonbridge-panel";
  var buttonId = "sermonbridge-button";

  if (document.getElementById(buttonId)) return;

  var button = document.createElement("button");
  button.id = buttonId;
  button.type = "button";
  button.textContent = "Translate Sermon";
  button.setAttribute("aria-label", "Open SermonBridge translation panel");
  button.style.position = "fixed";
  button.style.right = "18px";
  button.style.bottom = "18px";
  button.style.zIndex = "2147483647";
  button.style.border = "0";
  button.style.borderRadius = "999px";
  button.style.background = "#34d399";
  button.style.color = "#04120c";
  button.style.font = "700 14px system-ui, -apple-system, Segoe UI, sans-serif";
  button.style.padding = "13px 18px";
  button.style.boxShadow = "0 18px 40px rgba(0,0,0,.28)";
  button.style.cursor = "pointer";

  var panel = document.createElement("div");
  panel.id = panelId;
  panel.style.position = "fixed";
  panel.style.top = "0";
  panel.style.right = "0";
  panel.style.width = "min(430px, 100vw)";
  panel.style.height = "100vh";
  panel.style.zIndex = "2147483647";
  panel.style.background = "#06110d";
  panel.style.boxShadow = "-20px 0 50px rgba(0,0,0,.35)";
  panel.style.transform = "translateX(105%)";
  panel.style.transition = "transform .24s ease";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";

  var header = document.createElement("div");
  header.style.minHeight = "56px";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.gap = "12px";
  header.style.padding = "10px 12px";
  header.style.borderBottom = "1px solid rgba(110, 231, 183, .18)";
  header.style.color = "#f4fff8";
  header.style.font = "700 14px system-ui, -apple-system, Segoe UI, sans-serif";
  header.textContent = "SermonBridge";

  var close = document.createElement("button");
  close.type = "button";
  close.textContent = "Close";
  close.style.border = "1px solid rgba(110, 231, 183, .28)";
  close.style.borderRadius = "8px";
  close.style.background = "transparent";
  close.style.color = "#d1fae5";
  close.style.padding = "8px 10px";
  close.style.cursor = "pointer";

  var iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/embed/" + encodeURIComponent(churchSlug) + "/live";
  iframe.title = "SermonBridge live sermon translation";
  iframe.allow = "autoplay; encrypted-media";
  iframe.allowFullscreen = true;
  iframe.style.border = "0";
  iframe.style.width = "100%";
  iframe.style.flex = "1";
  iframe.style.background = "#06110d";

  close.onclick = function () {
    panel.style.transform = "translateX(105%)";
  };
  button.onclick = function () {
    panel.style.transform = "translateX(0)";
  };

  header.appendChild(close);
  panel.appendChild(header);
  panel.appendChild(iframe);
  document.body.appendChild(button);
  document.body.appendChild(panel);
})();`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

