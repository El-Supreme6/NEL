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

/* ---------- what each tab edits ---------- */
const SECTIONS = [
    { key: "matches", label: "Matches", roles: E, table: "matches", pk: "id", order: ["kickoff", false],
      name: r => [r.slug, r.status.toUpperCase() + (r.home_score != null ? ` · ${r.home_score}-${r.away_score}` : "")],
      fields: [
        { n: "slug", l: "Slug (e.g. steelen-livergen)", t: "text", req: 1 },
        { n: "home_team", l: "Home team", t: "select", from: "teams", req: 1 },
        { n: "away_team", l: "Away team", t: "select", from: "teams", req: 1 },
        { n: "kickoff", l: "Kickoff (your local time)", t: "datetime" },
        { n: "type", l: "Type", t: "text", def: "FRIENDLY" },
        { n: "status", l: "Status", t: "select", opts: ["upcoming", "live", "finished"], req: 1, def: "upcoming" },
        { n: "home_score", l: "Home score (needed when finished)", t: "number" },
        { n: "away_score", l: "Away score (needed when finished)", t: "number" },
        { n: "venue", l: "Venue", t: "text", def: "TBD" },
        { n: "description", l: "Description", t: "textarea" },
        { n: "featured", l: "Featured match", t: "check" }] },
    { key: "stats", label: "Match stats", roles: E, table: "match_stats", pk: "id", order: ["id", false], conflict: "match_id,player_id",
      name: r => [nameOf("players", r.player_id), `${nameOf("matches", r.match_id)} · ${r.goals}G ${r.assists}A`],
      fields: [
        { n: "match_id", l: "Match", t: "select", from: "matches", req: 1 },
        { n: "player_id", l: "Player", t: "select", from: "players", req: 1 },
        { n: "goals", l: "Goals", t: "number", def: 0 },
        { n: "assists", l: "Assists", t: "number", def: 0 },
        { n: "intercepts", l: "Intercepts", t: "number", def: 0 },
        { n: "passes", l: "Passes", t: "number", def: 0 },
        { n: "saves", l: "Saves", t: "number", def: 0 },
        { n: "mvp", l: "MVP", t: "check" },
        { n: "motm", l: "Man of the match", t: "check" }] },
    { key: "import", label: "Import stats", roles: E, custom: "import" },
    { key: "news", label: "News", roles: E, table: "news", pk: "id", order: ["published_at", false],
      name: r => [r.title, `${r.category} · ${r.published ? "published" : "draft"}`],
      fields: [
        { n: "slug", l: "Slug (e.g. transfer-market-opens)", t: "text", req: 1 },
        { n: "category", l: "Category", t: "select", opts: ["MATCHDAY", "ANNOUNCEMENT", "TRANSFERS", "LEAGUE", "OTHER"], req: 1, def: "OTHER" },
        { n: "title", l: "Title", t: "text", req: 1 },
        { n: "intro", l: "Intro", t: "textarea" },
        { n: "body", l: "Body (blank line = new paragraph)", t: "textarea" },
        { n: "featured", l: "Featured story", t: "check" },
        { n: "published", l: "Published", t: "check", def: true }] },
    { key: "players", label: "Players", roles: A, table: "players", pk: "id", order: ["name", true],
      name: r => [r.name, `${r.position || "—"} · ${r.team_id ? nameOf("teams", r.team_id) : "Free agent"}`],
      fields: [
        { n: "slug", l: "Slug (e.g. player-alpha)", t: "text", req: 1 },
        { n: "name", l: "Name", t: "text", req: 1 },
        { n: "number", l: "Number", t: "number" },
        { n: "position", l: "Position (GK, CB, ST...)", t: "text" },
        { n: "team_id", l: "Team (empty = free agent)", t: "select", from: "teams" },
        { n: "discord_id", l: "Discord ID (lets them set their own status)", t: "text" },
        { n: "transfer_status", l: "Transfer status", t: "select", opts: ["willing", "unsure", "unwilling"], req: 1, def: "unsure" },
        { n: "base_value", l: "Starting value (millions)", t: "number", def: 0 },
        { n: "bio", l: "Bio", t: "textarea" },
        { n: "active", l: "Active", t: "check", def: true }] },
    { key: "teams", label: "Teams", roles: A, table: "teams", pk: "id", order: ["name", true],
      name: r => [r.name, `Budget ${r.budget}M`],
      fields: [
        { n: "slug", l: "Slug", t: "text", req: 1 },
        { n: "name", l: "Name", t: "text", req: 1 },
        { n: "logo_url", l: "Logo path (e.g. images/rpb.png)", t: "text" },
        { n: "description", l: "Description", t: "textarea" },
        { n: "budget", l: "Budget (millions)", t: "number", def: 50 }] },
    { key: "offers", label: "Offers", roles: A, custom: "offers" },
    { key: "masters", label: "Masters", roles: A, table: "masters", pk: "discord_id", order: ["created_at", false],
      name: r => [r.name || r.discord_id, nameOf("teams", r.team_id)],
      fields: [
        { n: "discord_id", l: "Discord ID", t: "text", req: 1 },
        { n: "team_id", l: "Club", t: "select", from: "teams", req: 1 },
        { n: "name", l: "Name", t: "text" }] },
    { key: "staff", label: "Staff", roles: O, table: "staff", pk: "discord_id", order: ["created_at", false],
      name: r => [r.name || r.discord_id, r.role],
      fields: [
        { n: "discord_id", l: "Discord ID", t: "text", req: 1 },
        { n: "name", l: "Name", t: "text" },
        { n: "role", l: "Role", t: "select", opts: ["owner", "admin", "editor"], req: 1, def: "editor" }] }
];

