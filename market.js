/* NEL market + negotiation pages (live data from Supabase).
   Needs supabase.js and script.js loaded first. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const M = v => `${+Number(v).toFixed(2)}M`;
const ICON = { willing: "🟢", unsure: "🟡", unwilling: "🔴" };
const pad = n => (n == null ? "?" : String(n).padStart(2, "0"));
const link = p => `negotiations.html?id=${encodeURIComponent(p.slug)}`;
const note = t => `<p style="color:var(--muted)">${t}</p>`;

async function getCtx() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return null;
    const { data } = await db.rpc("my_context");
    return data;
}

/* ---------- card templates (same classes as the old static cards) ---------- */
const featuredHTML = p => `<article class="market-player-card featured" data-href="${link(p)}">
    <div class="market-player-top"><span>${p.number != null ? "#" + esc(p.number) : ""}</span><strong>${esc(p.position || "—")}</strong></div>
    <div class="market-player-image"><div class="market-player-placeholder">${pad(p.number)}</div></div>
    <div class="market-player-info"><span>${esc(p.team.toUpperCase())}</span><h3>${esc(p.name)}</h3>
        <div class="transfer-status ${p.transfer_status}">${ICON[p.transfer_status]} ${p.transfer_status.toUpperCase()}</div></div>
    <div class="market-player-finance"><div><span>VALUE</span><strong>${M(p.value)}</strong></div><div><span>WAGE</span><strong>${M(p.value / 50)}</strong></div></div>
    <a href="${link(p)}" class="market-player-button">VIEW PLAYER →</a></article>`;

const listingHTML = p => `<article class="transfer-listing" data-href="${link(p)}">
    <div class="listing-player"><div class="listing-avatar">${pad(p.number)}</div><div><strong>${esc(p.name)}</strong><span>${esc(p.position || "—")} · ${esc(p.team)}</span></div></div>
    <div class="listing-status">${ICON[p.transfer_status]} ${p.transfer_status.toUpperCase()}</div>
    <div class="listing-value"><span>VALUE</span><strong>${M(p.value)}</strong></div>
    <div class="listing-price"><span>ASKING PRICE</span><strong>${M(p.listing.asking_price)}</strong></div>
    <a href="${link(p)}" class="listing-button">VIEW →</a></article>`;

const freeHTML = p => `<article class="free-agent-card" data-href="${link(p)}">
    <div class="free-agent-avatar">${pad(p.number)}</div>
    <div class="free-agent-info"><span>${esc(p.position || "—")}</span><h3>${esc(p.name)}</h3><p>Free Agent</p></div>
    <div class="free-agent-label">⚪ FREE AGENT</div>
    <div class="free-agent-value"><span>VALUE</span><strong>${M(p.value)}</strong></div>
    <a href="${link(p)}" class="free-agent-button">VIEW PLAYER →</a></article>`;

const activityHTML = t => `<div class="activity-item"><span class="activity-type">TRANSFER</span>
    <div><strong>${esc(t.player ? t.player.name : "?")}</strong><span>${esc(t.src ? t.src.name : "Free agent")} → ${esc(t.dst ? t.dst.name : "?")}</span></div>
    <strong>${M(t.fee)}</strong></div>`;

/* ---------- market page ---------- */
async function marketPage() {
    const [tm, pl, pt, ls, tr, ctx] = await Promise.all([
        db.from("teams").select("id,name,budget").order("name"),
        db.from("players").select("id,slug,name,number,position,team_id,transfer_status,active"),
        db.from("player_totals").select("player_id,value"),
        db.from("market_listings").select("player_id,asking_price,listed_at").eq("active", true),
        db.from("transfers").select("fee,created_at,player:players(name),src:teams!from_team(name),dst:teams!to_team(name)")
            .order("created_at", { ascending: false }).limit(5),
        getCtx()
    ]);
    if (tm.error || pl.error) { console.error(tm.error || pl.error); return; }

    const teams = tm.data;
    const tName = id => (teams.find(t => t.id === id) || {}).name || "";
    const val = Object.fromEntries((pt.data || []).map(r => [r.player_id, Number(r.value)]));
    const listed = Object.fromEntries((ls.data || []).map(r => [r.player_id, r]));
    const players = pl.data.filter(p => p.active).map(p => ({
        ...p, value: val[p.id] ?? 0, team: tName(p.team_id), listing: listed[p.id] || null
    }));

    const mine = ctx && ctx.team_id ? teams.find(t => t.id === ctx.team_id) : null;
    const nums = $$(".market-overview-card strong");
    if (nums.length >= 4) {
        nums[0].textContent = mine ? M(mine.budget) : "—";
        nums[1].textContent = mine ? players.filter(p => p.team_id === mine.id).length : "—";
        nums[2].textContent = Object.keys(listed).length;
        nums[3].textContent = (tr.data || []).length ? "ACTIVE" : "QUIET";
    }

    const search = $(".market-search input");
    const [posSel, teamSel, sortSel] = $$(".market-controls select");
    teamSel.replaceChildren(...["All Teams", ...teams.map(t => t.name), "Free Agents"].map(n => new Option(n, n)));

    const when = p => new Date((p.listing && p.listing.listed_at) || 0).getTime();
    const ask = p => (p.listing ? Number(p.listing.asking_price) : 0);

    const render = () => {
        const s = search.value.toLowerCase().trim();
        const ok = p => (!s || p.name.toLowerCase().includes(s))
            && (posSel.value === "All Positions" || p.position === posSel.value)
            && (teamSel.value === "All Teams" || (p.team_id ? p.team : "Free Agents") === teamSel.value);
        const sorter = (a, b) => {
            const m = sortSel.value;
            if (m === "Lowest Value") return a.value - b.value;
            if (m === "Highest Asking Price") return ask(b) - ask(a);
            if (m === "Lowest Asking Price") return ask(a) - ask(b);
            if (m === "Newest") return when(b) - when(a);
            return b.value - a.value;
        };
        const onMarket = players.filter(p => p.listing && p.team_id && ok(p)).sort(sorter);
        const free = players.filter(p => !p.team_id && ok(p)).sort(sorter);

        $(".market-featured-grid").innerHTML = onMarket.slice(0, 3).map(featuredHTML).join("") || note("No players are listed yet.");
        $(".transfer-listings").innerHTML = onMarket.map(listingHTML).join("") || note("No listings match.");
        $(".free-agents-grid").innerHTML = free.map(freeHTML).join("") || note("No free agents.");
        $(".market-activity").innerHTML = (tr.data || []).map(activityHTML).join("") || note("No transfers yet.");
    };

    search.addEventListener("input", render);
    [posSel, teamSel, sortSel].forEach(s => s.addEventListener("change", render));
    render();
}

