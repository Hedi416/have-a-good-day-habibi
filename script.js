const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clear");
const dateEl = document.getElementById("date");
const filters = document.querySelectorAll(".filter");
const addBtn = form.querySelector("button");
const progressFill = document.getElementById("progress-fill");
const progressBar = document.querySelector(".progress-bar");
const progressText = document.getElementById("progress-text");
const agendaForm = document.getElementById("agenda-form");
const agendaDate = document.getElementById("agenda-date");
const agendaTime = document.getElementById("agenda-time");
const agendaInput = document.getElementById("agenda-input");
const agendaList = document.getElementById("agenda-list");
const goAdd = document.getElementById("go-add");
const goAgenda = document.getElementById("go-agenda");
const goTop = document.getElementById("go-top");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let events = JSON.parse(localStorage.getItem("events") || "[]");
let filter = "all";

dateEl.textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const clockEl = document.getElementById("clock");
const handHour = document.getElementById("hand-hour");
const handMinute = document.getElementById("hand-minute");
const handSecond = document.getElementById("hand-second");
const watchFace = document.querySelector(".watch-face");

for (let h = 1; h <= 12; h++) {
  const num = document.createElement("span");
  num.className = "watch-number";
  num.textContent = h;
  const angle = h * 30;
  num.style.transform =
    "translate(-50%, -50%) rotate(" +
    angle +
    "deg) translateY(-26px) rotate(" +
    -angle +
    "deg)";
  watchFace.appendChild(num);
}

function updateClock() {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  handSecond.style.transform = "rotate(" + seconds * 6 + "deg)";
  handMinute.style.transform = "rotate(" + minutes * 6 + "deg)";
  handHour.style.transform = "rotate(" + hours * 30 + "deg)";

  clockEl.setAttribute("aria-label", "Clock: " + now.toLocaleTimeString("en-US"));
}
updateClock();
setInterval(updateClock, 1000);

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function todayString() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function visibleTasks() {
  if (filter === "active") return tasks.filter((t) => !t.done);
  if (filter === "completed") return tasks.filter((t) => t.done);
  return tasks;
}

function updateCount() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const remaining = total - done;

  count.textContent =
    total === 0
      ? "💌 No tasks yet"
      : remaining === 0
      ? "💕 All done!"
      : "💗 " + remaining + (remaining === 1 ? " task left 💌" : " tasks left 💌");
  count.classList.remove("pop");
  void count.offsetWidth;
  count.classList.add("pop");

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  progressFill.style.width = percent + "%";
  progressBar.setAttribute("aria-valuenow", percent);
  progressText.textContent =
    done + " / " + total + " · " + percent + "%" + (percent === 100 && total > 0 ? " 💖" : "");
}

function burst(x, y) {
  const emojis = ["💖", "💕", "💘", "💝", "❤️", "🌹", "✨", "💫"];
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = x + "px";
    s.style.top = y + "px";
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    s.style.setProperty("--dy", Math.sin(angle) * dist - 20 + "px");
    s.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

function render(animate = true) {
  list.innerHTML = "";
  const shown = visibleTasks();

  if (shown.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent =
      filter === "completed"
        ? "💌 No completed tasks."
        : filter === "active"
        ? "💖 No tasks to do. Well done!"
        : "💕 No tasks yet.";
    list.appendChild(empty);
  }

  shown.forEach((task, i) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");
    li.dataset.id = task.id;
    if (animate) {
      li.style.setProperty("--delay", Math.min(i * 70, 420) + "ms");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      save();
      if (task.done) {
        const r = emoji.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2);
        emoji.textContent = "💖";
        emoji.className = "emoji done";
        li.classList.add("done", "celebrate");
        setTimeout(() => li.classList.remove("celebrate"), 650);
      } else {
        emoji.textContent = "💗";
        emoji.className = "emoji pending";
        li.classList.remove("done");
      }
      updateCount();
      if (tasks.length > 0 && tasks.every((t) => t.done)) {
        burst(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2), 220);
      }
      if (filter !== "all") setTimeout(() => render(false), 500);
    });

    const emoji = document.createElement("span");
    emoji.className = "emoji " + (task.done ? "done" : "pending");
    emoji.textContent = task.done ? "💖" : "💗";

    const label = document.createElement("span");
    label.className = "task-label";
    label.textContent = task.text;
    label.title = "Double-click to edit";

    label.addEventListener("dblclick", () => {
      label.contentEditable = "true";
      label.focus();
      const range = document.createRange();
      range.selectNodeContents(label);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });

    label.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        label.blur();
      } else if (e.key === "Escape") {
        label.textContent = task.text;
        label.blur();
      }
    });

    label.addEventListener("blur", () => {
      label.contentEditable = "false";
      const newText = label.textContent.trim();
      if (newText && newText !== task.text) {
        task.text = newText;
        save();
      } else {
        label.textContent = task.text;
      }
    });

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "\u2715";
    del.setAttribute("aria-label", "Delete");
    del.addEventListener("click", () => {
      li.classList.add("removing");
      setTimeout(() => {
        tasks = tasks.filter((t) => t.id !== task.id);
        save();
        render(false);
      }, 320);
    });

    li.append(checkbox, emoji, label, del);
    list.appendChild(li);
  });

  updateCount();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  save();
  render(false);
});

