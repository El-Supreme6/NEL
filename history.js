/* NEL history: seasons saved by "End season". The archive stores names as text,
   so it stays complete even after clubs or players are deleted. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const app = document.getElementById("history-app");
const fmt = k => (k ? new Date(k).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const note = t => `<p style="color:var(--muted)">${t}</p>`;
const block = (title, inner) => `<div class="hx-block"><div class="section-header"><h2>${title}</h2></div>${inner}</div>`;

const AWARDS = [
    ["top_scorer", "TOP SCORER", "goals"], ["top_assists", "MOST ASSISTS", "assists"],
    ["top_keeper", "TOP KEEPER", "saves"], ["mvp", "MVP", "awards"], ["motm", "MAN OF THE MATCH", "awards"]
];

const awardsHTML = s => `<div class="performance-grid">${AWARDS.map(([k, label, unit]) => {
    const a = (s.summary || {})[k];
    return `<div class="performance-card"><span>${label}</span><strong>${a ? esc(a.name) : "—"}</strong>
        <small>${a ? `${esc(a.team || "No club")} · ${a.value} ${unit}` : "No data"}</small></div>`;
}).join("")}</div>`;

const standingsHTML = rows => rows.length ? `<div class="standings-table-wrapper"><table class="standings-table">
    <thead><tr><th>POS</th><th>TEAM</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>
    ${rows.map(r => `<tr class="${r.position <= 3 ? "top-position" : ""}"><td class="position">${r.position}</td>
        <td><div class="team-cell">${r.logo_url ? `<img src="${esc(r.logo_url)}" alt="">` : `<div class="team-placeholder">${esc(r.team_name.charAt(0))}</div>`}<strong>${esc(r.team_name)}</strong></div></td>
        <td>${r.played}</td><td>${r.wins}</td><td>${r.draws}</td><td>${r.losses}</td><td>${r.gd > 0 ? "+" + r.gd : r.gd}</td><td class="points">${r.points}</td></tr>`).join("")}
    </tbody></table></div>` : note("No league matches were played this season.");

const statRows = (rows, withApps) => rows.map(r => `<tr><td>${esc(r.player_name)}</td><td>${esc(r.team_name || "—")}</td>
    ${withApps ? `<td>${r.appearances}</td>` : ""}<td>${r.goals}</td><td>${r.assists}</td><td>${r.intercepts}</td><td>${r.passes}</td><td>${r.saves}</td>
    ${withApps ? `<td>${r.mvps}</td><td>${r.motms}</td>` : `<td>${[r.mvp ? "MVP" : "", r.motm ? "MOTM" : ""].filter(Boolean).join(" ") || "—"}</td>`}</tr>`).join("");

const tableHTML = (rows, withApps) => `<div class="stats-review"><div class="stats-table-wrapper"><table class="stats-table"><thead><tr>
    <th>PLAYER</th><th>CLUB</th>${withApps ? "<th>APP</th>" : ""}<th>G</th><th>A</th><th>INT</th><th>PASS</th><th>SAVES</th>${withApps ? "<th>MVP</th><th>MOTM</th>" : "<th>AWARD</th>"}
    </tr></thead><tbody>${statRows(rows, withApps)}</tbody></table></div></div>`;

const matchHTML = m => `<details class="hx-match" data-id="${esc(m.id)}"><summary>
    <span>${esc(m.type || "")}</span>
    <strong>${esc(m.home_name)} ${m.status === "finished" ? `${m.home_score} - ${m.away_score}` : "vs"} ${esc(m.away_name)}</strong>
    <small>${fmt(m.kickoff)}</small></summary><div class="hx-body">${note("Loading…")}</div></details>`;

async function showSeason(s, tabs) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.id === s.id));
    const out = $("#hx-out");
    out.innerHTML = note("Loading…");

    const [st, pl, ms] = await Promise.all([
        db.from("season_standings").select("*").eq("season_id", s.id).order("position"),
        db.from("season_players").select("*").eq("season_id", s.id).order("goals", { ascending: false }).limit(500),
        db.from("season_matches").select("*").eq("season_id", s.id).order("kickoff", { ascending: false }).limit(1000)
    ]);

    out.innerHTML =
        `<p style="margin-bottom:40px;color:var(--muted)">${s.champion ? `Champion: <strong style="color:var(--cyan)">${esc(s.champion)}</strong> · ` : ""}Ended ${fmt(s.ended_at)}</p>`
        + block("AWARDS", awardsHTML(s))
        + block("FINAL TABLE", standingsHTML(st.data || []))
        + block("PLAYER STATS", (pl.data || []).length ? tableHTML(pl.data, true) : note("No player stats were recorded."))
        + block("MATCHES", (ms.data || []).map(matchHTML).join("") || note("No matches were recorded."));
}

async function start() {
    const { data: seasons, error } = await db.from("seasons").select("*").order("ended_at", { ascending: false });
    if (error) { app.innerHTML = note("Could not load history."); console.error(error); return; }
    if (!seasons.length) { app.innerHTML = note("No seasons have been archived yet. The first one appears here when a season ends."); return; }

    app.innerHTML = `<div class="hx-tabs">${seasons.map(s =>
        `<button class="filter-button" data-id="${esc(s.id)}">${esc(s.name)}</button>`).join("")}</div><div id="hx-out"></div>`;
    const tabs = [...app.querySelectorAll(".hx-tabs button")];
    const byId = Object.fromEntries(seasons.map(s => [s.id, s]));
    tabs.forEach(t => t.addEventListener("click", () => showSeason(byId[t.dataset.id], tabs)));

    // per-match player stats load when a match is opened
    app.addEventListener("toggle", async e => {
        const d = e.target;
        if (!d.matches || !d.matches("details.hx-match") || !d.open || d.dataset.loaded) return;
        d.dataset.loaded = "1";
        const { data } = await db.from("season_match_stats").select("*").eq("season_match_id", d.dataset.id)
            .order("goals", { ascending: false });
        $(".hx-body", d).innerHTML = (data || []).length ? tableHTML(data, false) : note("No player stats were recorded for this match.");
    }, true);

    const wanted = new URLSearchParams(location.search).get("season");
    showSeason(byId[wanted] || seasons[0], tabs);
}

start();
})();