/* ---------- form ---------- */
function fieldEl(f, val) {
    if (f.t === "textarea") return h("textarea", { name: f.n, value: val ?? "" });
    if (f.t === "check") return h("input", { type: "checkbox", name: f.n, checked: !!val });
    if (f.t === "select") {
        const opts = f.opts ? f.opts.map(o => ({ v: o, l: o })) : look[f.from];
        const s = h("select", { name: f.n, required: !!f.req });
        s.append(h("option", { value: "", textContent: f.req ? "Choose…" : "— none —" }));
        opts.forEach(o => s.append(h("option", { value: o.v, textContent: o.l })));
        s.value = val ?? "";
        return s;
    }
    const props = { type: f.t === "datetime" ? "datetime-local" : f.t, name: f.n, value: val ?? "", required: !!f.req };
    if (f.t === "number") props.step = "any";
    return h("input", props);
}

function formEl(sec, row) {
    const form = h("form", { className: "adm-form" });
    sec.fields.forEach(f => {
        let val = row ? row[f.n] : f.def;
        if (f.t === "datetime") val = toLocalInput(val);
        const input = fieldEl(f, val);
        form.append(h("label", { className: f.t === "check" ? "chk" : "" },
            f.t === "check" ? [input, h("span", { textContent: f.l })] : [h("span", { textContent: f.l }), input]));
    });
    form.append(h("button", { className: "primary-button", type: "submit", textContent: row ? "Save changes" : "Add" }));
    if (row) form.append(" ", h("button", { className: "secondary-button", type: "button", textContent: "Cancel",
        onclick: () => { editing = null; show(); } }));
    form.onsubmit = e => { e.preventDefault(); save(sec, form, row); };
    return form;
}

async function save(sec, form, row) {
    const out = {};
    sec.fields.forEach(f => {
        const el = form.elements[f.n];
        let v = f.t === "check" ? el.checked : el.value.trim();
        if (f.t !== "check") {
            if (v === "") v = null;
            else if (f.t === "number") v = Number(v);
            else if (f.t === "datetime") v = new Date(v).toISOString();
        }
        out[f.n] = v;
    });
    const tbl = db.from(sec.table);
    const { error } = row ? await tbl.update(out).eq(sec.pk, row[sec.pk])
        : sec.conflict ? await tbl.upsert(out, { onConflict: sec.conflict })
        : await tbl.insert(out);
    if (error) return notify(error.message, true);
    notify(row ? "Saved." : "Added.");
    editing = null;
    await loadLookups();
    show();
}

async function del(sec, row) {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    const { error } = await db.from(sec.table).delete().eq(sec.pk, row[sec.pk]);
    if (error) return notify(error.message, true);
    notify("Deleted.");
    await loadLookups();
    show();
}

/* ---------- lists ---------- */
async function listEl(sec) {
    const box = h("div", { className: "adm-list" });
    let q = db.from(sec.table).select("*");
    if (sec.order) q = q.order(sec.order[0], { ascending: sec.order[1] });
    const { data, error } = await q.limit(100);
    if (error) { box.append(h("p", { textContent: error.message })); return box; }
    if (!data.length) box.append(h("p", { textContent: "Nothing here yet." }));
    data.forEach(r => {
        const [title, sub] = sec.name(r);
        box.append(h("div", { className: "adm-row" },
            h("div", {}, h("strong", { textContent: title }), h("br"), h("small", { textContent: sub })),
            h("div", { className: "adm-actions" },
                h("button", { className: "secondary-button", textContent: "Edit", onclick: () => { editing = r; show(); } }),
                h("button", { className: "reject-button", textContent: "Delete", onclick: () => del(sec, r) }))));
    });
    return box;
}

