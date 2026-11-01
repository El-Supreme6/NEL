const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* =========================
   MOBILE NAVIGATION
========================= */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    navLinks.id = navLinks.id || "nav-links";
    menuToggle.setAttribute("aria-controls", navLinks.id);
    menuToggle.setAttribute("aria-expanded", "false");
    
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
    
}


/* =========================
   MATCH DATA
========================= */

const matches = {

    /* =====================
       UPCOMING
    ===================== */

    "steelen-livergen": {
        home: "Steelen München",
        away: "Livergen",

        homeLogo: "images/steelen-munchen.png",
        awayLogo: "images/livergen.png",

        status: "UPCOMING",
        type: "FRIENDLY",

        date: "27 AUG",
        time: "8:00 PM",
        venue: "TBD",
        kickoff: "2026-11-05T20:00:00+03:00",
    home: "Steelen München",

        description:
            "Steelen München face Livergen in an upcoming NEL friendly.",

        lineups:
            "Lineups will be announced before the match."
            
            
            
    },
    
    


    "alpha-gamma": {
        home: "Team Alpha",
        away: "Team Gamma",

        homeLogo: "",
        awayLogo: "",

        status: "UPCOMING",
        type: "FRIENDLY",

        date: "22 AUG",
        time: "8:00 PM",
        venue: "TBD",

        description:
            "Team Alpha face Team Gamma in an upcoming NEL friendly.",

        lineups:
            "Lineups will be announced before the match."
    },


    "delta-beta": {
        home: "Team Delta",
        away: "Team Beta",

        homeLogo: "",
        awayLogo: "",

        status: "UPCOMING",
        type: "FRIENDLY",

        date: "23 AUG",
        time: "7:30 PM",
        venue: "TBD",

        description:
            "Team Delta face Team Beta in an upcoming NEL friendly.",

        lineups:
            "Lineups will be announced before the match."
    },


    "gamma-beta": {
        home: "Team Gamma",
        away: "Team Beta",

        homeLogo: "",
        awayLogo: "",

        status: "UPCOMING",
        type: "FRIENDLY",

        date: "24 AUG",
        time: "9:00 PM",
        venue: "TBD",

        description:
            "Team Gamma face Team Beta in an upcoming NEL friendly.",

        lineups:
            "Lineups will be announced before the match."
    },


    /* =====================
       RESULTS
    ===================== */

    "alpha-beta-result": {
        home: "Team Alpha",
        away: "Team Beta",

        homeLogo: "",
        awayLogo: "",

        status: "FINISHED",
        type: "FRIENDLY",

        date: "21 AUG",
        time: "—",
        venue: "TBD",

        score: "4 - 2",

        description:
            "Team Alpha defeated Team Beta 4-2 in an NEL friendly.",

        lineups:
            "Lineups are no longer available."
    },


    "gamma-delta-result": {
        home: "Team Gamma",
        away: "Team Delta",

        homeLogo: "",
        awayLogo: "",

        status: "FINISHED",
        type: "FRIENDLY",

        date: "20 AUG",
        time: "—",
        venue: "TBD",

        score: "3 - 1",

        description:
            "Team Gamma defeated Team Delta 3-1 in an NEL friendly.",

        lineups:
            "Lineups are no longer available."
    },


    "beta-delta-result": {
        home: "Team Beta",
        away: "Team Delta",

        homeLogo: "",
        awayLogo: "",

        status: "FINISHED",
        type: "FRIENDLY",

        date: "19 AUG",
        time: "—",
        venue: "TBD",

        score: "2 - 2",

        description:
            "Team Beta and Team Delta drew 2-2 in an NEL friendly.",

        lineups:
            "Lineups are no longer available."
    }

};



/* =========================
   HOMEPAGE FEATURED COUNTDOWN
========================= */

const countdownElement = document.querySelector("#featured-countdown");

if (countdownElement) {
    const card = countdownElement.closest("[data-match]");
    const featured = card ? matches[card.dataset.match] : null;
    const matchTime = featured && featured.kickoff ?
        new Date(featured.kickoff).getTime() : NaN;
    let timer;
    
    function updateCountdown() {
        const diff = matchTime - Date.now();
        
        if (Number.isNaN(diff)) {
            countdownElement.textContent = "DATE TBA";
            return;
        }
        if (diff <= 0) {
            countdownElement.textContent =
                featured.status === "FINISHED" ? "FULL TIME" : "MATCH STARTED";
            clearInterval(timer);
            return;
        }
        
        const d = Math.floor(diff / 86400000);
        const h = Math.floor(diff / 3600000) % 24;
        const m = Math.floor(diff / 60000) % 60;
        const s = Math.floor(diff / 1000) % 60;
        
        countdownElement.textContent =
            d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
    }
    
    updateCountdown();
    if (matchTime > Date.now()) timer = setInterval(updateCountdown, 1000);
}


/* =========================
   MATCH PAGE
========================= */

const matchPage =
    document.querySelector(".match-page");


if (matchPage) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const matchId =
        params.get("id");


    const match =
        matches[matchId];


    /* =====================
       MATCH NOT FOUND
    ===================== */

    if (!match) {

        document.title =
            "Match Not Found | Neo Egoist League";


        document.querySelector("#match-status").textContent =
            "MATCH NOT FOUND";


        document.querySelector("#match-type").textContent =
            "NEL";


        document.querySelector("#home-team-name").textContent =
            "Unknown Match";


        document.querySelector("#away-team-name").textContent =
            "";


        document.querySelector("#match-score").textContent =
            "—";


        document.querySelector("#match-date").textContent =
            "";


        document.querySelector("#match-description").textContent =
            "The match you are looking for does not exist or the link is invalid.";

    } else {

        /* =====================
           PAGE TITLE
        ===================== */

        document.title =
            `${match.home} vs ${match.away} | NEL`;


        /* =====================
           HERO
        ===================== */

        document.querySelector("#match-status").textContent =
            match.status;


        document.querySelector("#match-type").textContent =
            match.type;


        document.querySelector("#home-team-name").textContent =
            match.home;


        document.querySelector("#away-team-name").textContent =
            match.away;


        document.querySelector("#match-score").textContent =
            match.score || "VS";


        document.querySelector("#match-date").textContent =
            match.time === "—"
                ? match.date
                : `${match.date} · ${match.time}`;


        /* =====================
           TEAM LOGOS
        ===================== */

        const homeLogo =
            document.querySelector("#home-team-logo");


        const awayLogo =
            document.querySelector("#away-team-logo");


        if (match.homeLogo) {

            homeLogo.src =
                match.homeLogo;

            homeLogo.alt =
                match.home;

            homeLogo.style.display =
                "block";

        } else {

            homeLogo.style.display =
                "none";

        }


        if (match.awayLogo) {

            awayLogo.src =
                match.awayLogo;

            awayLogo.alt =
                match.away;

            awayLogo.style.display =
                "block";

        } else {

            awayLogo.style.display =
                "none";

        }


        /* =====================
           MATCH DETAILS
        ===================== */

        document.querySelector("#detail-date").textContent =
            match.date;


        document.querySelector("#detail-time").textContent =
            match.time;


        document.querySelector("#detail-competition").textContent =
            match.type;


        document.querySelector("#detail-venue").textContent =
            match.venue;


        /* =====================
           MATCH INFORMATION
        ===================== */

        document.querySelector("#match-description").textContent =
            match.description;


        /* =====================
           LINEUPS
        ===================== */

        document.querySelector("#lineups-message").textContent =
            match.lineups;


        /* =====================
           MATCH STATS
        ===================== */

        document.querySelector("#stat-possession").textContent =
            "—";


        document.querySelector("#stat-shots").textContent =
            "—";


        document.querySelector("#stat-target").textContent =
            "—";


        document.querySelector("#stat-corners").textContent =
            "—";


        /* =====================
           MATCH EVENTS
        ===================== */

        document.querySelector("#events-message").textContent =
            match.status === "FINISHED"
                ? "Match events will appear here."
                : "Match events will appear here once the match begins.";

    }

}
/* =========================
   HOMEPAGE CARD NAVIGATION
========================= */

