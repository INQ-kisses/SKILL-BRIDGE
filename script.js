/* =========================================================
   SkillBridge HR — interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2400);
  }

  /* ---------- Routing (hash based) ---------- */
  const VIEWS = ["passport", "marketplace", "mentorship", "pathway", "dashboard"];

  function show(view) {
    if (!VIEWS.includes(view)) view = "passport";
    $$(".view").forEach(v => v.classList.toggle("is-active", v.dataset.view === view));
    $$(".nav__item").forEach(a => {
      const on = a.dataset.nav === view;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));

  /* ---------- 1. Talent Passport ---------- */
  const askBtn = $("#ask-endorse");
  askBtn.addEventListener("click", () => {
    if (askBtn.classList.contains("is-done")) return;
    askBtn.classList.add("is-done");
    askBtn.textContent = "Request sent";
    toast("Endorsement request sent to your manager");
  });

  const xdept = $("#xdept");
  xdept.addEventListener("click", () => {
    const on = xdept.getAttribute("aria-checked") !== "true";
    xdept.setAttribute("aria-checked", String(on));
    toast(on ? "You're visible for cross-department projects" : "Cross-department projects hidden");
  });

  /* ---------- 2. Job Marketplace ---------- */
  $$("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("[data-filter]").forEach(b => b.classList.toggle("is-active", b === btn));
      const f = btn.dataset.filter;
      $$(".job").forEach(job => { job.hidden = f !== "all" && job.dataset.type !== f; });
    });
  });

  $$(".js-apply").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-done")) return;
      const title = btn.closest(".job").querySelector(".job__title").textContent;
      btn.classList.add("is-done");
      btn.innerHTML = '<svg class="icon" style="width:16px;height:16px"><use href="#i-check"/></svg>Applied';
      toast(`Application sent: ${title}`);
    });
  });

  /* ---------- 3. Mentorship ---------- */
  const TALKING_POINTS = {
    "Marites Villanueva": [
      "How did you handle your first difficult team conversation?",
      "What would you do differently as a first-time team lead?",
      "Which skills should I build before the next Team Lead opening?"
    ],
    "Paolo Mercado": [
      "How do you coach someone who is new to leading a team?",
      "What does a strong first 90 days look like for a new lead?",
      "Which cross-department projects helped you grow the most?"
    ],
    "Lea Domingo": [
      "What does a typical quality audit look like day to day?",
      "Which mistakes do new QA analysts make most often?",
      "How should I prepare for the Quality Assurance Analyst role?"
    ]
  };

  $$(".mentor").forEach(card => {
    card.addEventListener("click", () => {
      $$(".mentor").forEach(m => {
        const on = m === card;
        m.classList.toggle("is-selected", on);
        m.setAttribute("aria-checked", String(on));
      });
      const name = card.dataset.mentor;
      $("#plan-mentor").textContent = name;
      $("#talking-points").innerHTML = TALKING_POINTS[name].map(t => `<li>${t}</li>`).join("");
    });
  });

  const milestones = $$(".milestone");
  function updatePlan() {
    const done = milestones.filter(m => m.getAttribute("aria-checked") === "true").length;
    $("#plan-count").textContent = `${done} of ${milestones.length} milestones`;
    $("#plan-bar").style.width = `${(done / milestones.length) * 100}%`;
  }
  milestones.forEach(m => {
    m.addEventListener("click", () => {
      m.setAttribute("aria-checked", String(m.getAttribute("aria-checked") !== "true"));
      updatePlan();
    });
  });

  /* ---------- 4. Career Pathway ---------- */
  const PATHS = {
    qa: {
      label: "QA Analyst",
      title: "What you need for Quality Assurance Analyst",
      reqs: [
        ["Skill", "Quality auditing", "Not on your passport yet", false],
        ["Skill", "Attention to detail", "Endorsed by your manager", true],
        ["Skill", "Data entry", "Endorsed by your manager", true],
        ["Experience", "2+ years in a support role", "You have 3 years", true],
        ["Training", "Six Sigma Green Belt", "Certification on file", true],
        ["Training", "Quality auditing basics", "Course available in the learning catalog", false]
      ],
      next: 'Complete "Quality auditing basics", then apply to the open Quality Assurance Analyst role.',
      btn: "View the open role",
      href: "#marketplace"
    },
    lead: {
      label: "Team Lead",
      title: "What you need for Team Lead, Customer Support",
      reqs: [
        ["Skill", "Leadership", "Self-reported · ask your manager to endorse", false],
        ["Skill", "Conflict handling", "Not on your passport yet", false],
        ["Skill", "Coaching", "Not on your passport yet", false],
        ["Experience", "2+ years in a support role", "You have 3 years", true],
        ["Training", "Customer De-escalation Workshop", "Completed in-company training", true],
        ["Training", "Conflict handling workshop", "Course available in the learning catalog", false]
      ],
      next: 'Book your first session with Marites Villanueva, then join the "Conflict handling workshop".',
      btn: "Find a mentor",
      href: "#mentorship"
    }
  };

  function renderPath(key) {
    const p = PATHS[key];
    $$("[data-target]").forEach(b => b.classList.toggle("is-active", b.dataset.target === key));
    $("#path-target").textContent = p.label;
    $("#req-title").textContent = p.title;
    $("#reqs").innerHTML = p.reqs.map(([type, name, desc, met]) => `
      <li class="req">
        <div>
          <div class="overline">${type}</div>
          <div class="req__name">${name}</div>
          <div class="req__desc">${desc}</div>
        </div>
        <span class="status ${met ? "status--met" : "status--gap"}">${met ? "Met" : "Gap"}</span>
      </li>`).join("");
    const met = p.reqs.filter(r => r[3]).length;
    const pct = Math.round((met / p.reqs.length) * 100);
    $("#ready-pct").textContent = `${pct}%`;
    $("#ready-sub").textContent = `${met} of ${p.reqs.length} requirements met`;
    $("#ready-bar").style.width = `${pct}%`;
    $("#next-text").textContent = p.next;
    const nb = $("#next-btn");
    nb.textContent = p.btn;
    nb.setAttribute("href", p.href);
  }
  $$("[data-target]").forEach(b => b.addEventListener("click", () => renderPath(b.dataset.target)));
  $$("[data-path-target]").forEach(a => a.addEventListener("click", () => renderPath(a.dataset.pathTarget)));
  renderPath("qa");

  /* ---------- 5. Talent Dashboard (sample data) ---------- */
  const DASH = {
    all: {
      stats: { fills: "14", saved: "₱640K", pairs: "38", passports: "76%" },
      gaps: [
        ["Conflict handling", "Conflict handling workshop", 50, 0],
        ["Coaching", "Coaching skills for new leads", 24, 6],
        ["Data analytics", "Intro to data analytics", 32, 9],
        ["Quality auditing", "Quality auditing basics", 18, 11]
      ],
      chart: [["Jun", 3, 6], ["Jul", 4, 6], ["Aug", 6, 5], ["Sep", 5, 5], ["Oct", 8, 4], ["Nov", 9, 3]],
      goal: [70, "7% reduction so far, 3 points to go"]
    },
    pilot: {
      stats: { fills: "5", saved: "₱210K", pairs: "12", passports: "91%" },
      gaps: [
        ["Conflict handling", "Conflict handling workshop", 18, 0],
        ["Coaching", "Coaching skills for new leads", 9, 2],
        ["Data analytics", "Intro to data analytics", 7, 3],
        ["Quality auditing", "Quality auditing basics", 11, 4]
      ],
      chart: [["Jun", 1, 3], ["Jul", 1, 2], ["Aug", 2, 2], ["Sep", 2, 2], ["Oct", 3, 1], ["Nov", 4, 1]],
      goal: [80, "8% reduction so far, 2 points to go"]
    }
  };

  function renderDash(scope) {
    const d = DASH[scope];
    $$("[data-scope]").forEach(b => b.classList.toggle("is-active", b.dataset.scope === scope));
    Object.entries(d.stats).forEach(([k, v]) => { $(`[data-stat="${k}"]`).textContent = v; });

    const maxWant = Math.max(...d.gaps.map(g => g[2]));
    $("#gaps").innerHTML = d.gaps.map(([name, tip, want, have]) => `
      <li class="gap-item">
        <div class="gap-item__head">
          <span class="gap-item__name">${name}</span>
          <span class="gap-item__tip">Suggested: ${tip}</span>
        </div>
        <div class="gbar"><div class="bar"><span class="bar__fill" style="width:${(want / maxWant) * 100}%"></span></div><span class="gbar__n">${want}</span></div>
        <div class="gbar gbar--have"><div class="bar"><span class="bar__fill" style="width:${(have / maxWant) * 100}%"></span></div><span class="gbar__n">${have}</span></div>
      </li>`).join("");

    const unit = 10; // px per hire
    $("#chart").innerHTML = d.chart.map(([m, inn, ext]) => `
      <div class="chart__col">
        <div class="chart__bars">
          <div class="chart__bar" style="height:${inn * unit}px"><span>${inn}</span></div>
          <div class="chart__bar chart__bar--ext" style="height:${ext * unit}px"><span>${ext}</span></div>
        </div>
        <div class="chart__month">${m}</div>
      </div>`).join("");

    $("#goal-bar").style.width = `${d.goal[0]}%`;
    $("#goal-text").textContent = d.goal[1];
  }
  $$("[data-scope]").forEach(b => b.addEventListener("click", () => renderDash(b.dataset.scope)));
  renderDash("all");

  /* ---------- Boot ---------- */
  show(location.hash.slice(1));
})();
