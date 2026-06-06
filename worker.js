export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env.ALLOWED_ORIGIN) });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, env);
    }

    const adminSecret = request.headers.get("x-admin-secret");
    if (!adminSecret || adminSecret !== env.ADMIN_SHARED_SECRET) {
      return json({ error: "Unauthorized" }, 401, env);
    }

    const payload = await request.json();
    const team = payload.team || payload;
    const incomingPresets = payload.presets;

    if (!team.category || !team.subcategory || !team.title) {
      return json({ error: "Missing required fields" }, 400, env);
    }

    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || "main";
    const token = env.GITHUB_TOKEN;
    const path = "teams.json";

    const currentRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: githubHeaders(token)
    });

    let current = { teams: [], presets: {} };
    let sha = undefined;

    if (currentRes.ok) {
      const currentFile = await currentRes.json();
      sha = currentFile.sha;
      current = JSON.parse(atob(currentFile.content.replace(/\n/g, "")));
    }

    current.teams = Array.isArray(current.teams) ? current.teams : [];
    current.presets = current.presets && typeof current.presets === "object" ? current.presets : {};

    current.teams.unshift({
      id: team.id || crypto.randomUUID(),
      category: team.category,
      subcategory: team.subcategory,
      difficulty: team.difficulty || "",
      rng: team.rng || "",
      result: team.result || "",
      title: team.title,
      tags: team.tags || "",
      notes: team.notes || "",
      image: team.image || "",
      createdAt: team.createdAt || new Date().toISOString()
    });

    if (incomingPresets && typeof incomingPresets === "object") {
      current.presets = incomingPresets;
    }

    if (!current.presets[team.category]) current.presets[team.category] = [];
    if (team.subcategory && !current.presets[team.category].includes(team.subcategory)) {
      current.presets[team.category].push(team.subcategory);
    }

    const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(current, null, 2))));

    const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: githubHeaders(token),
      body: JSON.stringify({
        message: `Add team: ${team.title}`,
        content: updatedContent,
        sha,
        branch
      })
    });

    if (!updateRes.ok) {
      return json({ error: await updateRes.text() }, 500, env);
    }

    return json({ ok: true }, 200, env);
  }
};

function githubHeaders(token) {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "acc-team-admin-worker",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-secret"
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env.ALLOWED_ORIGIN)
    }
  });
}