document.querySelectorAll("[data-match]").forEach(card => {

    card.addEventListener("click", function (event) {

        // Let buttons/links handle themselves
        if (event.target.closest("a, button")) {
            return;
        }

        const matchId = this.dataset.match;

        if (!matchId) {
            return;
        }

        // Every homepage card now jumps
        // to its exact matching card on matches.html
        window.location.href = `matches.html#${matchId}`;

    });

});


/* =========================
   MATCH CATEGORY SCROLL
========================= */

if (window.location.hash) {

    const targetId = window.location.hash.substring(1);
    const target = document.getElementById(targetId);

    if (target) {

        setTimeout(() => {

            const offset = 120;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                offset;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        }, 150);

    }

}
/* =========================
   NEWS ARTICLE DATA
========================= */

const articles = {

    "steelen-munchen-start-strong": {
        category: "MATCHDAY",
        title: "Steelen München start strong",
        date: "AUG 25, 2026",
        imageLabel: "MATCHDAY",

        intro:
            "Steelen München made a strong start as they secured an impressive victory in their opening NEL friendly.",

        body: `
            <p>
                Steelen München opened their NEL campaign with a strong
                performance against Livergen.
            </p>

            <p>
                The match finished 9-6, giving Steelen München an early
                victory and plenty of momentum heading into their next
                fixtures.
            </p>

            <p>
                The team showed strong attacking play throughout the match
                and managed to hold on to their advantage when Livergen
                attempted to fight back.
            </p>
        `
    },


    "steelen-munchen-claim-victory": {
        category: "MATCHDAY",
        title: "Steelen München claim victory",
        date: "AUG 25, 2026",
        imageLabel: "MATCHDAY",

        intro:
            "A strong opening performance puts Steelen München on the board.",

        body: `
            <p>
                Steelen München claimed an important victory in their latest
                NEL friendly.
            </p>

            <p>
                The team looked confident throughout the match and continued
                to push forward until the final whistle.
            </p>
        `
    },


    "next-nel-matchday": {
        category: "ANNOUNCEMENT",
        title: "The next NEL matchday is here",
        date: "AUG 24, 2026",
        imageLabel: "ANNOUNCEMENT",

        intro:
            "The next round of NEL fixtures is ready to begin.",

        body: `
            <p>
                The Neo Egoist League is preparing for another round of
                competitive matches.
            </p>

            <p>
                Teams will be looking to secure victories and build momentum
                as the league continues.
            </p>
        `
    },


    "transfer-market-opens": {
        category: "TRANSFERS",
        title: "Transfer market opens",
        date: "AUG 23, 2026",
        imageLabel: "TRANSFERS",

        intro:
            "Clubs can now begin negotiations and build their squads.",

        body: `
            <p>
                The NEL transfer market is officially open.
            </p>

            <p>
                Clubs can now begin making offers, negotiating transfers and
                strengthening their squads.
            </p>
        `
    },


    "nel-season-preparations": {
        category: "LEAGUE",
        title: "NEL season preparations begin",
        date: "AUG 22, 2026",
        imageLabel: "LEAGUE",

        intro:
            "Teams prepare for another season of competition and ego.",

        body: `
            <p>
                Preparations for the upcoming NEL season are underway.
            </p>

            <p>
                Teams are getting ready for another competitive season as
                clubs look to prove themselves against the rest of the league.
            </p>
        `
    },


    "new-rivalry-begins": {
        category: "MATCHDAY",
        title: "A new rivalry begins",
        date: "AUG 21, 2026",
        imageLabel: "MATCHDAY",

        intro:
            "Two ambitious teams prepare to face each other for the first time.",

        body: `
            <p>
                A new rivalry is beginning in the Neo Egoist League.
            </p>

            <p>
                Both teams will be looking to make a statement when they meet
                on the pitch.
            </p>
        `
    },


    "welcome-to-nel": {
        category: "OTHER",
        title: "Welcome to the Neo Egoist League",
        date: "AUG 20, 2026",
        imageLabel: "OTHER",

        intro:
            "Everything you need to know about the league and its competitive system.",

        body: `
            <p>
                Welcome to the Neo Egoist League.
            </p>

            <p>
                NEL is built around competition, ambition and the desire to
                become the best.
            </p>
        `
    },


    "steelen-livergen-match-report": {
        category: "MATCHDAY",
        title: "Steelen München 9-6 Livergen",
        date: "AUG 25, 2026",
        imageLabel: "MATCH REPORT",

        intro:
            "Steelen München defeated Livergen 9-6 in an action-packed NEL friendly.",

        body: `
            <p>
                Steelen München and Livergen met in a high-scoring friendly
                that ended with a 9-6 victory for Steelen München.
            </p>

            <p>
                Both teams managed to find the back of the net repeatedly,
                but Steelen München ultimately maintained the advantage.
            </p>

            <p>
                The result gives Steelen München a strong start and plenty
                of confidence for their upcoming matches.
            </p>
        `
    },


    "alpha-beta-match-report": {
        category: "MATCHDAY",
        title: "Team Alpha 4-2 Team Beta",
        date: "AUG 24, 2026",
        imageLabel: "MATCH REPORT",

        intro:
            "Team Alpha secured a 4-2 victory over Team Beta.",

        body: `
            <p>
                Team Alpha came away with a convincing 4-2 victory against
                Team Beta.
            </p>

            <p>
                Alpha controlled the match well and held on to their lead
                through the final stages.
            </p>
        `
    }

};
/* =========================
   NEWS CARD NAVIGATION
========================= */

document.querySelectorAll("[data-news]").forEach(card => {

    card.addEventListener("click", function (event) {

        // Ignore buttons/links inside the card
        if (event.target.closest("a, button")) {
            return;
        }

        const newsId = this.dataset.news;

        if (!newsId) {
            return;
        }

        window.location.href =
            `article.html?id=${newsId}`;

    });

});
/* =========================
   ARTICLE PAGE
========================= */

const articlePage = document.querySelector(".article-page");

if (articlePage) {
    
    const params =
        new URLSearchParams(window.location.search);
    
    const articleId =
        params.get("id");
    
    const article =
        articles[articleId];
    
    
    /* =====================
       ARTICLE NOT FOUND
    ===================== */
    
    if (!article) {
        
        document.title =
            "Article Not Found | Neo Egoist League";
        
        document.querySelector("#article-category").textContent =
            "NEWS";
        
        document.querySelector("#article-title").textContent =
            "Article Not Found";
        
        document.querySelector("#article-date").textContent =
            "";
        
        document.querySelector("#article-image-label").textContent =
            "NEWS";
        
        document.querySelector("#article-intro").textContent =
            "The article you are looking for does not exist.";
        
        document.querySelector("#article-body").innerHTML =
            "<p>Please return to the News page and choose another article.</p>";
        
    } else {
        
        /* =====================
           LOAD ARTICLE
        ===================== */
        
        document.title =
            `${article.title} | NEL`;
        
        document.querySelector("#article-category").textContent =
            article.category;
        
        document.querySelector("#article-title").textContent =
            article.title;
        
        document.querySelector("#article-date").textContent =
            article.date;
        
        document.querySelector("#article-image-label").textContent =
            article.imageLabel;
        
        document.querySelector("#article-intro").textContent =
            article.intro;
        
        document.querySelector("#article-body").innerHTML =
            article.body;
        
    }
    
}
/* =========================
   MATCHES PAGE
========================= */

const matchesPage = document.querySelector(".matches-page");