async function offersEl() {
    const box = h("div", { className: "adm-list" });
    const { data, error } = await db.from("offers")
        .select("*, player:players(name), buyer:teams!buyer_team(name), seller:teams!seller_team(name)")
        .order("updated_at", { ascending: false }).limit(100);
    if (error) { box.append(h("p", { textContent: error.message })); return box; }
    if (!data.length) box.append(h("p", { textContent: "No offers yet." }));
    const act = async (fn, id) => {
        const { error: err } = await db.rpc(fn, { p_offer: id });
        if (err) return notify(err.message, true);
        notify("Done.");
        show();
    };
    data.forEach(o => {
        const actions = h("div", { className: "adm-actions" });
        if (o.status === "accepted") {
            actions.append(
                h("button", { className: "primary-button", textContent: "Approve", onclick: () => act("complete_offer", o.id) }),
                h("button", { className: "reject-button", textContent: "Refuse", onclick: () => act("admin_reject_offer", o.id) }));
        }
        box.append(h("div", { className: "adm-row" },
            h("div", {},
                h("strong", { textContent: `${o.player ? o.player.name : "?"} → ${o.buyer ? o.buyer.name : "?"}` }), h("br"),
                h("small", { textContent: `${o.seller ? "From " + o.seller.name : "Free agent"} · ${o.fee}M · ${o.status.toUpperCase()}` })),
            actions));
    });
    return box;
}

/* ---------- screenshot import: Claude reads the stats table ---------- */
async function shrink(file) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = h("canvas", { width: Math.round(bmp.width * k), height: Math.round(bmp.height * k) });
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85).split(",")[1];
}
const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
function guessPlayer(name) {
    const n = norm(name);
    if (!n) return "";
    const hit = look.players.find(p => norm(p.l) === n)
        || look.players.find(p => norm(p.l) && (norm(p.l).includes(n) || n.includes(norm(p.l))));
    return hit ? hit.v : "";
}

function importEl() {
    let rows = [];
    const matchSel = h("select", {}, h("option", { value: "", textContent: "Choose the match…" }),
        look.matches.map(m => h("option", { value: m.v, textContent: m.l })));
    const file = h("input", { type: "file", accept: "image/*" });
    const status = h("p", { textContent: "Choose the match, add the end-of-match stats screenshot, then tap Read screenshot." });
    const readBtn = h("button", { className: "primary-button", type: "button", textContent: "Read screenshot" });
    const saveBtn = h("button", { className: "primary-button", type: "button", textContent: "Save all stats" });
    const rowsBox = h("div", { style: "margin-top:16px" });
    saveBtn.style.display = "none";

    const num = (r, k) => h("label", {}, h("span", { textContent: k }),
        h("input", { type: "number", min: "0", value: r[k] ?? 0, oninput: e => { r[k] = Number(e.target.value) || 0; } }));

    function draw(notes) {
        rowsBox.replaceChildren();
        if (!rows.length) { status.textContent = "No players found in that screenshot."; saveBtn.style.display = "none"; return; }
        status.textContent = `Found ${rows.length} players. Check every row, then save.` + (notes ? " Note: " + notes : "");
        rows.forEach(r => {
            const sel = h("select", {}, h("option", { value: "", textContent: "— choose player —" }),
                look.players.map(p => h("option", { value: p.v, textContent: p.l })));
            sel.value = r.player_id;
            sel.onchange = () => { r.player_id = sel.value; };
            rowsBox.append(h("div", { className: "adm-form", style: "margin-bottom:12px" },
                h("p", { textContent: `Screenshot name: ${r.name}` }), sel,
                h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-top:12px" },
                    ["goals", "assists", "intercepts", "passes", "saves"].map(k => num(r, k))),
                h("label", { className: "chk" }, h("input", { type: "checkbox", onchange: e => { r.mvp = e.target.checked; } }), h("span", { textContent: "MVP" })),
                h("label", { className: "chk" }, h("input", { type: "checkbox", onchange: e => { r.motm = e.target.checked; } }), h("span", { textContent: "Man of the match" }))));
        });
        saveBtn.style.display = "";
    }

    readBtn.onclick = async () => {
        if (!matchSel.value) return notify("Choose a match first.", true);
        if (!file.files[0]) return notify("Choose a screenshot first.", true);
        notify("");
        readBtn.disabled = true;
        status.textContent = "Reading the screenshot… this takes a few seconds.";
        try {
            const image = await shrink(file.files[0]);
            const { data, error } = await db.functions.invoke("analyze-stats", { body: { image } });
            if (error) {
                let msg = error.message;
                try { const j = await error.context.json(); if (j.error) msg = j.error; } catch (_) {}
                throw new Error(msg);
            }
            rows = (data.players || []).map(p => ({ ...p, player_id: guessPlayer(p.name), mvp: false, motm: false }));
            draw(data.notes);
        } catch (e) {
            status.textContent = "";
            notify(e.message, true);
        }
        readBtn.disabled = false;
    };

    saveBtn.onclick = async () => {
        const out = rows.filter(r => r.player_id).map(r => ({
            match_id: matchSel.value, player_id: r.player_id,
            goals: r.goals || 0, assists: r.assists || 0, intercepts: r.intercepts || 0,
            passes: r.passes || 0, saves: r.saves || 0, mvp: !!r.mvp, motm: !!r.motm
        }));
        if (!out.length) return notify("Choose a player for at least one row.", true);
        if (new Set(out.map(o => o.player_id)).size !== out.length) return notify("The same player is chosen on two rows.", true);
        const { error } = await db.from("match_stats").upsert(out, { onConflict: "match_id,player_id" });
        if (error) return notify(error.message, true);
        const skipped = rows.length - out.length;
        notify(`Saved ${out.length} players${skipped ? `, skipped ${skipped} with no player chosen` : ""}.`);
        rows = [];
        rowsBox.replaceChildren();
        saveBtn.style.display = "none";
        status.textContent = "Done. You can import another screenshot.";
    };

    return h("div", {},
        h("div", { className: "adm-form" },
            h("label", {}, h("span", { textContent: "Match" }), matchSel),
            h("label", {}, h("span", { textContent: "Stats screenshot" }), file),
            readBtn, " ", status),
        rowsBox,
        h("div", { style: "margin-top:12px" }, saveBtn));
}

