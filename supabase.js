const db = window.supabase.createClient(
    "https://gvyfmjtmlpfzbtzflbxm.supabase.co",
    "sb_publishable_EMZJMzT4isHTZq1eLAwY8g_LFpKhH_v",
    { auth: { flowType: "pkce" } }
);

window.nelLogin = () => {
    sessionStorage.setItem("nel-return", location.href);
    return db.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: location.origin + location.pathname }
    });
};

(() => {
    const justLoggedIn = new URLSearchParams(location.search).has("code");
    const nav = document.querySelector(".nav-links");
    const add = (href, text) => {
        if (!nav || nav.querySelector(`a[href="${href}"]`)) return;
        const a = document.createElement("a");
        a.href = href;
        a.textContent = text;
        if (location.pathname.endsWith(href)) a.classList.add("active");
        nav.append(a);
    };
    add("history.html", "History");
    add("account.html", "Account");
    db.auth.getSession().then(({ data: { session } }) => {
        const back = sessionStorage.getItem("nel-return");
        if (!back) return;
        sessionStorage.removeItem("nel-return");
        if (!session || !justLoggedIn) return;
        const u = new URL(back);
        if (u.pathname !== location.pathname || u.search) location.replace(back);
    });
})();