if (matchesPage) {

    /* =====================
       MATCH FILTERS
    ===================== */

    const filterButtons =
        document.querySelectorAll(".filter-button");

    const featuredSection =
        document.querySelector(
            ".featured-matches-grid"
        )?.closest(".matches-section");

    const upcomingSection =
        document.querySelector("#upcoming-matches");

    const resultsSection =
        document.querySelector("#recent-results");


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter =
                button.textContent.trim().toUpperCase();


            /* =====================
               ACTIVE BUTTON
            ===================== */

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");


            /* =====================
               SHOW EVERYTHING
            ===================== */

            if (filter === "ALL") {

                if (featuredSection) {
                    featuredSection.style.display = "";
                }

                if (upcomingSection) {
                    upcomingSection.style.display = "";
                }

                if (resultsSection) {
                    resultsSection.style.display = "";
                }

                return;
            }


            /* =====================
               FEATURED
            ===================== */

            if (filter === "FEATURED") {

                if (featuredSection) {
                    featuredSection.style.display = "";
                }

                if (upcomingSection) {
                    upcomingSection.style.display = "none";
                }

                if (resultsSection) {
                    resultsSection.style.display = "none";
                }

                return;
            }


            /* =====================
               UPCOMING
            ===================== */

            if (filter === "UPCOMING") {

                if (featuredSection) {
                    featuredSection.style.display = "none";
                }

                if (upcomingSection) {
                    upcomingSection.style.display = "";
                }

                if (resultsSection) {
                    resultsSection.style.display = "none";
                }

                return;
            }


            /* =====================
               RESULTS
            ===================== */

            if (filter === "RESULTS") {

                if (featuredSection) {
                    featuredSection.style.display = "none";
                }

                if (upcomingSection) {
                    upcomingSection.style.display = "none";
                }

                if (resultsSection) {
                    resultsSection.style.display = "";
                }

            }

        });

    });


    /* =========================
       MATCH BUTTONS
    ========================= */

    const matchLinks = {

        "steelen-livergen":
            "match.html?id=steelen-livergen",

        "alpha-gamma":
            "match.html?id=alpha-gamma",

        "delta-beta":
            "match.html?id=delta-beta",

        "gamma-beta":
            "match.html?id=gamma-beta",

        "alpha-beta-result":
            "match.html?id=alpha-beta-result",

        "gamma-delta-result":
            "match.html?id=gamma-delta-result",

        "beta-delta-result":
            "match.html?id=beta-delta-result"

    };


    /* =========================
       UPCOMING + FEATURED BUTTONS
    ========================= */

    Object.keys(matchLinks).forEach(matchId => {

        const card =
            document.getElementById(matchId);

        if (!card) {
            return;
        }


        const button =
            card.querySelector("a");


        if (!button) {
            return;
        }


        button.href =
            matchLinks[matchId];

    });


    /* =========================
       RESULT CARD CLICK
    ========================= */

    document
        .querySelectorAll(".match-result-card")
        .forEach(card => {

            card.addEventListener("click", event => {

                if (
                    event.target.closest("a, button")
                ) {
                    return;
                }


                const matchId =
                    card.id;


                if (
                    matchId &&
                    matchLinks[matchId]
                ) {

                    window.location.href =
                        matchLinks[matchId];

                }

            });

        });

}

/* =========================
   STANDINGS PAGE
========================= */


const standingsBody = document.querySelector("#standings-body");

async function loadStandings() {
    const { data, error } = await db.from("standings").select("*");

    if (error || !data) {
        console.error(error);
        standingsBody.innerHTML =
            `<tr><td colspan="8" class="standings-loading">Could not load standings: ${esc(error && error.message)}</td></tr>`;
        return;
    }

    const teams = data.map(t => ({
        ...t, points: Number(t.points), gd: Number(t.gd), gf: Number(t.gf)
    }));

    teams.sort((a, b) =>
        b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));

    standingsBody.innerHTML = "";

    teams.forEach((team, i) => {
        const row = document.createElement("tr");
        if (i < 3) row.classList.add("top-position");

        const gd = team.gd > 0 ? `+${team.gd}` : team.gd;
        const logo = team.logo_url
            ? `<img src="${esc(team.logo_url)}" alt="${esc(team.name)}">`
            : `<div class="team-placeholder">${esc(team.name.charAt(0))}</div>`;

        row.innerHTML = `
            <td class="position">${i + 1}</td>
            <td><div class="team-cell">${logo}<strong>${esc(team.name)}</strong></div></td>
            <td>${team.played}</td><td>${team.wins}</td><td>${team.draws}</td><td>${team.losses}</td>
            <td>${gd}</td><td class="points">${team.points}</td>`;

        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
            window.location.href = `team.html?id=${encodeURIComponent(team.slug)}`;
        });

        standingsBody.appendChild(row);
    });
}

if (standingsBody) loadStandings();


/* =========================
   TEAMS PAGE (live)
========================= */

const teamsGrid = document.querySelector(".teams-grid");

async function loadTeams() {
    const { data, error } = await db.from("teams")
        .select("slug,name,logo_url,description").order("name");

    if (error || !data) { console.error(error); return; }

    teamsGrid.innerHTML = data.map((t, i) => `
        <article class="team-card">
            <div class="team-card-top">
                <span class="team-number">${String(i + 1).padStart(2, "0")}</span>
                <span class="team-status">ACTIVE</span>
            </div>
            <div class="team-logo-container">
                <img src="${esc(t.logo_url)}" alt="${esc(t.name)}">
            </div>
            <div class="team-card-content">
                <span class="team-label">CLUB</span>
                <h3>${esc(t.name)}</h3>
                <p>${esc(t.description)}</p>
            </div>
            <a href="team.html?id=${encodeURIComponent(t.slug)}" class="team-card-button">VIEW TEAM →</a>
        </article>`).join("");
}

if (teamsGrid) {
    loadTeams();
    teamsGrid.addEventListener("click", e => {
        const card = e.target.closest(".team-card");
        if (!card || e.target.closest("a")) return;
        window.location.href = card.querySelector("a").href;
    });
}


/* =========================
   TEAM PROFILE PAGE (live)
========================= */

const teamNameEl = document.getElementById("team-name");

async function loadTeam() {
    const slug = new URLSearchParams(window.location.search).get("id");
    const setText = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.textContent = v;
    };

    const { data: team } = await db.from("teams").select("*").eq("slug", slug || "").maybeSingle();

    if (!team) {
        document.title = "Team Not Found | Neo Egoist League";
        setText("team-name", "Team Not Found");
        setText("team-description", "The team you are looking for does not exist.");
        return;
    }

    document.title = `${team.name} | Neo Egoist League`;
    setText("team-name", team.name);
    setText("team-description", team.description || "");

    const logo = document.getElementById("team-logo");
    if (logo) {
        if (team.logo_url) {
            logo.src = team.logo_url;
            logo.alt = `${team.name} logo`;
            logo.style.display = "block";
        } else {
            logo.style.display = "none";
        }
    }

    const [standingsRes, playersRes, matchesRes] = await Promise.all([
        db.from("standings").select("*"),
        db.from("player_totals").select("value").eq("team_id", team.id),
        db.from("matches").select("home_team,away_team,home_score,away_score")
            .eq("status", "finished")
            .or(`home_team.eq.${team.id},away_team.eq.${team.id}`)
            .order("kickoff", { ascending: false }).limit(5)
    ]);

    const table = (standingsRes.data || [])
        .map(t => ({ ...t, points: Number(t.points), gd: Number(t.gd), gf: Number(t.gf) }))
        .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
    const idx = table.findIndex(t => t.team_id === team.id);

    setText("team-position", idx >= 0 ? `#${idx + 1}` : "—");
    setText("team-points", idx >= 0 ? table[idx].points : "0");

    const value = (playersRes.data || []).reduce((sum, p) => sum + Number(p.value), 0);
    setText("team-value", `${value.toFixed(1)}M`);

    const form = (matchesRes.data || []).map(m => {
        const mine = m.home_team === team.id ? m.home_score : m.away_score;
        const theirs = m.home_team === team.id ? m.away_score : m.home_score;
        return mine > theirs ? "W" : mine < theirs ? "L" : "D";
    }).join(" ");
    setText("team-form", form || "—");
}

if (teamNameEl) loadTeam();


/* =========================
   MATCHES PAGE
========================= */

if (document.querySelector(".matches-page")) {
    
    const matchCards = [
        "steelen-livergen",
        "alpha-gamma",
        "delta-beta",
        "gamma-beta"
    ];
    
    matchCards.forEach(matchId => {
        
        const card =
            document.getElementById(matchId);
        
        if (!card) {
            return;
        }
        
        card.addEventListener("click", event => {
            
            /* Keep existing buttons/links working normally */
            if (event.target.closest("a, button")) {
                return;
            }
            
            window.location.href =
                `match.html?id=${matchId}`;
            
        });
        
    });
    
}

