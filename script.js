// ---------- State ----------
const state = {
  name: "", role: "", location: "", bio: "",
  working: "", learning: "", collab: "", askme: "",
  skills: [],
  username: "",
  stats: { stats: true, streak: true, langs: true, trophy: false },
  theme: "dark",
  projects: [], // {name, desc, link}
  email: "", linkedin: "", twitter: "", portfolio: "",
  visitors: true,
  license: "",
  resume: "",
  typing: false, typingLines: "",
  snake: false,
  coffee: "", kofi: ""
};

// ---------- Element refs ----------
const $ = (id) => document.getElementById(id);
const els = {
  name: $("f-name"), role: $("f-role"), location: $("f-location"), bio: $("f-bio"),
  working: $("f-working"), learning: $("f-learning"), collab: $("f-collab"), askme: $("f-askme"),
  skillInput: $("f-skill-input"), skillChips: $("skill-chips"),
  username: $("f-username"), theme: $("f-theme"),
  statStats: $("f-stat-stats"), statStreak: $("f-stat-streak"), statLangs: $("f-stat-langs"), statTrophy: $("f-stat-trophy"),
  projectList: $("project-list"), addProject: $("add-project"),
  email: $("f-email"), linkedin: $("f-linkedin"), twitter: $("f-twitter"), portfolio: $("f-portfolio"),
  visitors: $("f-visitors"),
  license: $("f-license"), resume: $("f-resume"),
  typing: $("f-typing"), typingLines: $("f-typing-lines"),
  snake: $("f-snake"),
  coffee: $("f-coffee"), kofi: $("f-kofi"),
  previewRender: $("preview-render"), rawRender: $("raw-render"),
  fileBody: document.querySelector(".file-body"),
  commitMeta: $("commit-meta"),
  copyBtn: $("copy-btn"), downloadBtn: $("download-btn"),
  downloadWorkflowBtn: $("download-workflow-btn"),
  stepper: $("stepper"),
  themeToggle: $("theme-toggle")
};

// ---------- Stepper dots ----------
const steps = document.querySelectorAll(".step");
steps.forEach((_, i) => {
  const li = document.createElement("li");
  if (i === 0) li.classList.add("active");
  els.stepper.appendChild(li);
});
const stepperDots = els.stepper.querySelectorAll("li");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const idx = [...steps].indexOf(entry.target);
      stepperDots.forEach((d, i) => d.classList.toggle("active", i <= idx));
    }
  });
}, { root: document.querySelector(".form-panel"), threshold: 0.4 });
steps.forEach((s) => io.observe(s));

// ---------- Simple text bindings ----------
const bindText = (el, key) => {
  el.addEventListener("input", () => { state[key] = el.value; render(); });
};
bindText(els.name, "name");
bindText(els.role, "role");
bindText(els.location, "location");
bindText(els.bio, "bio");
bindText(els.working, "working");
bindText(els.learning, "learning");
bindText(els.collab, "collab");
bindText(els.askme, "askme");
bindText(els.username, "username");
bindText(els.email, "email");
bindText(els.linkedin, "linkedin");
bindText(els.twitter, "twitter");
bindText(els.portfolio, "portfolio");
bindText(els.resume, "resume");
bindText(els.typingLines, "typingLines");
bindText(els.coffee, "coffee");
bindText(els.kofi, "kofi");

els.license.addEventListener("change", () => { state.license = els.license.value; render(); });
els.typing.addEventListener("change", () => { state.typing = els.typing.checked; render(); });
els.snake.addEventListener("change", () => {
  state.snake = els.snake.checked;
  els.downloadWorkflowBtn.hidden = !state.snake;
  render();
});

els.theme.addEventListener("change", () => { state.theme = els.theme.value; render(); });
els.statStats.addEventListener("change", () => { state.stats.stats = els.statStats.checked; render(); });
els.statStreak.addEventListener("change", () => { state.stats.streak = els.statStreak.checked; render(); });
els.statLangs.addEventListener("change", () => { state.stats.langs = els.statLangs.checked; render(); });
els.statTrophy.addEventListener("change", () => { state.stats.trophy = els.statTrophy.checked; render(); });
els.visitors.addEventListener("change", () => { state.visitors = els.visitors.checked; render(); });

