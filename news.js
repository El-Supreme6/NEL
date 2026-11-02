/* NEL news (live): home news cards, news page, article page.
   Needs supabase.js and script.js loaded first. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const day = k => (k ? new Date(k).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase() : "");
const note = t => `<p style="color:var(--muted)">${t}</p>`;
const href = n => `article.html?id=${encodeURIComponent(n.slug)}`;
const COLS = "slug,category,title,intro,featured,published_at";
const published = () => db.from("news").select(COLS).eq("published", true).order("published_at", { ascending: false });

const homeCard = n => `<article class="news-card" data-href="${href(n)}">
    <div class="news-image"><span>${esc(n.category)}</span></div>
    <div class="news-content"><span>${esc(n.category)}</span><h3>${esc(n.title)}</h3><p>${esc(n.intro || "")}</p></div></article>`;

const pageCard = n => `<article class="news-page-card" data-href="${href(n)}">
    <div class="news-page-image"><span>${esc(n.category)}</span></div>
    <div class="news-page-content"><span class="news-category">${esc(n.category)}</span><h3>${esc(n.title)}</h3>
    <p>${esc(n.intro || "")}</p><small>${day(n.published_at)}</small></div></article>`;

const announceCard = n => `<article class="announcement-card" data-href="${href(n)}">
    <div class="announcement-icon">!</div>
    <div class="announcement-content"><span>ANNOUNCEMENT</span><h3>${esc(n.title)}</h3><p>${esc(n.intro || "")}</p></div>
    <small>${day(n.published_at)}</small></article>`;

const reportCard = m => `<article class="match-report-card" data-href="match.html?id=${encodeURIComponent(m.slug)}">
    <span>${esc(m.type)}</span>
    <div class="match-report-teams"><strong>${esc(m.home.name)}</strong><b>${m.home_score}</b></div>
    <div class="match-report-teams"><strong>${esc(m.away.name)}</strong><b>${m.away_score}</b></div>
    <small>${day(m.kickoff)}</small><a href="match.html?id=${encodeURIComponent(m.slug)}">VIEW MATCH →</a></article>`;

async function homeNews() {
    const { data } = await published().limit(2);
    $(".news-grid").innerHTML = (data || []).map(homeCard).join("") || note("No news yet.");
}

async function newsPage() {
    const [nw, mt] = await Promise.all([
        published().limit(60),
        db.from("matches").select("slug,type,kickoff,home_score,away_score,home:teams!home_team(name),away:teams!away_team(name)")
            .eq("status", "finished").order("kickoff", { ascending: false }).limit(4)
    ]);
    const all = nw.data || [];
    const feat = all.find(n => n.featured) || all[0];
    const rest = all.filter(n => n !== feat);

    const fn = $(".featured-news");
    if (feat) {
        $(".featured-news-image span", fn).textContent = "FEATURED";
        $(".news-category", fn).textContent = feat.category;
        $("h2", fn).textContent = feat.title;
        $(".featured-news-content > p", fn).textContent = feat.intro || "";
        $(".featured-news-meta span", fn).textContent = day(feat.published_at);
        $(".featured-news-meta a", fn).href = href(feat);
        fn.dataset.href = href(feat);
    } else {
        $(".news-featured-section").style.display = "none";
    }

    const grid = $(".news-page-grid"), count = $(".news-count");
    let cat = "ALL";
    const draw = () => {
        const list = rest.filter(n => cat === "ALL" || n.category === cat);
        grid.innerHTML = list.map(pageCard).join("") || note("No stories in this category yet.");
        if (count) count.textContent = `${list.length} ARTICLE${list.length === 1 ? "" : "S"}`;
    };
    // replace the buttons with clean copies so the old placeholder filter code is switched off
    $$(".news-filter").forEach(b => b.replaceWith(b.cloneNode(true)));
    $$(".news-filter").forEach(b => b.addEventListener("click", () => {
        $$(".news-filter").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        cat = b.textContent.trim().toUpperCase();
        draw();
    }));
    draw();

    const ann = all.filter(n => n.category === "ANNOUNCEMENT").slice(0, 3);
    $(".announcement-list").innerHTML = ann.map(announceCard).join("") || note("No announcements yet.");
    $(".match-report-grid").innerHTML = (mt.data || []).map(reportCard).join("") || note("No finished matches yet.");
}

async function articlePage() {
    const slug = new URLSearchParams(location.search).get("id");
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const { data: n } = await db.from("news").select("*").eq("slug", slug || "").maybeSingle();

    if (!n) {
        document.title = "Article Not Found | Neo Egoist League";
        set("article-category", "NEWS"); set("article-title", "Article Not Found"); set("article-date", "");
        set("article-image-label", "NEWS"); set("article-intro", "The article you are looking for does not exist.");
        $("#article-body").innerHTML = "<p>Please return to the News page and choose another article.</p>";
        return;
    }
    document.title = `${n.title} | NEL`;
    set("article-category", n.category); set("article-title", n.title); set("article-date", day(n.published_at));
    set("article-image-label", n.category); set("article-intro", n.intro || "");
    // body is plain text: a blank line starts a new paragraph. Always escaped, never raw HTML.
    $("#article-body").innerHTML = (n.body || "").split(/\n\s*\n/)
        .map(p => p.trim()).filter(Boolean)
        .map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
}

if ($(".news-grid")) homeNews();
if ($(".news-page-grid")) newsPage();
if ($(".article-page")) articlePage();
})();