/* =========================
   PLAYER CARD NAVIGATION
========================= */

if (document.querySelector(".players-page")) {
    
    document
        .querySelectorAll(".player-card")
        .forEach(card => {
            
            const profileLink =
                card.querySelector(".player-card-button");
            
            if (!profileLink) {
                return;
            }
            
            const playerLink =
                profileLink.getAttribute("href");
            
            if (!playerLink) {
                return;
            }
            
            card.style.cursor = "pointer";
            
            card.addEventListener("click", event => {
                
                /*
                 * If the button itself was clicked,
                 * let the normal link handle it.
                 */
                if (event.target.closest("a, button")) {
                    return;
                }
                
                window.location.href =
                    playerLink;
                
            });
            
        });
    
}
/* =========================
   PLAYER PROFILE PAGE
========================= */

const playerPage = null;

if (playerPage) {
    
    const params = new URLSearchParams(window.location.search);
const playerId = params.get("id");

    /* =========================
       PLAYER DATABASE
    ========================= */

    const players = {

        "player-alpha": {
            name: "Player Alpha",
            number: "#1",
            position: "GK",
            team: "Steelen München",
            status: "ACTIVE",
            goals: 0,
            assists: 2,
            contributions: 2,
            appearances: 12,
            
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-beta": {
            name: "Player Beta",
            number: "#22",
            position: "GK",
            team: "Livergen",
            status: "ACTIVE",
            goals: 0,
            assists: 4,
            contributions: 4,
            appearances: 11,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-gamma": {
            name: "Player Gamma",
            number: "#4",
            position: "CB",
            team: "Bastard München",
            status: "ACTIVE",
            goals: 2,
            assists: 1,
            contributions: 3,
            appearances: 10,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-delta": {
            name: "Player Delta",
            number: "#5",
            position: "CB",
            team: "FC Barcha",
            status: "ACTIVE",
            goals: 1,
            assists: 3,
            contributions: 4,
            appearances: 13,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-epsilon": {
            name: "Player Epsilon",
            number: "#3",
            position: "LB",
            team: "FC ROYALE",
            status: "ACTIVE",
            goals: 3,
            assists: 6,
            contributions: 9,
            appearances: 14,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-zeta": {
            name: "Player Zeta",
            number: "#2",
            position: "RB",
            team: "Newshine United",
            status: "ACTIVE",
            goals: 4,
            assists: 7,
            contributions: 11,
            appearances: 15,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-eta": {
            name: "Player Eta",
            number: "#6",
            position: "CDM",
            team: "Paris X Gen",
            status: "ACTIVE",
            goals: 5,
            assists: 4,
            contributions: 9,
            appearances: 14,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-theta": {
            name: "Player Theta",
            number: "#14",
            position: "CDM",
            team: "RPB",
            status: "ACTIVE",
            goals: 4,
            assists: 8,
            contributions: 12,
            appearances: 16,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-iota": {
            name: "Player Iota",
            number: "#8",
            position: "CM",
            team: "Tonderia Vitoria Bola FC",
            status: "ACTIVE",
            goals: 8,
            assists: 11,
            contributions: 19,
            appearances: 17,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-kappa": {
            name: "Player Kappa",
            number: "#16",
            position: "CM",
            team: "Arsenaly",
            status: "ACTIVE",
            goals: 6,
            assists: 9,
            contributions: 15,
            appearances: 16,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-lambda": {
            name: "Player Lambda",
            number: "#10",
            position: "CAM",
            team: "Steelen München",
            status: "ACTIVE",
            goals: 13,
            assists: 12,
            contributions: 25,
            appearances: 18,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-mu": {
            name: "Player Mu",
            number: "#18",
            position: "CAM",
            team: "Livergen",
            status: "ACTIVE",
            goals: 10,
            assists: 14,
            contributions: 24,
            appearances: 17,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-nu": {
            name: "Player Nu",
            number: "#11",
            position: "LM",
            team: "Bastard München",
            status: "ACTIVE",
            goals: 7,
            assists: 10,
            contributions: 17,
            appearances: 15,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-xi": {
            name: "Player Xi",
            number: "#7",
            position: "RM",
            team: "FC Barcha",
            status: "ACTIVE",
            goals: 8,
            assists: 7,
            contributions: 15,
            appearances: 14,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-omicron": {
            name: "Player Omicron",
            number: "#17",
            position: "LW",
            team: "FC ROYALE",
            status: "ACTIVE",
            goals: 11,
            assists: 8,
            contributions: 19,
            appearances: 16,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-pi": {
            name: "Player Pi",
            number: "#19",
            position: "RW",
            team: "Newshine United",
            status: "ACTIVE",
            goals: 14,
            assists: 6,
            contributions: 20,
            appearances: 17,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-rho": {
            name: "Player Rho",
            number: "#9",
            position: "CF",
            team: "Paris X Gen",
            status: "ACTIVE",
            goals: 16,
            assists: 9,
            contributions: 25,
            appearances: 18,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-sigma": {
            name: "Player Sigma",
            number: "#21",
            position: "CF",
            team: "RPB",
            status: "ACTIVE",
            goals: 12,
            assists: 10,
            contributions: 22,
            appearances: 17,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-tau": {
            name: "Player Tau",
            number: "#20",
            position: "ST",
            team: "Tonderia Vitoria Bola FC",
            status: "ACTIVE",
            goals: 18,
            assists: 5,
            contributions: 23,
            appearances: 18,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        },

        "player-upsilon": {
            name: "Player Upsilon",
            number: "#23",
            position: "ST",
            team: "Arsenaly",
            status: "ACTIVE",
            goals: 15,
            assists: 7,
            contributions: 22,
            appearances: 17,
            achievements: [
        {
            title: "—",
            detail: "—"
        }
    ]
        }

    };


    const player =
        players[playerId];


    /* =========================
       PLAYER NOT FOUND
    ========================= */

    if (!player) {

        document.title =
            "Player Not Found | Neo Egoist League";

        document.querySelector(
            ".player-profile-main h1"
        ).textContent =
            "Player Not Found";

        document.querySelector(
            ".player-profile-description"
        ).textContent =
            "The player you are looking for does not exist.";
            document.querySelectorAll(".player-page section.section").forEach(s => s.style.display = "none");
    }


    /* =========================
       LOAD PLAYER
    ========================= */

    else {

        document.title =
            `${player.name} | Neo Egoist League`;


        document.querySelector(
            ".player-profile-placeholder"
        ).textContent =
            player.number.replace("#", "");


        document.querySelector(
            ".player-profile-position"
        ).textContent =
            player.position;


        document.querySelector(
            ".player-profile-main h1"
        ).textContent =
            player.name;


        document.querySelector(
            ".player-profile-team"
        ).textContent =
            player.team.toUpperCase();


        document.querySelector(
            ".player-profile-description"
        ).textContent =
            `${player.name} is an active ${player.position} competing for ${player.team} in the Neo Egoist League.`;
            
            const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
};
const teamUpper = player.team.toUpperCase();

setText("player-bio", player.bio ||
    `${player.name} is an active ${player.position} competing for ${player.team} in the Neo Egoist League.`);

setText("player-status", player.status);
setText("player-number", player.number);
setText("player-position", player.position);
setText("player-team", teamUpper);

setText("player-goals", player.goals);
setText("player-assists", player.assists);
setText("player-contributions", player.contributions);
setText("player-appearances", player.appearances);

setText("info-number", player.number);
setText("info-position", player.position);
setText("info-team", teamUpper);
setText("info-status", player.status);
setText("info-value", player.value || "—");
setText("info-joined", player.joined || "—");

setText("current-team", teamUpper);
setText("previous-team", player.previousTeam || "—");

const last = player.lastMatch || {};
setText("last-match", last.name || "No match data available");
setText("last-result", last.result || "—");
setText("last-goals", last.goals ?? 0);
setText("last-assists", last.assists ?? 0);
setText("last-passes", last.passes ?? 0);
setText("last-intercepts", last.intercepts ?? 0);
setText("last-saves", last.saves ?? 0);

const box = document.getElementById("player-achievements");
if (box && player.achievements) {
    box.innerHTML = player.achievements.map(a =>
        `<div class="player-achievement"><strong>${a.title}</strong><span>${a.detail}</span></div>`
    ).join("");
}
}
}
/* =========================
   MARKET PAGE
========================= */

