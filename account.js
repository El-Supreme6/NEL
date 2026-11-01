/* NEL account page: players set their status, Masters manage listings and offers.
   The page only shows buttons; the database functions enforce every rule. */
(() => {
const app = document.getElementById("account-app");
const h = (tag, props = {}, ...kids) => {
    const el = Object.assign(document.createElement(tag), props);
    kids.flat().forEach(k => k != null && el.append(k));
    return el;
};
const M = v => `${+Number(v).toFixed(2)}M`;
let ctx = null, msgEl, body;

const say = (text, bad) => {
    msgEl.textContent = text;
    msgEl.className = "adm-msg" + (bad ? " bad" : "");
    msgEl.hidden = !text;
};

async function run(fn, args, ok) {
    const { error } = await db.rpc(fn, args);
    if (error) return say(error.message, true);
    say(ok || "Done.");
    build();
}

/* ---------- player ---------- */
async function playerSection() {
    const { data: p } = await db.from("players").select("name,transfer_status").eq("id", ctx.player_id).single();
    const buttons = ["willing", "unsure", "unwilling"].map(s => h("button", {
        className: s === p.transfer_status ? "primary-button" : "secondary-button",
        textContent: s.toUpperCase(),
        onclick: () => run("set_my_transfer_status", { p_status: s }, `Your status is now ${s}.`)
    }));
    return h("div", { className: "adm-form" },
        h("h2", { textContent: "MY TRANSFER STATUS" }),
        h("p", { textContent: `${p.name}: are you open to a transfer? Unwilling removes you from the market.` }),
        h("div", { className: "adm-actions", style: "flex-wrap:wrap" }, buttons));
}

/* ---------- master ---------- */
async function masterSections() {
    const [tm, pl, pt, ls, of] = await Promise.all([
        db.from("teams").select("name,budget").eq("id", ctx.team_id).single(),
        db.from("players").select("id,name,position,transfer_status").eq("team_id", ctx.team_id).eq("active", true).order("name"),
        db.from("player_totals").select("player_id,value").eq("team_id", ctx.team_id),
        db.from("market_listings").select("player_id,asking_price").eq("active", true),
        db.from("offers").select("*, player:players(name), buyer:teams!buyer_team(name), seller:teams!seller_team(name)")
            .order("updated_at", { ascending: false }).limit(40)
    ]);
    const val = Object.fromEntries((pt.data || []).map(r => [r.player_id, Number(r.value)]));
    const listed = Object.fromEntries((ls.data || []).map(r => [r.player_id, Number(r.asking_price)]));

    const club = h("div", { className: "adm-form" },
        h("h2", { textContent: tm.data.name }),
        h("p", { textContent: `Club budget: ${M(tm.data.budget)}` }));

    const players = h("div", { className: "adm-list" }, h("h2", { textContent: "MY PLAYERS" }));
    if (!pl.data.length) players.append(h("p", { textContent: "No players in your club yet." }));
    pl.data.forEach(p => {
        const price = h("input", { type: "number", min: "0", step: "any", style: "width:96px", value: listed[p.id] ?? (val[p.id] || 0) });
        const isListed = p.id in listed;
        players.append(h("div", { className: "adm-row" },
            h("div", {}, h("strong", { textContent: p.name }), h("br"),
                h("small", { textContent: `${p.position || "—"} · value ${M(val[p.id] || 0)} · ${p.transfer_status}${isListed ? " · LISTED " + M(listed[p.id]) : ""}` })),
            h("div", { className: "adm-actions", style: "flex-wrap:wrap" },
                price,
                h("button", { className: "secondary-button", textContent: isListed ? "Update" : "List",
                    onclick: () => run("list_player", { p_player: p.id, p_price: Number(price.value) }, `${p.name} listed at ${M(price.value)}.`) }),
                isListed ? h("button", { className: "reject-button", textContent: "Unlist",
                    onclick: () => run("unlist_player", { p_player: p.id }, `${p.name} removed from the market.`) }) : null)));
    });

    const all = of.data || [];
    const live = all.filter(o => o.status === "open" || o.status === "accepted");
    const past = all.filter(o => o.status !== "open" && o.status !== "accepted").slice(0, 8);
    const offers = h("div", { className: "adm-list" }, h("h2", { textContent: "OFFERS" }));
    if (!live.length) offers.append(h("p", { textContent: "No active offers." }));
    live.forEach(o => offers.append(offerRow(o)));
    if (past.length) {
        offers.append(h("h3", { textContent: "RECENT", style: "margin:22px 0 4px" }));
        past.forEach(o => offers.append(offerRow(o)));
    }
    return [club, players, offers];
}

function offerRow(o) {
    const side = o.buyer_team === ctx.team_id ? "buyer" : "seller";
    const state = o.status === "accepted" ? "ACCEPTED, WAITING FOR STAFF APPROVAL"
        : o.status === "open" ? (o.turn === side ? "YOUR TURN" : "WAITING FOR THE OTHER CLUB")
        : o.status.toUpperCase();
    const actions = h("div", { className: "adm-actions", style: "flex-wrap:wrap" });
    const act = (action, label, cls, extra) => actions.append(h("button", { className: cls, textContent: label,
        onclick: () => run("respond_offer", { p_offer: o.id, p_action: action, ...(extra ? extra() : {}) }, "Done.") }));

    if (o.status === "open" && o.turn === side) {
        const counter = h("input", { type: "number", min: "0", step: "any", style: "width:90px", placeholder: "counter" });
        act("accept", "Accept", "primary-button");
        act("reject", "Reject", "reject-button");
        actions.append(counter);
        act("counter", "Counter", "secondary-button", () => ({ p_fee: Number(counter.value) }));
    }
    if (side === "buyer" && (o.status === "open" || o.status === "accepted")) act("withdraw", "Withdraw", "reject-button");

    return h("div", { className: "adm-row" },
        h("div", {},
            h("strong", { textContent: `${o.player ? o.player.name : "?"}: ${o.buyer ? o.buyer.name : "?"} ← ${o.seller ? o.seller.name : "Free agent"}` }),
            h("br"), h("small", { textContent: `${M(o.fee)} · ${state}` })),
        actions);
}

/* ---------- page ---------- */
async function build() {
    const parts = [];
    if (ctx.player_id) parts.push(await playerSection());
    if (ctx.team_id) parts.push(...await masterSections());
    if (!ctx.player_id && !ctx.team_id) parts.push(h("div", { className: "adm-form" },
        h("p", { textContent: "You are signed in. To play, ask staff to link your Discord ID to your player profile or make you a club Master." })));
    body.replaceChildren(...parts.map(x => h("div", { style: "margin-bottom:24px" }, x)));
}

function loginView() {
    app.replaceChildren(h("div", { className: "adm-form" },
        h("p", { textContent: "Sign in with Discord to manage your player or your club." }),
        h("button", { className: "primary-button", textContent: "Log in with Discord", onclick: () => nelLogin() })));
}

async function boot() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return loginView();
    await db.rpc("ensure_profile");
    const { data, error } = await db.rpc("my_context");
    if (error) return app.replaceChildren(h("div", { className: "adm-form" }, h("p", { textContent: "Could not load your account: " + error.message })));
    ctx = data;

    const m = session.user.user_metadata || {};
    const roles = [ctx.staff_role && ctx.staff_role.toUpperCase(), ctx.team_id && "MASTER", ctx.player_id && "PLAYER"].filter(Boolean).join(" · ");
    msgEl = h("div", { className: "adm-msg", hidden: true });
    body = h("div");
    app.replaceChildren(
        h("div", { className: "adm-bar" },
            h("div", { className: "adm-who" },
                m.avatar_url ? h("img", { src: m.avatar_url, alt: "" }) : null,
                h("div", {}, h("strong", { textContent: m.full_name || m.name || "Signed in" }), h("br"),
                    h("small", { textContent: roles || "FAN" }))),
            h("div", { className: "adm-actions" },
                ctx.staff_role ? h("a", { className: "secondary-button", href: "admin.html", textContent: "Staff panel" }) : null,
                h("button", { className: "reject-button", textContent: "Log out", onclick: () => db.auth.signOut() }))),
        msgEl, body);
    build();
}

db.auth.onAuthStateChange(event => {
    if (event === "SIGNED_OUT") setTimeout(boot, 0);
});
boot();
})();
