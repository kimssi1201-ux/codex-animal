const ADSENSE_SNIPPET =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6066428844912614" crossorigin="anonymous"></script>';

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  const html = await response.text();

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  if (html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const injected = html.replace(/<\/head>/i, `${ADSENSE_SNIPPET}\n</head>`);

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
