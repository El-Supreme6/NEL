/* NEL staff panel.
   This page only HIDES things by role. The database (Row Level Security) is what really enforces them,
   so changing this file can never give anyone extra power. */

const E = ["owner", "admin", "editor"], A = ["owner", "admin"], O = ["owner"];
const app = document.getElementById("admin-app");
const h = (tag, props = {}, ...kids) => {
    const el = Object.assign(document.createElement(tag), props);
    kids.flat().forEach(k => k != null && el.append(k));
    return el;
};

let ctx = null, activeUser = null, current = null, editing = null;
let msgEl, tabsEl, panelEl;
const look = { teams: [], players: [], matches: [] };

async function loadLookups() {
    const [t, p, m] = await Promise.all([
        db.from("teams").select("id,name").order("name"),
        db.from("players").select("id,name").order("name"),
        db.from("matches").select("id,slug").order("kickoff", { ascending: false })
    ]);
    look.teams = (t.data || []).map(x => ({ v: x.id, l: x.name }));
    look.players = (p.data || []).map(x => ({ v: x.id, l: x.name }));
    look.matches = (m.data || []).map(x => ({ v: x.id, l: x.slug }));
}
const nameOf = (k, id) => (look[k].find(x => x.v === id) || {}).l || "—";
const toLocalInput = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};
