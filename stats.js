/* NEL stats page (live leaderboards, calculated from match stats).
   Needs supabase.js and script.js loaded first. */
(() => {
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad2 = n => String(n).padStart(2, "0");
const empty = '<p style="padding:20px;color:var(--muted)">No data yet.</p>';
// "All Rounder", "All-Rounder", "allrounder" and "AR" all count as an all rounder
const isAR = pos => ["allrounder", "ar"].includes(String(pos || "").toLowerCase().replace(/[^a-z]/g, ""));
const isGK = pos => String(pos || "").trim().toUpperCase() === "GK";

async function statsPage() {
    // screenshot import was removed, and the old "VIEW ALL" links went nowhere
    $$(".stats-import-section, .stats-review-section").forEach(s => s.remove());
    $$(".section-header a").forEach(a => a.remove());

    const [pt, tm] = await Promise.all([
        db.from("player_totals").select("*"),
        db.from("teams").select("id,name")
    ]);
    if (pt.error) { console.error(pt.error); return; }
    const team = Object.fromEntries((tm.data || []).map(t => [t.id, t.name]));
    const P = pt.data.map(p => ({
        ...p,
        goals: +p.goals, assists: +p.assists, passes: +p.passes, intercepts: +p.intercepts, saves: +p.saves,
        mvps: +p.mvps, motms: +p.motms, appearances: +p.appearances,
        team: p.team_id ? team[p.team_id] : "Free agent"
    }));

    const top = (key, ok = () => true) => P.filter(p => p[key] > 0 && ok(p))
        .sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name)).slice(0, 5);
    const who = p => `<div class="leader-player"><div class="leader-avatar">${p.number != null ? pad2(p.number) : "?"}</div>
        <div><strong>${esc(p.name)}</strong><span>${esc(p.team)} · ${esc(p.position || "—")}</span></div></div>`;
    const rank = i => `<strong class="rank">${pad2(i + 1)}</strong>`;
    const fill = (el, list, fn) => { if (el) el.innerHTML = list.length ? list.map(fn).join("") : empty; };
    const stat = key => (p, i) =>
        `<div class="leaderboard-row">${rank(i)}${who(p)}<strong class="leader-stat">${p[key]}</strong></div>`;

    // existing boards: [0] goals, [1] assists, [2] goalkeepers
    const boards = $$(".leaderboard");
    const sec = el => el.closest(".section");
    const addBoard = (afterBoard, title) => {
        const copy = sec(afterBoard).cloneNode(true);
        copy.querySelector("h2").textContent = title;
        sec(afterBoard).after(copy);
        return copy.querySelector(".leaderboard");
    };
    const passBoard = boards[1] ? addBoard(boards[1], "🥏 MOST PASSES") : null;
    const intBoard = passBoard ? addBoard(passBoard, "🛡️ MOST INTERCEPTS") : null;
    if (boards[2]) sec(boards[2]).querySelector("h2").textContent = "🧤 SAVES LEADERS (GK & ALL ROUNDERS)";

    fill(boards[0], top("goals"), stat("goals"));
    fill(boards[1], top("assists"), stat("assists"));
    fill(passBoard, top("passes"), stat("passes"));
    fill(intBoard, top("intercepts"), stat("intercepts"));
    fill(boards[2], top("saves", p => isGK(p.position) || isAR(p.position)), (p, i) =>
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

