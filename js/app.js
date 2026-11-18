/* ------------------------------------------------------------------
   Optical Zone — Kota · interaction layer (vanilla JS, no dependencies)
   Renders catalogue cards, shop filters, product pages, search,
   saved frames, the frame finder, opening-hours status and the
   WhatsApp handoff for enquiries and eye-test bookings.
------------------------------------------------------------------- */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const SAVE_KEY = "oz_saved";
  const FEATURED_IDS = ["vigyan", "dadabari", "nayapura"];

  /* ---------- helpers ---------- */
  const icon = (name, cls = "") => `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#i-${name}"/></svg>`;
  const priceLabel = (p) => (p.price == null ? "Price on enquiry" : "₹" + Number(p.price).toLocaleString("en-IN"));
  const categoryLabel = (c) => (c === "eyeglasses" ? "Eyeglasses" : "Sunglasses");
  const productUrl = (p) => `product.html?id=${encodeURIComponent(p.id)}`;
  const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const waUrl = (text) => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;
  const absoluteUrl = (rel) => new URL(rel, window.location.href).href;

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 2400);
  }

  /* ---------- saved frames ---------- */
  function loadSaved() {
    try {
      const list = JSON.parse(localStorage.getItem(SAVE_KEY));
      return Array.isArray(list) ? list.filter((id) => getProduct(id)) : [];
    } catch (_) {
      return [];
    }
  }
  let saved = loadSaved();
  const isSaved = (id) => saved.includes(id);

  function setSaved(list) {
    saved = list;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(list)); } catch (_) { /* storage unavailable */ }
    updateCounts();
    syncSaveButtons();
    renderSaved();
  }

  function toggleSaved(id) {
    const p = getProduct(id);
    if (!p) return;
    if (isSaved(id)) {
      setSaved(saved.filter((x) => x !== id));
      toast(`${p.name} removed from saved`);
    } else {
      setSaved([...saved, id]);
      toast(`${p.name} saved`);
    }
  }

  function updateCounts() {
    $$("[data-saved-count]").forEach((el) => {
      el.textContent = saved.length;
      el.classList.toggle("is-on", saved.length > 0);
    });
  }

  function syncSaveButtons() {
    $$("[data-save]").forEach((btn) => {
      const p = getProduct(btn.dataset.save);
      if (!p) return;
      const on = isSaved(p.id);
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", `${on ? "Remove" : "Save"} ${p.name} ${on ? "from" : "to"} saved frames`);
    });
  }

  function renderSaved() {
    const list = $("#savedList");
    const foot = $("#savedFoot");
    if (!list) return;
    if (!saved.length) {
      list.innerHTML = `<div class="empty">${icon("heart")}<p>No saved frames yet. Tap the heart on any frame to keep it here.</p><a class="btn btn-ghost btn-sm" href="shop.html">Browse frames</a></div>`;
      if (foot) foot.hidden = true;
      return;
    }
    list.innerHTML = saved
      .map((id) => getProduct(id))
      .map((p) => `
        <div class="saved-item">
          <img src="${p.image}" alt="" width="84" height="66" loading="lazy">
          <div><a href="${productUrl(p)}">${esc(p.name)}</a><small>${categoryLabel(p.category)} · ${esc(p.shape)}</small></div>
          <button class="remove-btn" type="button" data-remove="${p.id}" aria-label="Remove ${esc(p.name)}">${icon("close", "icon--sm")}</button>
        </div>`)
      .join("");
    if (foot) {
      foot.hidden = false;
      const lines = saved.map((id) => getProduct(id)).map((p) => `- ${p.name} (${categoryLabel(p.category)}, ${p.shape})`).join("\n");
      const link = $("#savedEnquire");
      if (link) link.href = waUrl(`Hello Optical Zone, I have saved these frames and would like to know their price and availability:\n${lines}`);
    }
  }

  /* ---------- product cards ---------- */
  function productCard(p, i = 0) {
    return `
      <article class="pcard reveal" style="--d:${Math.min(i, 6) * 70}ms">
        <div class="pcard__media">
          <img src="${p.image}" alt="${esc(p.name)}, ${esc(p.shape.toLowerCase())} ${esc(categoryLabel(p.category).toLowerCase())} in ${esc(p.material.toLowerCase())}" width="1408" height="768" loading="lazy">
          <span class="pcard__tag">${esc(p.shape)}</span>
          <button class="pcard__save" type="button" data-save="${p.id}" aria-pressed="false">${icon("heart", "icon--sm")}</button>
        </div>
        <div class="pcard__body">
          <div class="pcard__meta">${categoryLabel(p.category)} · ${esc(p.material)}</div>
          <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
          <div class="pcard__foot">
            <span class="price">${priceLabel(p)}</span>
            <div class="swatches" aria-label="Colours: ${esc(p.colors.map((c) => c.name).join(", "))}">
              ${p.colors.map((c) => `<span class="swatch-dot" title="${esc(c.name)}" style="background:${c.hex}"></span>`).join("")}
            </div>
          </div>
        </div>
      </article>`;
  }

  /* ---------- opening status (Kota time) ---------- */
  function currentHourIST() {
    const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: BUSINESS.timezone }).format(new Date());
    return parseInt(parts, 10);
  }

  function updateStatus() {
    const els = $$("[data-status]");
    if (!els.length) return;
    const h = currentHourIST();
    const open = h >= BUSINESS.hours.open && h < BUSINESS.hours.close;
    els.forEach((el) => {
      const dot = $(".live-dot", el);
      const title = $("[data-status-title]", el);
      const sub = $("[data-status-sub]", el);
      if (dot) dot.classList.toggle("is-open", open);
      if (title) title.textContent = open ? "Open now" : "Closed right now";
      if (sub) sub.textContent = `Hours ${BUSINESS.hours.label} · call to confirm`;
    });
  }

  /* ---------- business bindings ---------- */
  function bindBusiness() {
    const map = {
      phone: () => BUSINESS.phone,
      "phone-href": () => `tel:${BUSINESS.phoneTel}`,
      "wa-generic": () => waUrl("Hello Optical Zone, I'd like to ask about your eyewear and eye tests."),
      maps: () => BUSINESS.mapsSearch,
      directions: () => BUSINESS.mapsDirections,
      hours: () => BUSINESS.hours.label,
      "address-inline": () => `${BUSINESS.address.line1}, ${BUSINESS.address.line2}, ${BUSINESS.address.city}`,
      year: () => String(new Date().getFullYear())
    };
    Object.entries(map).forEach(([key, value]) => {
      $$(`[data-biz="${key}"]`).forEach((el) => {
        if (el.tagName === "A") el.setAttribute("href", value());
        else el.textContent = value();
      });
    });
  }

  /* ---------- search ---------- */
  const PAGES = [
    { title: "Eyeglasses", url: "shop.html?category=eyeglasses", note: "Page · Shop" },
    { title: "Sunglasses", url: "shop.html?category=sunglasses", note: "Page · Shop" },
    { title: "Eye tests", url: "eye-tests.html", note: "Page · Eye care" },
    { title: "About Optical Zone", url: "about.html", note: "Page · About" },
    { title: "Visit & contact", url: "contact.html", note: "Page · Contact" }
  ];

  function renderSearch(query) {
    const box = $("#searchResults");
    if (!box) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      box.innerHTML = `<p class="form-note" style="padding:8px 10px">Try “sunglasses”, “round”, “gold” or “eye test”.</p>`;
      return;
    }
    const hay = (p) => [p.name, p.category, categoryLabel(p.category), p.shape, p.material, ...p.tags, ...p.colors.map((c) => c.name)].join(" ").toLowerCase();
    const products = PRODUCTS.filter((p) => hay(p).includes(q)).map((p) => ({ title: p.name, url: productUrl(p), note: `${categoryLabel(p.category)} · ${p.shape}`, image: p.image }));
    const pages = PAGES.filter((pg) => pg.title.toLowerCase().includes(q) || pg.note.toLowerCase().includes(q));
    const results = [...products, ...pages].slice(0, 8);
    box.innerHTML = results.length
      ? results.map((r) => `<a href="${r.url}">${r.image ? `<img src="${r.image}" alt="" width="64" height="48">` : icon("arrow-right")}<span><strong>${esc(r.title)}</strong><small>${esc(r.note)}</small></span></a>`).join("")
      : `<p class="form-note" style="padding:8px 10px">No matches for “${esc(query)}”. Try a shape or colour.</p>`;
  }

  /* ---------- shell: header, menus, drawers, reveal ---------- */
  function setScrim(on) {
    const scrim = $("#scrim");
    if (scrim) scrim.classList.toggle("is-open", on);
  }

  function closeOverlays() {
    $("#searchPanel")?.classList.remove("is-open");
    $("#savedDrawer")?.classList.remove("is-open");
    $("#mobileMenu")?.classList.remove("is-open");
    document.body.style.overflow = "";
    setScrim(false);
    $$("[data-open-menu]").forEach((b) => b.setAttribute("aria-expanded", "false"));
  }

  function openSearch() {
    closeOverlays();
    $("#searchPanel")?.classList.add("is-open");
    setScrim(true);
    setTimeout(() => $("#searchInput")?.focus(), 60);
  }

  function openSaved() {
    closeOverlays();
    $("#savedDrawer")?.classList.add("is-open");
    setScrim(true);
    document.body.style.overflow = "hidden";
    renderSaved();
  }

  function openMenu() {
    closeOverlays();
    $("#mobileMenu")?.classList.add("is-open");
    document.body.style.overflow = "hidden";
    $$("[data-open-menu]").forEach((b) => b.setAttribute("aria-expanded", "true"));
  }

  function bindShell() {
    const header = $(".site-header");
    const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest("[data-open-search]")) return openSearch();
      if (t.closest("[data-open-saved]")) return openSaved();
      if (t.closest("[data-open-menu]")) return openMenu();
      if (t.closest("[data-close]") || t.id === "scrim") return closeOverlays();
      const save = t.closest("[data-save]");
      if (save) {
        e.preventDefault();
        return toggleSaved(save.dataset.save);
      }
      const remove = t.closest("[data-remove]");
      if (remove) return toggleSaved(remove.dataset.remove);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOverlays();
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        openSearch();
      }
    });

    const input = $("#searchInput");
    if (input) {
      input.addEventListener("input", (e) => renderSearch(e.target.value));
      renderSearch("");
    }

    $$(".mobile-menu a").forEach((a) => a.addEventListener("click", closeOverlays));
  }

  function observeReveals() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- shared content blocks ---------- */
  function renderEyeSteps() {
    const box = $("#eyeSteps");
    if (!box) return;
    box.innerHTML = EYE_TEST_STEPS.map((s, i) => `<div class="step reveal" style="--d:${i * 90}ms"><span class="step__n">0${i + 1}</span><div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div></div>`).join("");
  }

  function renderFaqs() {
    const box = $("#faqList");
    if (!box) return;
    box.innerHTML = FAQS.map((f) => `<details><summary>${esc(f.q)} ${icon("plus")}</summary><p>${esc(f.a)}</p></details>`).join("");
  }

  /* ---------- home ---------- */
  function renderFeatured() {
    const box = $("#featuredGrid");
    if (!box) return;
    box.innerHTML = FEATURED_IDS.map(getProduct).map((p, i) => productCard(p, i)).join("");
    syncSaveButtons();
  }

  function initFinder() {
    const root = $("#finder");
    if (!root) return;
    const state = { face: null, cat: null };
    const steps = $$(".finder__steps span", root);
    const faceBox = $("#faceChoices", root);
    const catBox = $("#catChoices", root);
    const result = $("#finderResult", root);
    const qFace = $("#qFace", root);
    const qCat = $("#qCat", root);

    faceBox.innerHTML = FACE_SHAPES.map((f) => `<button type="button" class="choice" data-face="${f.id}" aria-pressed="false"><strong>${f.name}</strong><small>${f.hint}</small></button>`).join("");
    const cats = [
      { id: "eyeglasses", name: "Eyeglasses", hint: "Everyday, prescription or screen wear" },
      { id: "sunglasses", name: "Sunglasses", hint: "Sun protection, with or without power" },
      { id: "any", name: "Show me both", hint: "I'm open to either" },
      { id: "unsure", name: "Not sure yet", hint: "Show me a few options" }
    ];
    catBox.innerHTML = cats.map((c) => `<button type="button" class="choice" data-cat="${c.id}" aria-pressed="false"><strong>${c.name}</strong><small>${c.hint}</small></button>`).join("");

    function setStep(n) {
      steps.forEach((s, i) => s.classList.toggle("is-on", i < n));
      qFace.hidden = n !== 1;
      qCat.hidden = n !== 2;
      result.hidden = n !== 3;
    }

    function renderResult() {
      const face = FACE_SHAPES.find((f) => f.id === state.face);
      const pool = PRODUCTS.filter((p) => face.suggest.includes(p.shape));
      const filtered = state.cat === "any" || state.cat === "unsure" ? pool : pool.filter((p) => p.category === state.cat);
      const matches = filtered.length ? filtered : pool;
      const shapes = [...new Set(matches.map((p) => p.shape))].join(",");
      const cat = state.cat === "eyeglasses" || state.cat === "sunglasses" ? `category=${state.cat}&` : "";
      result.innerHTML = `
        <p class="lead">For a <strong>${face.name.toLowerCase()}</strong> face, these shapes usually flatter: <strong>${face.suggest.join(", ")}</strong>. Here are sample frames from our range that fit that guide.</p>
        <div class="mini-list">
          ${matches.slice(0, 3).map((p) => `<a href="${productUrl(p)}"><img src="${p.image}" alt="" width="76" height="58" loading="lazy"><span><strong>${esc(p.name)}</strong><small>${categoryLabel(p.category)} · ${esc(p.shape)}</small></span>${icon("arrow-right", "icon--sm")}</a>`).join("")}
        </div>
        <div class="visit__actions">
          <a class="btn btn-primary btn-sm" href="shop.html?${cat}shape=${encodeURIComponent(shapes)}">See all matches</a>
          <button class="btn btn-ghost btn-sm" type="button" id="finderRestart">Start again</button>
        </div>`;
      $("#finderRestart", result).addEventListener("click", () => {
        state.face = null; state.cat = null;
        $$("[data-face]", faceBox).forEach((b) => b.setAttribute("aria-pressed", "false"));
        $$("[data-cat]", catBox).forEach((b) => b.setAttribute("aria-pressed", "false"));
        setStep(1);
      });
    }

    root.addEventListener("click", (e) => {
      const f = e.target.closest("[data-face]");
      const c = e.target.closest("[data-cat]");
      if (f) {
        state.face = f.dataset.face;
        $$("[data-face]", faceBox).forEach((b) => b.setAttribute("aria-pressed", String(b === f)));
        setStep(2);
      }
      if (c) {
        state.cat = c.dataset.cat;
        $$("[data-cat]", catBox).forEach((b) => b.setAttribute("aria-pressed", String(b === c)));
        renderResult();
        setStep(3);
      }
    });
    $("#finderBack")?.addEventListener("click", () => setStep(1));
    setStep(1);
  }

  /* ---------- shop ---------- */
  function initShop() {
    const grid = $("#shopGrid");
    if (!grid) return;
    const params = new URLSearchParams(window.location.search);
    const state = {
      category: params.get("category") === "eyeglasses" || params.get("category") === "sunglasses" ? params.get("category") : "all",
      shapes: new Set((params.get("shape") || "").split(",").filter((s) => SHAPES.includes(s))),
      sort: ["name", "featured"].includes(params.get("sort")) ? params.get("sort") : "featured"
    };

    const catBox = $("#catChips");
    const shapeBox = $("#shapeChips");
    const sortSel = $("#sortSelect");
    const countEl = $("#shopCount");
    const empty = $("#shopEmpty");
    const toggle = $("#toggleFilters");
    const panel = $("#filters");

    const shapesInUse = SHAPES.filter((s) => PRODUCTS.some((p) => p.shape === s));

    function syncURL() {
      const q = new URLSearchParams();
      if (state.category !== "all") q.set("category", state.category);
      if (state.shapes.size) q.set("shape", [...state.shapes].join(","));
      if (state.sort !== "featured") q.set("sort", state.sort);
      const qs = q.toString();
      history.replaceState(null, "", `${window.location.pathname}${qs ? "?" + qs : ""}`);
    }

    function matchesFilters(p) {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (state.shapes.size && !state.shapes.has(p.shape)) return false;
      return true;
    }

    function renderChips() {
      const catCounts = { all: PRODUCTS.length, eyeglasses: 0, sunglasses: 0 };
      PRODUCTS.forEach((p) => catCounts[p.category]++);
      const cats = [["all", "All"], ["eyeglasses", "Eyeglasses"], ["sunglasses", "Sunglasses"]];
      catBox.innerHTML = cats.map(([id, label]) => `<button class="chip" type="button" data-cat="${id}" aria-pressed="${state.category === id}">${label} <span class="n">${catCounts[id]}</span></button>`).join("");

      shapeBox.innerHTML = shapesInUse.map((s) => {
        const n = PRODUCTS.filter((p) => p.shape === s && (state.category === "all" || p.category === state.category)).length;
        return `<button class="chip" type="button" data-shape="${s}" aria-pressed="${state.shapes.has(s)}">${s} <span class="n">${n}</span></button>`;
      }).join("");
    }

    function render() {
      const list = PRODUCTS.filter(matchesFilters).sort((a, b) => (state.sort === "name" ? a.name.localeCompare(b.name) : 0));
      grid.innerHTML = list.map((p, i) => productCard(p, i)).join("");
      countEl.innerHTML = `Showing <strong>${list.length}</strong> of ${PRODUCTS.length} sample frames`;
      empty.hidden = list.length > 0;
      renderChips();
      syncSaveButtons();
      observeReveals();
      syncURL();
    }

    catBox.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.category = b.dataset.cat;
      render();
    });
    shapeBox.addEventListener("click", (e) => {
      const b = e.target.closest("[data-shape]");
      if (!b) return;
      const s = b.dataset.shape;
      state.shapes.has(s) ? state.shapes.delete(s) : state.shapes.add(s);
      render();
    });
    sortSel.value = state.sort;
    sortSel.addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });
    const clear = () => {
      state.category = "all";
      state.shapes.clear();
      state.sort = "featured";
      sortSel.value = "featured";
      render();
    };
    $("#clearFilters")?.addEventListener("click", clear);
    $("#emptyClear")?.addEventListener("click", clear);

    toggle?.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    render();
  }

  /* ---------- product page ---------- */
  function initPDP() {
    const root = $("#pdp");
    if (!root) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const p = getProduct(id);
    if (!p) {
      root.innerHTML = `<div class="empty" style="padding:80px 0"><h2>We couldn't find that frame.</h2><p>It may have been removed from the sample range.</p><a class="btn btn-primary" href="shop.html">Back to the shop</a></div>`;
      return;
    }
    document.title = `${p.name} · ${categoryLabel(p.category)} · Optical Zone Kota`;
    const isEyeglass = p.category === "eyeglasses";
    const state = { color: p.colors[0].name, lens: isEyeglass ? LENS_OPTIONS[0].id : null };

    $("#crumbCategory").textContent = categoryLabel(p.category);
    $("#crumbCategory").href = `shop.html?category=${p.category}`;
    $("#crumbName").textContent = p.name;

    root.innerHTML = `
      <div class="pdp__media">
        <img src="${p.image}" alt="${esc(p.name)} ${esc(p.shape.toLowerCase())} frame in ${esc(p.material.toLowerCase())}" width="1408" height="768">
        <span class="pcard__tag">${esc(p.shape)}</span>
      </div>
      <div class="pdp__info">
        <div>
          <div class="pcard__meta" style="margin-bottom:8px">${categoryLabel(p.category)} · ${esc(p.material)}</div>
          <h1>${esc(p.name)}</h1>
        </div>
        <div class="pdp__meta">${[categoryLabel(p.category), p.shape, ...p.tags].map((t) => `<span class="chip" style="cursor:default">${esc(t)}</span>`).join("")}</div>
        <p class="pdp__lede">${esc(p.description)}</p>
        <div class="price" style="font-size:22px">${priceLabel(p)}</div>

        <div class="opt-group">
          <h3>Colour <b id="colorName">${esc(state.color)}</b></h3>
          <div class="color-opt" id="colorRow">
            ${p.colors.map((c) => `<button type="button" data-color="${esc(c.name)}" aria-pressed="${c.name === state.color}" aria-label="${esc(c.name)}"><span class="sw" style="background:${c.hex}"></span>${esc(c.name)}</button>`).join("")}
          </div>
        </div>

        ${isEyeglass ? `
        <fieldset class="opt-group" style="border:0;padding:0;margin:0">
          <legend class="sr-only">Lens type</legend>
          <h3>Lens type</h3>
          <div class="lens-list" id="lensList">
            ${LENS_OPTIONS.map((l) => `
              <label>
                <input type="radio" name="lens" value="${l.id}" ${l.id === state.lens ? "checked" : ""}>
                <span class="grow">${esc(l.name)}<small>${esc(l.note)}</small></span>
              </label>`).join("")}
          </div>
        </fieldset>` : ""}

        <div class="enquiry">
          <div class="enquiry__summary" id="enquirySummary"></div>
          <a class="btn btn-wa" id="enquireBtn" href="#" target="_blank" rel="noopener">${icon("whatsapp")} Enquire on WhatsApp</a>
          <small>We'll confirm price and stock on WhatsApp. Or call <a href="tel:${BUSINESS.phoneTel}" style="color:var(--text)">${BUSINESS.phone}</a>.</small>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" type="button" data-save="${p.id}" aria-pressed="false">${icon("heart", "icon--sm")} Save frame</button>
          <a class="btn btn-ghost btn-sm" href="eye-tests.html">${icon("eye", "icon--sm")} Book an eye test</a>
        </div>

        <div class="accordion">
          <details open>
            <summary>Details ${icon("plus")}</summary>
            <div class="acc-body"><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
          </details>
          <details>
            <summary>Fit & try-on ${icon("plus")}</summary>
            <div class="acc-body">
              <p>Visit the shop to try this frame on. Bring your current glasses or prescription if you have them. We'll check the fit against your face before you leave.</p>
            </div>
          </details>
          <details>
            <summary>Care ${icon("plus")}</summary>
            <div class="acc-body">
              <p>Wipe lenses with a microfibre cloth. Store the frame in its case when not in use, and avoid leaving it in a hot car.</p>
            </div>
          </details>
        </div>
      </div>`;

    function enquiryText() {
      const lens = isEyeglass ? LENS_OPTIONS.find((l) => l.id === state.lens) : null;
      const lines = [
        `Hello Optical Zone, I'd like to enquire about ${p.name} (${categoryLabel(p.category)}, ${p.shape}, ${p.material}).`,
        `Colour: ${state.color}.`,
        lens ? `Lens: ${lens.name}.` : null,
        "Please share the price and availability.",
        absoluteUrl(productUrl(p))
      ];
      return lines.filter(Boolean).join("\n");
    }

    function updateEnquiry() {
      const lens = isEyeglass ? LENS_OPTIONS.find((l) => l.id === state.lens) : null;
      $("#enquirySummary").innerHTML = `<span>Colour: <b>${esc(state.color)}</b></span>${lens ? `<span>Lens: <b>${esc(lens.name)}</b></span>` : ""}<span>Price: <b>${priceLabel(p)}</b></span>`;
      $("#enquireBtn").setAttribute("href", waUrl(enquiryText()));
      $("#colorName").textContent = state.color;
    }

    root.addEventListener("click", (e) => {
      const c = e.target.closest("[data-color]");
      if (c) {
        state.color = c.dataset.color;
        $$("[data-color]", root).forEach((b) => b.setAttribute("aria-pressed", String(b === c)));
        updateEnquiry();
      }
    });
    root.addEventListener("change", (e) => {
      if (e.target.name === "lens") {
        state.lens = e.target.value;
        updateEnquiry();
      }
    });
    updateEnquiry();
    syncSaveButtons();

    const related = PRODUCTS.filter((x) => x.id !== p.id).sort((a, b) => (a.category === p.category ? -1 : 1) - (b.category === p.category ? -1 : 1)).slice(0, 3);
    $("#relatedGrid").innerHTML = related.map((x, i) => productCard(x, i)).join("");
    syncSaveButtons();
    observeReveals();
  }

  /* ---------- forms (validate, then WhatsApp handoff) ---------- */
  const RULES = {
    required: (v) => v.trim().length > 0 || "This field is required.",
    name: (v) => v.trim().length >= 2 || "Please enter your name.",
    phone: (v) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s()-]/g, "")) || "Enter a valid 10-digit mobile number.",
    future: (v) => !v || v >= new Date().toISOString().slice(0, 10) || "Choose today or a later date."
  };

  function bindWaForm(form, build) {
    const success = form.parentElement.querySelector(".form-success");
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$("[data-rule]", form).forEach((field) => {
        const rules = field.dataset.rule.split(" ");
        const errEl = document.getElementById(`err-${field.name}`);
        let msg = true;
        for (const r of rules) {
          const res = RULES[r](field.value);
          if (res !== true) { msg = res; break; }
        }
        field.setAttribute("aria-invalid", String(msg !== true));
        if (errEl) errEl.textContent = msg === true ? "" : msg;
        if (msg !== true) ok = false;
      });
      if (!ok) {
        const first = $("[aria-invalid='true']", form);
        first && first.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      const url = waUrl(build(data));
      const link = $("[data-success-wa]", success);
      if (link) link.href = url;
      success.classList.add("is-on");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
      window.open(url, "_blank", "noopener");
      form.reset();
    });
    form.addEventListener("input", (e) => {
      const field = e.target;
      if (field.getAttribute("aria-invalid") === "true") {
        field.setAttribute("aria-invalid", "false");
        const errEl = document.getElementById(`err-${field.name}`);
        if (errEl) errEl.textContent = "";
      }
    });
  }

  function bindForms() {
    const contact = $("#contactForm");
    if (contact) {
      bindWaForm(contact, (d) =>
        `Hello Optical Zone, my name is ${d.name} (${d.phone}).\nTopic: ${d.topic}.${d.message ? `\n${d.message}` : ""}`
      );
    }
    const booking = $("#eyeTestForm");
    if (booking) {
      const date = booking.querySelector('input[name="date"]');
      if (date) date.min = new Date().toISOString().slice(0, 10);
      bindWaForm(booking, (d) =>
        `Hello Optical Zone, I'd like to book an eye test.\nName: ${d.name}\nPhone: ${d.phone}\nPreferred date: ${d.date || "any day"}\nPreferred time: ${d.slot}\nReason: ${d.reason}${d.notes ? `\nNotes: ${d.notes}` : ""}`
      );
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    document.body.classList.remove("no-js");
    bindBusiness();
    updateCounts();
    updateStatus();
    setInterval(updateStatus, 60 * 1000);
    bindShell();
    bindForms();
    renderFeatured();
    renderEyeSteps();
    renderFaqs();
    initFinder();
    initShop();
    initPDP();
    renderSaved();
    syncSaveButtons();
    observeReveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
