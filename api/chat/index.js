// Azure Static Web Apps API function — proxies to OpenAI server-side
// This avoids CORS issues and keeps the API key hidden from the browser
module.exports = async function (context, req) {
  const apiKey = process.env.OPENAI_KEY;

  if (!apiKey) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: { message: "OPENAI_KEY not configured in Azure app settings" } })
    };
    return;
  }

  if (req.method !== "POST") {
    context.res = { status: 405, body: "Method not allowed" };
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    context.res = {
      status: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    context.res = {
      status: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: { message: "Proxy error: " + err.message } })
    };
  }
};