function renderAgenda() {
  agendaList.innerHTML = "";
  const today = todayString();

  if (events.length === 0) {
    const empty = document.createElement("li");
    empty.className = "agenda-empty";
    empty.textContent = "🗓️ No events planned. Add your first moment 💕";
    agendaList.appendChild(empty);
    return;
  }

  events
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
    .forEach((ev) => {
      const li = document.createElement("li");
      li.className = "event";

      const badge = document.createElement("span");
      badge.className = "event-date";
      const d = new Date(ev.date + "T00:00:00");
      badge.textContent =
        d.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short"
        }) + (ev.time ? " · " + ev.time : "");
      if (ev.date === today) badge.classList.add("today");

      const text = document.createElement("span");
      text.className = "event-text";
      text.textContent = ev.text;

      const del = document.createElement("button");
      del.className = "event-delete";
      del.textContent = "\u2715";
      del.setAttribute("aria-label", "Delete event");
      del.addEventListener("click", () => {
        events = events.filter((e) => e.id !== ev.id);
        saveEvents();
        renderAgenda();
      });

      li.append(badge, text, del);
      agendaList.appendChild(li);
    });
}

agendaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = agendaDate.value;
  const time = agendaTime.value;
  const text = agendaInput.value.trim();
  if (!date || !text) return;
  events.push({ id: Date.now(), date, time, text });
  saveEvents();
  agendaInput.value = "";
  agendaTime.value = "";
  renderAgenda();
});

agendaDate.value = todayString();

goAdd.addEventListener("click", () => {
  input.scrollIntoView({ behavior: "smooth", block: "center" });
  input.focus({ preventScroll: true });
});

goAgenda.addEventListener("click", () => {
  agendaInput.scrollIntoView({ behavior: "smooth", block: "center" });
  agendaInput.focus({ preventScroll: true });
});

goTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

addBtn.addEventListener("click", (e) => {
  const rect = addBtn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";
  addBtn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filters.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
    render(true);
  });
});

clearBtn.addEventListener("click", () => {
  list.querySelectorAll(".task.done").forEach((li) => li.classList.add("removing"));
  setTimeout(() => {
    tasks = tasks.filter((t) => !t.done);
    save();
    render(false);
  }, 320);
});

const bgEmojis = ["💖", "💕", "💘", "💝", "❤️", "🌹", "💐", "✨", "💞", "😍", "💓", "🌸"];
function spawnBgEmoji() {
  const el = document.createElement("span");
  el.className = "bg-emoji";
  el.textContent = bgEmojis[Math.floor(Math.random() * bgEmojis.length)];
  el.style.left = Math.random() * 100 + "vw";
  el.style.fontSize = 16 + Math.random() * 26 + "px";
  el.style.animationDuration = 8 + Math.random() * 8 + "s";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}
for (let i = 0; i < 6; i++) setTimeout(spawnBgEmoji, i * 350);
setInterval(spawnBgEmoji, 900);

render();
renderAgenda();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