const marketPage = document.querySelector(".market-page");

if (marketPage) {
    
    const searchInput =
        document.querySelector(".market-search input");
    
    const positionFilter =
        document.querySelectorAll(".market-controls select")[0];
    
    const teamFilter =
        document.querySelectorAll(".market-controls select")[1];
    
    const sortFilter =
        document.querySelectorAll(".market-controls select")[2];
    
    const featuredCards =
        document.querySelectorAll(".market-player-card");
    
    const transferListings =
        document.querySelectorAll(".transfer-listing");
    
    const freeAgentCards =
    
        document.querySelectorAll(".free-agent-card");
    
    const num = el => parseFloat((el ? el.textContent : "").replace(/[^0-9.]/g, "")) || 0;

const groups = [
  { cards: featuredCards,
    value: c => num(c.querySelector(".market-player-finance strong")),
    asking: () => 0 },
  { cards: transferListings,
    value: c => num(c.querySelector(".listing-value strong")),
    asking: c => num(c.querySelector(".listing-price strong")) },
  { cards: freeAgentCards,
    value: c => num(c.querySelector(".free-agent-value strong")),
    asking: () => 0 }
];

groups.forEach(g => g.cards.forEach((c, i) => c.dataset.order = i));

function sortMarket() {
    const mode = sortFilter ? sortFilter.value : "Sort By";
    groups.forEach(g => {
        if (!g.cards.length) return;
        const parent = g.cards[0].parentElement;
        Array.from(g.cards).sort((a, b) => {
            if (mode === "Highest Value") return g.value(b) - g.value(a);
            if (mode === "Lowest Value") return g.value(a) - g.value(b);
            if (mode === "Highest Asking Price") return g.asking(b) - g.asking(a);
            if (mode === "Lowest Asking Price") return g.asking(a) - g.asking(b);
            return a.dataset.order - b.dataset.order;
        }).forEach(c => parent.appendChild(c));
    });
}

if (sortFilter) sortFilter.addEventListener("change", sortMarket);
    
    /* =========================
       MARKET FILTER FUNCTION
    ========================= */
    
    function updateMarket() {
        
        const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
const position = positionFilter ? positionFilter.value : "All Positions";
const team = teamFilter ? teamFilter.value : "All Teams";
        
        
        /* =====================
           FEATURED PLAYERS
        ===================== */
        
        featuredCards.forEach(card => {
            
            const name =
                card.querySelector("h3")?.textContent
                .toLowerCase() || "";
            
            const playerPosition =
                card.querySelector(".market-player-top strong")
                ?.textContent.trim() || "";
            
            const playerTeam =
                card.querySelector(".market-player-info > span")
                ?.textContent.trim() || "";
            
            
            const matchesSearch =
                name.includes(search);
            
            const matchesPosition =
                position === "All Positions" ||
                playerPosition === position;
            
            const matchesTeam =
    team === "All Teams" ||
    playerTeam.toLowerCase() === team.toLowerCase();
            
            
            card.style.display =
                matchesSearch &&
                matchesPosition &&
                matchesTeam ?
                "" :
                "none";
            
        });
        
        
        /* =====================
           TRANSFER LISTINGS
        ===================== */
        
        transferListings.forEach(card => {
            
            const name =
                card.querySelector(".listing-player strong")
                ?.textContent.toLowerCase() || "";
            
            const details =
                card.querySelector(".listing-player span")
                ?.textContent.trim() || "";
            
            const parts =
                details.split(" · ");
            
            const playerPosition =
                parts[0] || "";
            
            const playerTeam =
                parts[1] || "";
            
            
            const matchesSearch =
                name.includes(search);
            
            const matchesPosition =
                position === "All Positions" ||
                playerPosition === position;
            
            const matchesTeam =
    team === "All Teams" ||
    playerTeam.toLowerCase() === team.toLowerCase();
            
            
            card.style.display =
                matchesSearch &&
                matchesPosition &&
                matchesTeam ?
                "" :
                "none";
            
        });
        
        
        /* =====================
           FREE AGENTS
        ===================== */
        
        freeAgentCards.forEach(card => {
            
            const name =
                card.querySelector(".free-agent-info h3")
                ?.textContent.toLowerCase() || "";
            
            const playerPosition =
                card.querySelector(".free-agent-info > span")
                ?.textContent.trim() || "";
            
            
            const matchesSearch =
                name.includes(search);
            
            const matchesPosition =
                position === "All Positions" ||
                playerPosition === position;
            
            const matchesTeam =
                team === "All Teams" ||
                team === "Free Agents";
            
            
            card.style.display =
                matchesSearch &&
                matchesPosition &&
                matchesTeam ?
                "" :
                "none";
            
        });
        
    }
    
    
    /* =========================
       SEARCH
    ========================= */
    
    if (searchInput) {
        
        searchInput.addEventListener(
            "input",
            updateMarket
        );
        
    }
    
    
    /* =========================
       FILTERS
    ========================= */
    
    if (positionFilter) {
        
        positionFilter.addEventListener(
            "change",
            updateMarket
        );
        
    }
    
    
    if (teamFilter) {
        
        teamFilter.addEventListener(
            "change",
            updateMarket
        );
        
    }
    
    
    /* =========================
       INITIAL FILTER
    ========================= */
    
    updateMarket();
    
}
/* =========================
NEGOTIATIONS PAGE
========================= */

const negotiationsPage =
document.querySelector(".negotiations-page");

