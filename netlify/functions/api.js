async function handler(event, _context) {
  try {
    const urlPrefix = "/.netlify/functions/api";
    const fullPath = event.path || "/";
    const subPath = fullPath.startsWith(urlPrefix)
      ? fullPath.slice(urlPrefix.length) || "/"
      : fullPath;

    // Basic router
    if (event.httpMethod === "GET" && (subPath === "/" || subPath === "")) {
      return json({ message: "G-AID Netlify API" });
    }

    if (event.httpMethod === "GET" && subPath === "/ping") {
      const ping = process.env.PING_MESSAGE ?? "ping";
      return json({ message: ping });
    }

    if (event.httpMethod === "GET" && subPath === "/demo") {
      return json({ message: "Hello from Netlify!" });
    }

    if (subPath === "/chat") {
      if (event.httpMethod !== "POST") return methodNotAllowed(["POST"]);
      const body = parseJson(event.body);
      const message = String(body?.message ?? "");
      const history = Array.isArray(body?.history) ? body.history : [];
      if (!message) return badRequest({ reply: "Please provide a message." });

      const envUrl = process.env.N8N_CHAT_WEBHOOK_URL || null;
      const defaultUrl =
        "https://yossefflix2.app.n8n.cloud/webhook/ab05a77b-9a6e-4292-b9ea-e90e0c7d31ab";
      const webhookUrl = envUrl || defaultUrl;

      const upstream = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      const contentType = upstream.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await upstream.json();
        const reply =
          typeof data?.reply === "string" ? data.reply : JSON.stringify(data);
        return json({ reply });
      }
      const text = await upstream.text();
      return json({ reply: text });
    }

    if (event.httpMethod === "GET" && subPath === "/chat/config") {
      const envUrl = process.env.N8N_CHAT_WEBHOOK_URL || null;
      const def =
        "https://yossefflix2.app.n8n.cloud/webhook/ab05a77b-9a6e-4292-b9ea-e90e0c7d31ab";
      return json({ webhookUrl: envUrl || def });
    }

    return notFound();
  } catch (err) {
    console.error("Netlify function error", err);
    return json({ error: "Internal Server Error" }, 500);
  }
}

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  };
}

function parseJson(body) {
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    return {};
  }
}

function notFound() {
  return json({ error: "Not Found" }, 404);
}

function badRequest(data) {
  return json(data, 400);
}

function methodNotAllowed(allowed) {
  return {
    statusCode: 405,
    headers: {
      Allow: allowed.join(", "),
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ error: "Method Not Allowed" }),
  };
}

module.exports = { handler };