/* ---------- layout ---------- */
function notify(text, bad) {
    msgEl.textContent = text;
    msgEl.className = "adm-msg" + (bad ? " bad" : "");
    msgEl.hidden = !text;
}

async function show() {
    const allowed = SECTIONS.filter(s => s.roles.includes(ctx.staff_role));
    if (!allowed.find(s => s.key === current)) current = allowed[0].key;
    const sec = allowed.find(s => s.key === current);

    tabsEl.replaceChildren(...allowed.map(s => h("button", {
        className: "filter-button" + (s.key === current ? " active" : ""),
        textContent: s.label,
        onclick: () => { current = s.key; editing = null; notify(""); show(); }
    })));

    panelEl.replaceChildren(h("p", { textContent: "Loading…" }));
    if (sec.custom) return panelEl.replaceChildren(await (sec.custom === "import" ? importEl() : offersEl()));
    const list = await listEl(sec);
    panelEl.replaceChildren(h("div", { className: "adm-grid" }, formEl(sec, editing), list));
}

function panelView(session) {
    const m = session.user.user_metadata || {};
    msgEl = h("div", { className: "adm-msg", hidden: true });
    tabsEl = h("div", { className: "adm-tabs" });
    panelEl = h("div");
    app.replaceChildren(
        h("div", { className: "adm-bar" },
            h("div", { className: "adm-who" },
                m.avatar_url ? h("img", { src: m.avatar_url, alt: "" }) : null,
                h("div", {}, h("strong", { textContent: m.full_name || m.name || "Signed in" }), h("br"),
                    h("small", { textContent: ctx.staff_role.toUpperCase() }))),
            h("button", { className: "reject-button", textContent: "Log out", onclick: () => db.auth.signOut() })),
        msgEl, tabsEl, panelEl);
    show();
}

function simpleView(text, withLogout) {
    app.replaceChildren(h("div", { className: "adm-form" },
        h("p", { textContent: text }),
        withLogout ? h("button", { className: "reject-button", textContent: "Log out", onclick: () => db.auth.signOut() }) : null));
}

function loginView() {
    app.replaceChildren(h("div", { className: "adm-form" },
        h("p", { textContent: "Staff only. Sign in with the Discord account that is on the NEL staff list." }),
        h("button", { className: "primary-button", textContent: "Log in with Discord",
            onclick: () => db.auth.signInWithOAuth({ provider: "discord",
                options: { redirectTo: location.origin + location.pathname } }) })));
}

/* ---------- start ---------- */
async function boot() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) { activeUser = null; return loginView(); }
    if (session.user.id === activeUser) return;
    await db.rpc("ensure_profile");
    const { data, error } = await db.rpc("my_context");
    if (error) return simpleView("Could not load your account: " + error.message, true);
    ctx = data;
    if (!ctx.staff_role) return simpleView("You are signed in, but this Discord account is not on the NEL staff list. Ask an owner to add your Discord ID.", true);
    activeUser = session.user.id;
    await loadLookups();
    panelView(session);
}

db.auth.onAuthStateChange(event => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(boot, 0);
});
boot();