// ---------- Skill chips ----------
els.skillInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = els.skillInput.value.trim();
    if (val && !state.skills.includes(val)) {
      state.skills.push(val);
      els.skillInput.value = "";
      renderChips();
      render();
    }
  }
});
function renderChips() {
  els.skillChips.innerHTML = "";
  state.skills.forEach((skill, i) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `${escapeHtml(skill)} <button type="button" aria-label="Remove ${escapeHtml(skill)}">&times;</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      state.skills.splice(i, 1);
      renderChips();
      render();
    });
    els.skillChips.appendChild(chip);
  });
}

// ---------- Projects ----------
function addProjectRow(data = { name: "", desc: "", link: "" }) {
  const idx = state.projects.length;
  state.projects.push(data);
  renderProjectRows();
}
function renderProjectRows() {
  els.projectList.innerHTML = "";
  state.projects.forEach((proj, i) => {
    const row = document.createElement("div");
    row.className = "project-row";
    row.innerHTML = `
      <button type="button" class="remove-project" aria-label="Remove project">&times;</button>
      <label>Project name
        <input type="text" data-field="name" placeholder="task-tracker-cli" value="${escapeAttr(proj.name)}" />
      </label>
      <label>One-line description
        <input type="text" data-field="desc" placeholder="A terminal task tracker with sync" value="${escapeAttr(proj.desc)}" />
      </label>
      <label>Repo / live link
        <input type="text" data-field="link" placeholder="https://github.com/you/task-tracker-cli" value="${escapeAttr(proj.link)}" />
      </label>
    `;
    row.querySelector(".remove-project").addEventListener("click", () => {
      state.projects.splice(i, 1);
      renderProjectRows();
      render();
    });
    row.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        state.projects[i][input.dataset.field] = input.value;
        render();
      });
    });
    els.projectList.appendChild(row);
  });
}
els.addProject.addEventListener("click", () => addProjectRow());

// ---------- Helpers ----------
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) { return escapeHtml(str || ""); }
function slug(str) { return (str || "").trim().replace(/\s+/g, "-"); }

// ---------- Markdown generation ----------
function generateMarkdown() {
  const s = state;
  const lines = [];

  if (s.name) lines.push(`# Hi, I'm ${s.name} 👋`);
  else lines.push(`# Hi there 👋`);

  if (s.license) {
    const label = encodeURIComponent(s.license);
    lines.push(`\n![License](https://img.shields.io/badge/License-${label}-blue?style=flat-square)`);
  }

  if (s.typing && s.typingLines.trim()) {
    const phrases = s.typingLines.split(",").map((p) => p.trim()).filter(Boolean).map((p) => p.replace(/\s/g, "+"));
    if (phrases.length) {
      lines.push(`\n[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=6B7280&center=true&vCenter=true&width=460&lines=${phrases.join(";")})](https://git.io/typing-svg)`);
    }
  }

  const subline = [s.role, s.location].filter(Boolean).join(" · ");
  if (subline) lines.push(`\n**${subline}**`);
  if (s.bio) lines.push(`\n${s.bio}`);

  const focusLines = [];
  if (s.working) focusLines.push(`- 🔭 Currently working on **${s.working}**`);
  if (s.learning) focusLines.push(`- 🌱 Currently learning **${s.learning}**`);
  if (s.collab) focusLines.push(`- 👯 Open to collaborate on **${s.collab}**`);
  if (s.askme) focusLines.push(`- 💬 Ask me about **${s.askme}**`);
  if (s.email) focusLines.push(`- 📫 Reach me at **${s.email}**`);
  if (focusLines.length) {
    lines.push(`\n## What I'm up to\n`);
    lines.push(focusLines.join("\n"));
  }

  if (s.skills.length) {
    lines.push(`\n## Skills\n`);
    const badges = s.skills.map((skill) => {
      const label = encodeURIComponent(skill);
      return `![${skill}](https://img.shields.io/badge/-${label}-1c1f27?style=flat-square)`;
    });
    lines.push(badges.join(" "));
  }

  if (s.username && (s.stats.stats || s.stats.streak || s.stats.langs || s.stats.trophy)) {
    lines.push(`\n## GitHub stats\n`);
    const u = s.username.trim();
    const theme = s.theme;
    if (s.stats.stats) {
      lines.push(`![${u}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&theme=${theme}&hide_border=true)`);
    }
    if (s.stats.streak) {
      lines.push(`![${u}'s streak](https://github-readme-streak-stats.herokuapp.com/?user=${u}&theme=${theme}&hide_border=true)`);
    }
    if (s.stats.langs) {
      lines.push(`![Top langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&layout=compact&theme=${theme}&hide_border=true)`);
    }
    if (s.stats.trophy) {
      lines.push(`![Trophies](https://github-profile-trophy.vercel.app/?username=${u}&theme=${theme === "default" ? "flat" : theme}&no-frame=true)`);
    }
  }

  if (s.snake && s.username) {
    const u = s.username.trim();
    lines.push(`\n## Contribution snake\n`);
    lines.push(`![Contribution snake](https://raw.githubusercontent.com/${u}/${u}/output/github-contribution-grid-snake.svg)`);
  }

  const validProjects = s.projects.filter((p) => p.name);
  if (validProjects.length) {
    lines.push(`\n## Projects\n`);
    validProjects.forEach((p) => {
      const nameLink = p.link ? `[${p.name}](${p.link})` : `**${p.name}**`;
      lines.push(`- ${nameLink}${p.desc ? ` — ${p.desc}` : ""}`);
    });
  }

  const social = [];
  if (s.linkedin) social.push(`[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/${slug(s.linkedin)})`);
  if (s.twitter) social.push(`[![X](https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/${slug(s.twitter)})`);
  if (s.portfolio) social.push(`[![Portfolio](https://img.shields.io/badge/Portfolio-F2A65A?style=flat-square&logo=About.me&logoColor=white)](${s.portfolio})`);
  if (s.email) social.push(`[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:${s.email})`);
  if (s.resume) social.push(`[![Resume](https://img.shields.io/badge/Resume-View-F2A65A?style=flat-square&logo=readdotcv&logoColor=white)](${s.resume})`);
  if (s.coffee) social.push(`[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/${slug(s.coffee)})`);
  if (s.kofi) social.push(`[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=flat-square&logo=kofi&logoColor=white)](https://ko-fi.com/${slug(s.kofi)})`);
  if (social.length) {
    lines.push(`\n## Connect\n`);
    lines.push(social.join(" "));
  }

  if (s.visitors && s.username) {
    lines.push(`\n---\n`);
    lines.push(`![Profile views](https://komarev.com/ghpvc/?username=${s.username.trim()}&color=6b7280&style=flat-square)`);
  }

  return lines.join("\n");
}

// ---------- Render ----------
let lastUpdate = Date.now();
function render() {
  const md = generateMarkdown();
  const hasContent = state.name || state.role || state.bio || state.skills.length || state.projects.some(p => p.name);

  if (!hasContent) {
    els.previewRender.innerHTML = `<p class="empty-state">Fill in the form — your README builds itself here</p>`;
  } else {
    els.previewRender.innerHTML = marked.parse(md);
  }
  els.rawRender.value = md;
  lastUpdate = Date.now();
}

setInterval(() => {
  const secs = Math.round((Date.now() - lastUpdate) / 1000);
  els.commitMeta.textContent = `generated live • ${secs}s ago`;
}, 1000);

// ---------- Tabs (preview / raw) ----------
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    els.fileBody.classList.toggle("show-raw", tab.dataset.view === "raw");
  });
});