if (negotiationsPage) {
(() => {
    
/* =========================
   NEGOTIATION PLAYER DATA
========================= */

const negotiationPlayers = {
    "player-alpha": { name: "Player Alpha", number: "#1", position: "GK", team: "Steelen München", status: "WILLING", value: 12, askingPrice: 14, wage: 2.4 },
    "player-beta": { name: "Player Beta", number: "#22", position: "GK", team: "Livergen", status: "UNSURE", value: 18, askingPrice: 20, wage: 3.6 },
    "player-gamma": { name: "Player Gamma", number: "#4", position: "CB", team: "Bastard München", status: "UNWILLING", value: 9, askingPrice: 11, wage: 1.8 },
    "player-delta": { name: "Player Delta", number: "#5", position: "CB", team: "FC Barcha", status: "WILLING", value: 8, askingPrice: 10, wage: 1.6 },
    "player-epsilon": { name: "Player Epsilon", number: "#3", position: "LB", team: "FC ROYALE", status: "UNSURE", value: 15, askingPrice: 18, wage: 3 },
    "player-zeta": { name: "Player Zeta", number: "#2", position: "RB", team: "Newshine United", status: "WILLING", value: 11, askingPrice: 13, wage: 2.2 },
    "player-psi": { name: "Player Psi", number: "#21", position: "ST", team: "Free Agent", status: "WILLING", value: 6, askingPrice: 0, wage: 1.2 },
    "player-phi": { name: "Player Phi", number: "#14", position: "CDM", team: "Free Agent", status: "WILLING", value: 4, askingPrice: 0, wage: 0.8 },
    "player-chi": { name: "Player Chi", number: "#5", position: "CB", team: "Free Agent", status: "WILLING", value: 7, askingPrice: 0, wage: 1.4 }
};


/* =========================
   GET PLAYER ID
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const playerId =
    params.get("id");


const player =
    negotiationPlayers[playerId];


/* =========================
   ELEMENTS
========================= */

const nameElement =
    document.querySelector(
        "#negotiation-player-name"
    );

const numberElement =
    document.querySelector(
        "#negotiation-player-number"
    );

const positionElement =
    document.querySelector(
        "#negotiation-player-position"
    );

const teamElement =
    document.querySelector(
        "#negotiation-player-team"
    );

const statusElement =
    document.querySelector(
        "#negotiation-player-status"
    );

const valueElement =
    document.querySelector(
        "#negotiation-value"
    );

const askingPriceElement =
    document.querySelector(
        "#negotiation-asking-price"
    );

const wageElement =
    document.querySelector(
        "#negotiation-wage"
    );

const transferFeeElement =
    document.querySelector(
        "#negotiation-transfer-fee"
    );

const messageElement =
    document.querySelector(
        "#negotiation-message"
    );

const offerInput =
    document.querySelector(
        "#offer-amount"
    );

const submitButton =
    document.querySelector(
        "#submit-offer"
    );

const resultElement =
    document.querySelector(
        "#negotiation-result"
    );


/* =========================
   PLAYER NOT FOUND
========================= */

if (!player) {

    document.title =
        "Player Not Found | Neo Egoist League";


    nameElement.textContent =
        "PLAYER NOT FOUND";


    numberElement.textContent =
        "—";


    positionElement.textContent =
        "—";


    teamElement.textContent =
        "";


    statusElement.textContent =
        "INVALID PLAYER";


    valueElement.textContent =
        "—";


    askingPriceElement.textContent =
        "—";


    wageElement.textContent =
        "—";


    transferFeeElement.textContent =
        "—";


    messageElement.textContent =
        "The player you are trying to negotiate for does not exist.";


    if (submitButton) {
        submitButton.style.display =
            "none";
    }


    if (offerInput) {
        offerInput.style.display =
            "none";
    }


    return;

}


/* =========================
   LOAD PLAYER
========================= */

document.title =
    `Negotiate for ${player.name} | NEL`;


nameElement.textContent =
    player.name;


numberElement.textContent =
    player.number.replace("#", "");


positionElement.textContent =
    player.position;


teamElement.textContent =
    player.team.toUpperCase();


valueElement.textContent =
    `${player.value}M`;


askingPriceElement.textContent =
    player.askingPrice ? `${player.askingPrice}M` : "FREE";


wageElement.textContent =
    `${player.wage}M`;


transferFeeElement.textContent =
    "—";


/* =========================
   TRANSFER STATUS
========================= */

statusElement.textContent =
    player.status;


statusElement.className =
    "transfer-status";


if (player.status === "WILLING") {

    statusElement.classList.add(
        "willing"
    );

    statusElement.textContent =
        "🟢 WILLING TO TRANSFER";

    messageElement.textContent =
        "This player is willing to negotiate a transfer.";

}


else if (player.status === "UNSURE") {

    statusElement.classList.add(
        "unsure"
    );

    statusElement.textContent =
        "🟡 UNSURE";

    messageElement.textContent =
        "This player is unsure about leaving and may require a stronger offer.";

}


else {

    statusElement.classList.add(
        "unwilling"
    );

    statusElement.textContent =
        "🔴 UNWILLING TO TRANSFER";

    messageElement.textContent =
        "This player is currently unwilling to transfer.";

}


/* =========================
   SUBMIT OFFER
========================= */

if (submitButton) {

    submitButton.addEventListener(
        "click",
        () => {
            
                    if (player.team === "Free Agent") {
            resultElement.innerHTML =
                "<strong>FREE AGENT</strong><p>No transfer fee is needed. Agree any bonus with the player on Discord.</p>";
            return;
        }

            const offer =
                Number(
                    offerInput.value
                );


            /* =====================
               INVALID OFFER
            ===================== */

            if (
                !offer ||
                offer <= 0
            ) {

                resultElement.textContent =
                    "Please enter a valid transfer offer.";

                return;

            }


            /* =====================
               DISPLAY FEE
            ===================== */

            transferFeeElement.textContent =
                `${offer}M`;


            /* =====================
               CALCULATE SPLIT
            ===================== */

            const clubShare =
                offer * 0.5;

            const playerShare =
                offer * 0.5;


            /* =====================
               OFFER RESULT
            ===================== */

            if (offer >= player.askingPrice) {

                resultElement.innerHTML = `
                    <strong>OFFER ACCEPTED IN PRINCIPLE</strong>

                    <p>
                        Your ${offer}M offer meets or exceeds the
                        asking price.
                    </p>

                    <p>
                        Original club receives:
                        <strong>${clubShare}M</strong>
                    </p>

                    <p>
                        Player receives:
                        <strong>${playerShare}M</strong>
                    </p>
                `;

            }


            else if (offer >= player.value) {

                resultElement.innerHTML = `
                    <strong>OFFER UNDER ASKING PRICE</strong>

                    <p>
                        Your ${offer}M offer is above the player's
                        ${player.value}M value, but below the
                        ${player.askingPrice}M asking price.
                    </p>

                    <p>
                        Negotiations may be required.
                    </p>
                `;

            }


            else {

                resultElement.innerHTML = `
                    <strong>LOW OFFER</strong>

                    <p>
                        Your ${offer}M offer is below the player's
                        current value of ${player.value}M.
                    </p>

                    <p>
                        The club may reject or negotiate the offer.
                    </p>
                `;

            }

        }
    );

}



})();

}
/* =========================
   MARKET CARD NAVIGATION
========================= */

if (document.querySelector(".market-page")) {
    
    document
        .querySelectorAll(
            ".market-player-card, .transfer-listing, .free-agent-card"
        )
        .forEach(card => {
            
            const link = card.querySelector("a");
            if (!link) return;
            
            const href = link.getAttribute("href");
            if (!href || href === "#") return;
            
            card.style.cursor = "pointer";
            
            card.addEventListener("click", event => {
                if (event.target.closest("a, button, input, select")) return;
                window.location.href = href;
            });
            
        });
    
}
/* NEWS FILTERS */
if (document.querySelector(".news-page")) {
    const filters = document.querySelectorAll(".news-filter");
    const cards = document.querySelectorAll(".news-page-card");
    const count = document.querySelector(".news-count");
    
    filters.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.textContent.trim().toUpperCase();
            filters.forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            
            let visible = 0;
            cards.forEach(card => {
                const cat = card.querySelector(".news-category").textContent.trim().toUpperCase();
                const show = filter === "ALL" || cat === filter;
                card.style.display = show ? "" : "none";
                if (show) visible++;
            });
            if (count) count.textContent = `${visible} ARTICLE${visible === 1 ? "" : "S"}`;
        });
    });
}

/* STATS UPLOAD (preview only) */
const statsInput = document.getElementById("stats-image");
if (statsInput) {
    const label = document.querySelector(".review-status");
    const box = document.querySelector(".stats-upload");
    
    statsInput.addEventListener("change", () => {
        const file = statsInput.files[0];
        if (!file) return;
        let img = document.getElementById("stats-preview");
        if (!img) {
            img = document.createElement("img");
            img.id = "stats-preview";
            img.style.cssText = "max-width:100%;max-height:260px;margin-top:16px;border-radius:8px;";
            box.appendChild(img);
        }
        img.src = URL.createObjectURL(file);
        img.alt = "Selected match stats screenshot";
        label.textContent = "IMAGE SELECTED";
    });
    
    document.querySelector(".reject-button").addEventListener("click", () => {
        statsInput.value = "";
        const img = document.getElementById("stats-preview");
        if (img) img.remove();
        label.textContent = "AWAITING REVIEW";
    });
    
    document.querySelector(".confirm-button").addEventListener("click", () => {
        label.textContent = "NOT CONNECTED YET";
    });
}
/* =========================
   LIVE MATCHES (home, matches, match pages)
========================= */

const MATCH_SELECT = "*, home:teams!home_team(name,slug,logo_url), away:teams!away_team(name,slug,logo_url)";
const dateOf = k => (k ? new Date(k) : null);
const fmtDay = d => d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
const fmtDM = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase();
const fmtTime = d => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtFull = k => (k ? `${fmtDM(dateOf(k))} · ${fmtTime(dateOf(k))}` : "Date TBA");
const crest = (t, cls) => (t && t.logo_url ? `<img class="${cls}" src="${esc(t.logo_url)}" alt="${esc(t.name)}">` : "");
const matchHref = m => `match.html?id=${encodeURIComponent(m.slug)}`;
const emptyNote = text => `<p style="color:var(--muted)">${text}</p>`;
const chip = m => m.status === "finished" ? "⚪ FT" : m.status === "live" ? "🔴 LIVE" : "🔵 UPCOMING";

