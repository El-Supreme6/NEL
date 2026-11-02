/* NEL stats page (live leaderboards, calculated from match stats).
   Needs supabase.js and script.js loaded first. */
(() => {
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad2 = n => String(n).padStart(2, "0");
const empty = '<p style="padding:20px;color:var(--muted)">No data yet.</p>';

async function statsPage() {
    // screenshot import now lives in the staff panel
    $$(".stats-import-section, .stats-review-section").forEach(s => s.remove());

    const [pt, tm] = await Promise.all([
        db.from("player_totals").select("*"),
        db.from("teams").select("id,name")
    ]);
    if (pt.error) { console.error(pt.error); return; }
    const team = Object.fromEntries((tm.data || []).map(t => [t.id, t.name]));
    const P = pt.data.map(p => ({
        ...p,
        goals: +p.goals, assists: +p.assists, saves: +p.saves,
        mvps: +p.mvps, motms: +p.motms, appearances: +p.appearances,
        team: p.team_id ? team[p.team_id] : "Free agent"
    }));

    const top = (key, ok = () => true) => P.filter(p => p[key] > 0 && ok(p))
        .sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name)).slice(0, 5);
    const who = p => `<div class="leader-player"><div class="leader-avatar">${p.number != null ? pad2(p.number) : "?"}</div>
        <div><strong>${esc(p.name)}</strong><span>${esc(p.team)} · ${esc(p.position || "—")}</span></div></div>`;
    const rank = i => `<strong class="rank">${pad2(i + 1)}</strong>`;

    const boards = $$(".leaderboard");
    const fill = (el, list, fn) => { if (el) el.innerHTML = list.length ? list.map(fn).join("") : empty; };

    fill(boards[0], top("goals"), (p, i) =>
        `<div class="leaderboard-row">${rank(i)}${who(p)}<strong class="leader-stat">${p.goals}</strong></div>`);
    fill(boards[1], top("assists"), (p, i) =>
        `<div class="leaderboard-row">${rank(i)}${who(p)}<strong class="leader-stat">${p.assists}</strong></div>`);
    fill(boards[2], top("saves", p => (p.position || "").toUpperCase() === "GK"), (p, i) =>
        `<div class="leaderboard-row goalkeeper-row">${rank(i)}${who(p)}
        <div class="keeper-stats"><span>SAVES</span><strong>${p.saves}</strong></div>
        <div class="keeper-stats"><span>MATCHES</span><strong>${p.appearances}</strong></div></div>`);

    const mini = $$(".mini-leaderboard");
    const row = (p, i, v) => `<div><span>${pad2(i + 1)}</span><strong>${esc(p.name)}</strong><b>${v}</b></div>`;
    fill(mini[0], top("mvps"), (p, i) => row(p, i, p.mvps));
    fill(mini[1], top("motms"), (p, i) => row(p, i, p.motms));
}

if (document.querySelector(".stats-page")) statsPage();
})();