// ---------- Copy / Download ----------
els.copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.rawRender.value);
  const original = els.copyBtn.textContent;
  els.copyBtn.textContent = "Copied ✓";
  setTimeout(() => { els.copyBtn.textContent = original; }, 1500);
});

els.downloadBtn.addEventListener("click", () => {
  const blob = new Blob([els.rawRender.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "README.md";
  a.click();
  URL.revokeObjectURL(url);
});

// ---------- App theme toggle (light/dark) ----------
(function initTheme() {
  const saved = localStorage.getItem("readme-gen-theme");
  const preferred = saved || "light";
  document.documentElement.setAttribute("data-theme", preferred);
})();
els.themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("readme-gen-theme", next);
});

// ---------- Snake workflow download ----------
function generateSnakeWorkflow(username) {
  return `name: Generate Snake

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    steps:
      - name: Generate snake animation
        uses: Platane/snk@v3
        with:
          github_user_name: \${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg

      - name: Push to output branch
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

els.downloadWorkflowBtn.addEventListener("click", () => {
  const yml = generateSnakeWorkflow(state.username || "your-username");
  const blob = new Blob([yml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "snake.yml";
  a.click();
  URL.revokeObjectURL(url);
});

// ---------- Init ----------
addProjectRow({ name: "", desc: "", link: "" });
render();