// any card with data-href is clickable (links and buttons still work normally)
document.addEventListener("click", e => {
    const card = e.target.closest("[data-href]");
    if (card && !e.target.closest("a, button")) window.location.href = card.dataset.href;
});

function startCountdown(el, kickoff) {
    const t = Date.parse(kickoff);
    if (!el) return;
    if (Number.isNaN(t)) { el.textContent = "DATE TBA"; return; }
    let timer;
    const tick = () => {
        const diff = t - Date.now();
        if (diff <= 0) { el.textContent = "MATCH STARTED"; clearInterval(timer); return; }
        const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24;
        const m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
        el.textContent = d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
    };
    tick();
    timer = setInterval(tick, 1000);
}

async function getMatches() {
    const { data, error } = await db.from("matches").select(MATCH_SELECT).limit(300);
    if (error) { console.error(error); return null; }
    const tm = m => (m.kickoff ? Date.parse(m.kickoff) : 0);
    return {
        upcoming: data.filter(m => m.status !== "finished").sort((a, b) => (tm(a) || Infinity) - (tm(b) || Infinity)),
        results: data.filter(m => m.status === "finished").sort((a, b) => tm(b) - tm(a))
    };
}

const listCard = (m, home) => {
    const d = dateOf(m.kickoff);
    const b = home ? "upcoming" : "match-card";
    return `<article class="${home ? "upcoming-card" : "match-card"}" ${home ? "" : `id="${esc(m.slug)}"`} data-href="${matchHref(m)}">
        <div class="${b}-date"><strong>${d ? fmtDay(d) : "TBA"}</strong><span>${d ? fmtDM(d) : ""}</span></div>
        <div class="${b}-teams"><strong>${esc(m.home.name)}</strong><span>VS</span><strong>${esc(m.away.name)}</strong></div>
        <div class="${b}-info"><span class="match-status upcoming">${chip(m)}</span><small>${d ? fmtTime(d) : ""}</small></div>
        <a href="${matchHref(m)}" class="${b}-button">MATCH →</a></article>`;
};

const homeResult = m => `<div class="result-card" data-href="${matchHref(m)}">
    <span class="match-status finished">⚪ FT</span><span class="match-type-label">${esc(m.type)}</span>
    <div class="result-team"><strong>${esc(m.home.name)}</strong><b>${m.home_score}</b></div>
    <div class="result-team"><strong>${esc(m.away.name)}</strong><b>${m.away_score}</b></div>
    <small>${fmtFull(m.kickoff)}</small>
    <a href="${matchHref(m)}" class="match-card-button">MATCH →</a></div>`;

const resultCard = m => `<article class="match-result-card" id="${esc(m.slug)}" data-href="${matchHref(m)}">
    <div class="result-card-top"><span class="match-status finished">⚪ FT</span><span class="match-type-label">${esc(m.type)}</span></div>
    <div class="result-card-teams">
        <div class="result-card-team"><strong>${esc(m.home.name)}</strong><b>${m.home_score}</b></div>
        <div class="result-card-team"><strong>${esc(m.away.name)}</strong><b>${m.away_score}</b></div>
    </div>
    <small>${fmtFull(m.kickoff)}</small></article>`;

const featuredCard = m => {
    const done = m.status === "finished";
    return `<article class="featured-match-card" id="${esc(m.slug)}" data-href="${matchHref(m)}">
        <div class="featured-match-top"><span class="match-status ${done ? "finished" : "upcoming"}">${chip(m)}</span><span class="match-type-label">${esc(m.type)}</span></div>
        <div class="featured-match-teams">
            <div class="featured-team">${crest(m.home, "")}<h3>${esc(m.home.name)}</h3><span>HOME</span></div>
            <div class="featured-match-center"><strong>${done ? `${m.home_score} - ${m.away_score}` : "VS"}</strong><p>${fmtFull(m.kickoff)}</p></div>
            <div class="featured-team">${crest(m.away, "")}<h3>${esc(m.away.name)}</h3><span>AWAY</span></div>
        </div>
        <a href="${matchHref(m)}" class="featured-match-button">MATCH →</a></article>`;
};

async function loadMatchLists() {
    const all = await getMatches();
    if (!all) return;
    const { upcoming, results } = all;
    const featured = upcoming.find(m => m.featured) || upcoming[0] || results[0];

    const homeFeatured = document.querySelector(".featured-match");
    if (homeFeatured) {
        if (featured) {
            const done = featured.status === "finished";
            homeFeatured.dataset.href = matchHref(featured);
            homeFeatured.innerHTML = `
                <div class="match-team">${crest(featured.home, "match-team-logo")}<h3>${esc(featured.home.name)}</h3><p>HOME</p></div>
                <div class="match-center">
                    <span class="match-type">${esc(featured.type)}</span>
                    <div class="vs">${done ? `${featured.home_score} - ${featured.away_score}` : "VS"}</div>
                    <div class="match-date" id="featured-countdown">${done ? "FULL TIME" : ""}</div>
                    <a href="${matchHref(featured)}" class="match-button">MATCH CENTER →</a>
                </div>
                <div class="match-team">${crest(featured.away, "match-team-logo")}<h3>${esc(featured.away.name)}</h3><p>AWAY</p></div>`;
            if (!done) startCountdown(document.getElementById("featured-countdown"), featured.kickoff);
        } else {
            homeFeatured.innerHTML = emptyNote("No matches scheduled yet.");
        }
        const r = document.querySelector(".results");
        const u = document.querySelector(".upcoming-list");
        if (r) r.innerHTML = results.slice(0, 3).map(homeResult).join("") || emptyNote("No results yet.");
        if (u) u.innerHTML = upcoming.slice(0, 3).map(m => listCard(m, true)).join("") || emptyNote("No upcoming matches.");
    }

    const fg = document.querySelector(".featured-matches-grid");
    if (fg) {
        fg.innerHTML = featured ? featuredCard(featured) : emptyNote("No featured match.");
        document.querySelector(".matches-list").innerHTML = upcoming.map(m => listCard(m, false)).join("") || emptyNote("No upcoming matches.");
        document.querySelector(".results-grid").innerHTML = results.map(resultCard).join("") || emptyNote("No results yet.");
        if (location.hash) {
            const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            if (t) t.scrollIntoView();
        }
    }
}

if (document.querySelector(".featured-match") || document.querySelector(".featured-matches-grid")) loadMatchLists();