/* ---------- negotiation page ---------- */
async function negotiationPage() {
    const slug = new URLSearchParams(location.search).get("id");
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const input = $("#offer-amount"), btn = $("#submit-offer"), out = $("#negotiation-result"), row = $(".negotiation-input-row");
    const say = (t, bad) => { out.textContent = t; out.style.color = bad ? "var(--bad)" : "var(--text)"; };
    const setup = (msg, button, onclick, showInput) => {
        set("negotiation-message", msg);
        row.style.display = showInput ? "" : "none";
        btn.style.display = button ? "" : "none";
        if (button) { btn.textContent = button; btn.onclick = onclick; }
    };

    const { data: p } = await db.from("players").select("*, team:teams(id,name)").eq("slug", slug || "").maybeSingle();
    if (!p) {
        document.title = "Player Not Found | Neo Egoist League";
        ["number", "position", "team", "status"].forEach(k => set(`negotiation-player-${k}`, "—"));
        ["negotiation-value", "negotiation-asking-price", "negotiation-wage", "negotiation-transfer-fee"].forEach(id => set(id, "—"));
        set("negotiation-player-name", "PLAYER NOT FOUND");
        return setup("The player you are looking for does not exist.", null, null, false);
    }

    const [tot, lst, ctx] = await Promise.all([
        db.from("player_totals").select("value").eq("player_id", p.id).maybeSingle(),
        db.from("market_listings").select("asking_price,active").eq("player_id", p.id).maybeSingle(),
        getCtx()
    ]);
    const value = Number(tot.data ? tot.data.value : p.base_value);
    const listing = lst.data && lst.data.active ? lst.data : null;
    const free = !p.team_id;

    document.title = `Negotiate for ${p.name} | NEL`;
    set("negotiation-player-name", p.name);
    set("negotiation-player-number", p.number != null ? p.number : "—");
    set("negotiation-player-position", p.position || "—");
    set("negotiation-player-team", (p.team ? p.team.name : "Free agent").toUpperCase());
    const st = $("#negotiation-player-status");
    st.className = `transfer-status ${p.transfer_status}`;
    st.textContent = `${ICON[p.transfer_status]} ${p.transfer_status.toUpperCase()}`;
    set("negotiation-value", M(value));
    set("negotiation-asking-price", free ? "FREE" : listing ? M(listing.asking_price) : "NOT LISTED");
    set("negotiation-wage", M(value / 50));
    set("negotiation-transfer-fee", "—");

    if (!ctx) return setup("Log in with Discord to make an offer.", "LOG IN WITH DISCORD →", () => nelLogin(), false);
    if (!ctx.team_id) return setup("Only club Masters can make offers. Ask staff to add you as a Master.", null, null, false);
    if (ctx.team_id === p.team_id) return setup("This is one of your own players. Manage him from your Account page.", null, null, false);
    if (p.transfer_status === "unwilling") return setup("This player is unwilling to transfer.", null, null, false);
    if (!free && !listing) return setup("This player is not on the transfer market.", null, null, false);

    const { data: mine } = await db.from("teams").select("name,budget").eq("id", ctx.team_id).single();
    const budget = `Your budget: ${M(mine.budget)}.`;

    const send = async fee => {
        btn.disabled = true;
        const { error } = await db.rpc("make_offer", { p_player: p.id, p_fee: fee });
        btn.disabled = false;
        if (error) return say(error.message, true);
        set("negotiation-transfer-fee", free ? "FREE" : M(fee));
        say(free ? "Request sent. Staff will approve the signing."
                 : `Offer of ${M(fee)} sent to ${p.team.name}. Follow it on your Account page.`);
    };

    if (free) return setup(`${budget} Free agents cost no transfer fee.`, "SIGN PLAYER →", () => send(0), false);
    setup(`${budget} Enter your offer in millions.`, "SUBMIT OFFER →", () => {
        const fee = Number(input.value);
        if (!fee || fee <= 0) return say("Enter a valid offer.", true);
        send(fee);
    }, true);
}

if ($(".market-page")) marketPage();
if ($(".negotiations-page")) negotiationPage();
})();