/* ---------- single match page ---------- */
async function loadMatchPage() {
    const slug = new URLSearchParams(location.search).get("id");
    const set = (sel, v) => { const el = document.querySelector(sel); if (el) el.textContent = v; };
    const { data: m } = await db.from("matches").select(MATCH_SELECT).eq("slug", slug || "").maybeSingle();

    if (!m) {
        document.title = "Match Not Found | Neo Egoist League";
        set("#match-status", "MATCH NOT FOUND"); set("#match-type", "NEL");
        set("#home-team-name", "Unknown match"); set("#away-team-name", "");
        set("#match-score", "—"); set("#match-date", "");
        set("#match-description", "The match you are looking for does not exist or the link is invalid.");
        return;
    }

    const d = dateOf(m.kickoff), done = m.status === "finished";
    document.title = `${m.home.name} vs ${m.away.name} | NEL`;
    set("#match-status", m.status.toUpperCase()); set("#match-type", m.type);
    set("#home-team-name", m.home.name); set("#away-team-name", m.away.name);
    set("#match-score", done ? `${m.home_score} - ${m.away_score}` : "VS");
    set("#match-date", d ? `${fmtDM(d)} · ${fmtTime(d)}` : "Date TBA");
    set("#detail-date", d ? fmtDM(d) : "TBA"); set("#detail-time", d ? fmtTime(d) : "TBA");
    set("#detail-competition", m.type); set("#detail-venue", m.venue || "TBD");
    set("#match-description", m.description ||
        (done ? `${m.home.name} ${m.home_score}-${m.away_score} ${m.away.name}.` : `${m.home.name} face ${m.away.name}.`));

    [["#home-team-logo", m.home], ["#away-team-logo", m.away]].forEach(([sel, t]) => {
        const img = document.querySelector(sel);
        if (t.logo_url) { img.src = t.logo_url; img.alt = t.name; img.style.display = "block"; }
        else img.style.display = "none";
    });

    const { data: rows } = await db.from("match_stats").select("*, player:players(name)").eq("match_id", m.id);
    const stats = (rows || []).sort((a, b) => b.goals - a.goals || b.assists - a.assists);
    const sum = k => stats.reduce((s, r) => s + r[k], 0);

    document.querySelector(".match-stats-grid").innerHTML =
        [["GOALS", "goals"], ["ASSISTS", "assists"], ["INTERCEPTS", "intercepts"], ["PASSES", "passes"], ["SAVES", "saves"]]
            .map(([l, k]) => `<div class="match-stat-card"><span>${l}</span><strong>${sum(k)}</strong></div>`).join("");

    const sec = document.querySelector(".match-lineups-section");
    sec.querySelector("h2").textContent = "PLAYER STATS";
    const card = sec.querySelector(".match-placeholder-card");
    card.style.padding = stats.length ? "0" : "";
    card.innerHTML = stats.length
        ? `<div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>PLAYER</th><th>G</th><th>A</th><th>INT</th><th>PASS</th><th>SAVES</th><th>AWARD</th></tr></thead><tbody>${
            stats.map(r => `<tr><td>${esc(r.player ? r.player.name : "?")}</td><td>${r.goals}</td><td>${r.assists}</td><td>${r.intercepts}</td><td>${r.passes}</td><td>${r.saves}</td><td>${[r.mvp ? "MVP" : "", r.motm ? "MOTM" : ""].filter(Boolean).join(" ") || "—"}</td></tr>`).join("")
          }</tbody></table></div>`
        : "<p>No player stats yet.</p>";

    const ev = document.querySelector(".match-events-section");
    if (ev) ev.style.display = "none";
}

if (document.querySelector(".match-page")) loadMatchPage();
/* =========================
   LIVE PLAYERS (players page + profile)
========================= */

const fmtM = v => `${Number(v).toFixed(2)}M`;
const playersGrid = document.querySelector(".players-grid");

async function loadPlayers() {
    const [pt, tm] = await Promise.all([
        db.from("player_totals").select("*").order("name"),
        db.from("teams").select("id,name")
    ]);
    if (pt.error) { console.error(pt.error); return; }
    const teamById = Object.fromEntries((tm.data || []).map(t => [t.id, t.name]));

    playersGrid.innerHTML = pt.data.length ? pt.data.map(p => {
        const gk = (p.position || "").toUpperCase() === "GK";
        const stats = gk ? [[p.saves, "SAVES"], [p.appearances, "APPEARANCES"]]
                         : [[p.goals, "GOALS"], [p.assists, "ASSISTS"]];
        const href = `player.html?id=${encodeURIComponent(p.slug)}`;
        const has = p.number != null;
        return `<article class="player-card" data-href="${href}">
            <div class="player-card-top"><span class="player-number">${has ? "#" + esc(p.number) : ""}</span><span class="player-position">${esc(p.position || "—")}</span></div>
            <div class="player-image"><div class="player-placeholder">${has ? esc(String(p.number).padStart(2, "0")) : "?"}</div></div>
            <div class="player-card-content"><span class="player-team">${esc((p.team_id ? teamById[p.team_id] || "" : "Free agent").toUpperCase())}</span><h3>${esc(p.name)}</h3></div>
            <div class="player-stats">${stats.map(([v, l]) => `<div><strong>${v}</strong><span>${l}</span></div>`).join("")}</div>
            <a href="${href}" class="player-card-button">VIEW PROFILE →</a></article>`;
    }).join("") : emptyNote("No players yet.");
}

if (playersGrid) loadPlayers();

async function loadPlayerProfile() {
    const slug = new URLSearchParams(location.search).get("id");
    const put = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const q = sel => document.querySelector(sel);

    const { data: p } = await db.from("players").select("*, team:teams(name)").eq("slug", slug || "").maybeSingle();

    if (!p) {
        document.title = "Player Not Found | Neo Egoist League";
        q(".player-profile-main h1").textContent = "Player Not Found";
        q(".player-profile-description").textContent = "The player you are looking for does not exist.";
        document.querySelectorAll(".player-page section.section").forEach(s => s.style.display = "none");
        return;
    }

    const [tot, ms, tr] = await Promise.all([
        db.from("player_totals").select("*").eq("player_id", p.id).maybeSingle(),
        db.from("match_stats").select("*, match:matches(kickoff,status,home_score,away_score,home_team,away_team,home:teams!home_team(name),away:teams!away_team(name))").eq("player_id", p.id),
        db.from("transfers").select("*, from:teams!from_team(name)").eq("player_id", p.id).order("created_at", { ascending: false })
    ]);

    const t = tot.data || { goals: 0, assists: 0, contributions: 0, appearances: 0, mvps: 0, motms: 0, value: p.base_value };
    const teamTxt = (p.team ? p.team.name : "Free agent").toUpperCase();
    const num = p.number != null ? `#${p.number}` : "—";
    const pos = p.position || "—";
    const status = p.active ? "ACTIVE" : "INACTIVE";

    document.title = `${p.name} | Neo Egoist League`;
    q(".player-profile-placeholder").textContent = p.number != null ? String(p.number) : "?";
    q(".player-profile-position").textContent = pos;
    q(".player-profile-main h1").textContent = p.name;
    q(".player-profile-team").textContent = teamTxt;
    q(".player-profile-description").textContent =
        `${p.name} is ${p.active ? "an active" : "an inactive"} ${p.position || "player"} ${p.team ? "competing for " + p.team.name : "currently without a club"} in the Neo Egoist League.`;

    put("player-status", status); put("player-number", num); put("player-position", pos); put("player-team", teamTxt);
    put("player-goals", t.goals); put("player-assists", t.assists);
    put("player-contributions", t.contributions); put("player-appearances", t.appearances);
    put("info-number", num); put("info-position", pos); put("info-team", teamTxt); put("info-status", status);
    put("info-value", fmtM(t.value)); put("info-joined", p.joined_year || "—");
    put("current-team", teamTxt);
    put("player-bio", p.bio || `${p.name} is competing in the Neo Egoist League.`);

    const prev = tr.data && tr.data[0];
    put("previous-team", prev ? (prev.from ? prev.from.name.toUpperCase() : "FREE AGENT") : (p.previous_team || "—"));

    const when = r => (r.match.kickoff ? Date.parse(r.match.kickoff) : 0);
    const last = (ms.data || []).filter(r => r.match).sort((a, b) => when(b) - when(a))[0];
    if (last) {
        const m = last.match;
        const side = p.team_id && p.team_id === m.home_team ? "home" : p.team_id && p.team_id === m.away_team ? "away" : null;
        put("last-match", `${m.home.name} ${m.home_score ?? "-"} - ${m.away_score ?? "-"} ${m.away.name}`);
        let res = "—";
        if (m.status === "finished") {
            res = "FT";
            if (side) {
                const a = side === "home" ? m.home_score : m.away_score;
                const b = side === "home" ? m.away_score : m.home_score;
                res = a > b ? "WIN" : a < b ? "LOSS" : "DRAW";
            }
        }
        put("last-result", res);
        put("last-goals", last.goals); put("last-assists", last.assists);
        put("last-passes", last.passes); put("last-intercepts", last.intercepts); put("last-saves", last.saves);
    }

    const ach = [];
    if (t.mvps) ach.push(["MVP", `${t.mvps} award${t.mvps > 1 ? "s" : ""}`]);
    if (t.motms) ach.push(["MAN OF THE MATCH", `${t.motms} award${t.motms > 1 ? "s" : ""}`]);
    document.getElementById("player-achievements").innerHTML = ach.length
        ? ach.map(([a, b]) => `<div class="player-achievement"><strong>${a}</strong><span>${b}</span></div>`).join("")
        : `<div class="player-achievement"><strong>—</strong><span>No awards yet</span></div>`;

    const notice = q(".player-placeholder-notice");
    if (notice) notice.style.display = "none";
}

if (document.querySelector(".player-page")) loadPlayerProfile();
