const STORAGE_KEYS = {
  events: "event-manager-a/events",
  participantName: "event-manager-a/participant-name",
};

const DEFAULT_PARTICIPANT_NAME = "研修 太郎";

const defaultEvents = () => {
  const now = new Date();
  const plusDays = (days, hour, minute) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: crypto.randomUUID(),
      title: "会計プロダクト勉強会",
      description:
        "プロダクトの全体像を理解するための社内勉強会です。主要画面、利用部門、典型的なユースケースを共有します。",
      venue: "会議室 A",
      capacity: 12,
      startAt: plusDays(2, 10, 0),
      endAt: plusDays(2, 11, 30),
      participants: ["研修 太郎"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "品質保証ハンズオン",
      description:
        "障害報告から再現確認、切り分け、報告文作成までを体験するミニ演習です。",
      venue: "オンライン",
      capacity: 8,
      startAt: plusDays(4, 14, 0),
      endAt: plusDays(4, 16, 0),
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "先輩社員ヒアリング会",
      description:
        "プロジェクトの立ち上がり時に、どのような確認をしているかを先輩社員に聞くセッションです。",
      venue: "会議室 B",
      capacity: 6,
      startAt: plusDays(-2, 13, 30),
      endAt: plusDays(-2, 14, 30),
      participants: ["分析 花子"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const state = {
  events: [],
  search: "",
  statusFilter: "all",
  selectedEventId: null,
};

const els = {
  eventList: document.getElementById("eventList"),
  emptyState: document.getElementById("emptyState"),
  listDescription: document.getElementById("listDescription"),
  eventDialog: document.getElementById("eventDialog"),
  detailDialog: document.getElementById("detailDialog"),
  eventForm: document.getElementById("eventForm"),
  openCreateButton: document.getElementById("openCreateButton"),
  closeDialogButton: document.getElementById("closeDialogButton"),
  cancelDialogButton: document.getElementById("cancelDialogButton"),
  closeDetailButton: document.getElementById("closeDetailButton"),
  detailJoinButton: document.getElementById("detailJoinButton"),
  detailEditButton: document.getElementById("detailEditButton"),
  detailDeleteButton: document.getElementById("detailDeleteButton"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  participantName: document.getElementById("participantName"),
  seedButton: document.getElementById("seedButton"),
  dialogTitle: document.getElementById("dialogTitle"),
  detailTitle: document.getElementById("detailTitle"),
  detailVenue: document.getElementById("detailVenue"),
  detailStart: document.getElementById("detailStart"),
  detailEnd: document.getElementById("detailEnd"),
  detailCapacity: document.getElementById("detailCapacity"),
  detailStatus: document.getElementById("detailStatus"),
  detailDescription: document.getElementById("detailDescription"),
  detailParticipants: document.getElementById("detailParticipants"),
  summaryEvents: document.getElementById("summaryEvents"),
  summaryJoined: document.getElementById("summaryJoined"),
  summaryUpcoming: document.getElementById("summaryUpcoming"),
  smokePanel: document.getElementById("smokePanel"),
  smokeOutput: document.getElementById("smokeOutput"),
};

const formFields = {
  eventId: document.getElementById("eventId"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  venue: document.getElementById("venue"),
  capacity: document.getElementById("capacity"),
  startAt: document.getElementById("startAt"),
  endAt: document.getElementById("endAt"),
};

function loadEvents() {
  const stored = localStorage.getItem(STORAGE_KEYS.events);
  if (!stored) {
    const initialEvents = defaultEvents();
    saveEvents(initialEvents);
    return initialEvents;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultEvents();
  } catch {
    const fallback = defaultEvents();
    saveEvents(fallback);
    return fallback;
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  state.events = events;
}

function getParticipantName() {
  const name = (els.participantName.value || "").trim();
  return name || DEFAULT_PARTICIPANT_NAME;
}

function persistParticipantName(name) {
  localStorage.setItem(STORAGE_KEYS.participantName, name);
}

function restoreParticipantName() {
  const stored = localStorage.getItem(STORAGE_KEYS.participantName);
  const name = stored?.trim() || DEFAULT_PARTICIPANT_NAME;
  els.participantName.value = name;
}

function getEventById(id) {
  return state.events.find((event) => event.id === id) || null;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getEventStatus(event) {
  const now = Date.now();
  const isPast = new Date(event.endAt).getTime() < now;
  const isFull = event.participants.length >= Number(event.capacity);
  if (isPast) return "past";
  if (isFull) return "full";
  return "upcoming";
}

function getStatusLabel(status) {
  switch (status) {
    case "past":
      return "終了済み";
    case "full":
      return "満員";
    default:
      return "開催予定";
  }
}

function eventMatchesSearch(event, keyword) {
  if (!keyword) return true;
  const haystack = [event.title, event.venue, event.description].join(" ").toLowerCase();
  return haystack.includes(keyword.toLowerCase());
}

function getFilteredEvents() {
  return [...state.events]
    .filter((event) => eventMatchesSearch(event, state.search))
    .filter((event) => {
      if (state.statusFilter === "all") return true;
      return getEventStatus(event) === state.statusFilter;
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

function updateSummary() {
  const participantName = getParticipantName();
  const joinedCount = state.events.filter((event) => event.participants.includes(participantName)).length;
  const upcomingCount = state.events.filter((event) => getEventStatus(event) === "upcoming").length;
  els.summaryEvents.textContent = String(state.events.length);
  els.summaryJoined.textContent = String(joinedCount);
  els.summaryUpcoming.textContent = String(upcomingCount);
}

function renderEvents() {
  const events = getFilteredEvents();
  els.eventList.innerHTML = "";
  els.listDescription.textContent = `現在 ${events.length} 件のイベントを表示しています。`;

  if (events.length === 0) {
    els.emptyState.classList.remove("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");
  const participantName = getParticipantName();

  for (const event of events) {
    const status = getEventStatus(event);
    const isJoined = event.participants.includes(participantName);

    const card = document.createElement("article");
    card.className = "event-card";
    card.innerHTML = `
      <div class="event-top">
        <div>
          <h3>${escapeHtml(event.title)}</h3>
          <div class="event-meta">
            <span class="pill ${status}">${getStatusLabel(status)}</span>
            <span class="pill">${escapeHtml(event.venue)}</span>
            <span class="pill">${formatDateTime(event.startAt)}</span>
            <span class="pill ${isJoined ? "joined" : ""}">
              参加 ${event.participants.length}/${event.capacity}
            </span>
          </div>
        </div>
      </div>
      <p class="event-description">${escapeHtml(trimText(event.description, 120))}</p>
      <div class="event-actions">
        <button data-action="detail" data-id="${event.id}">詳細を見る</button>
        <button data-action="edit" data-id="${event.id}">編集する</button>
        <button data-action="${isJoined ? "cancel" : "join"}" data-id="${event.id}" class="${isJoined ? "" : "primary-action"}">
          ${isJoined ? "参加をキャンセル" : "参加する"}
        </button>
        <button data-action="delete" data-id="${event.id}" class="delete-action">削除する</button>
      </div>
    `;
    els.eventList.appendChild(card);
  }

  updateSummary();
}

function trimText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resetForm() {
  els.dialogTitle.textContent = "新しいイベントを作成";
  els.eventForm.reset();
  formFields.eventId.value = "";
  clearFormErrors();
}

function fillForm(event) {
  els.dialogTitle.textContent = "イベントを編集";
  formFields.eventId.value = event.id;
  formFields.title.value = event.title;
  formFields.description.value = event.description;
  formFields.venue.value = event.venue;
  formFields.capacity.value = String(event.capacity);
  formFields.startAt.value = toDateTimeLocalValue(event.startAt);
  formFields.endAt.value = toDateTimeLocalValue(event.endAt);
  clearFormErrors();
}

function toDateTimeLocalValue(isoString) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function openCreateDialog() {
  resetForm();
  els.eventDialog.showModal();
}

function openEditDialog(eventId) {
  const event = getEventById(eventId);
  if (!event) return;
  fillForm(event);
  els.eventDialog.showModal();
}

function openDetailDialog(eventId) {
  const event = getEventById(eventId);
  if (!event) return;

  state.selectedEventId = eventId;
  const status = getEventStatus(event);
  const participantName = getParticipantName();
  const isJoined = event.participants.includes(participantName);

  els.detailTitle.textContent = event.title;
  els.detailVenue.textContent = event.venue;
  els.detailStart.textContent = formatDateTime(event.startAt);
  els.detailEnd.textContent = formatDateTime(event.endAt);
  els.detailCapacity.textContent = `${event.participants.length}/${event.capacity}`;
  els.detailStatus.textContent = getStatusLabel(status);
  els.detailDescription.textContent = event.description;
  els.detailParticipants.innerHTML = event.participants.length
    ? event.participants.map((name) => `<li>${escapeHtml(name)}</li>`).join("")
    : "<li>まだ参加者はいません。</li>";
  els.detailJoinButton.textContent = isJoined ? "参加をキャンセル" : "参加する";
  els.detailJoinButton.dataset.action = isJoined ? "cancel" : "join";

  els.detailDialog.showModal();
}

function clearFormErrors() {
  for (const errorNode of document.querySelectorAll(".error-message")) {
    errorNode.textContent = "";
  }
}

function setFormError(fieldName, message) {
  const node = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (node) node.textContent = message;
}

function validateEventForm() {
  clearFormErrors();

  const raw = {
    title: formFields.title.value.trim(),
    description: formFields.description.value.trim(),
    venue: formFields.venue.value.trim(),
    capacity: Number(formFields.capacity.value),
    startAt: formFields.startAt.value,
    endAt: formFields.endAt.value,
  };

  let isValid = true;

  if (!raw.title) {
    setFormError("title", "タイトルは必須です。");
    isValid = false;
  }

  if (!raw.description) {
    setFormError("description", "説明は必須です。");
    isValid = false;
  } else if (raw.description.length < 10) {
    setFormError("description", "説明は10文字以上で入力してください。");
    isValid = false;
  }

  if (!raw.venue) {
    setFormError("venue", "会場は必須です。");
    isValid = false;
  }

  if (!Number.isInteger(raw.capacity) || raw.capacity < 1 || raw.capacity > 500) {
    setFormError("capacity", "定員は1〜500の整数で入力してください。");
    isValid = false;
  }

  if (!raw.startAt) {
    setFormError("startAt", "開始日時は必須です。");
    isValid = false;
  }

  if (!raw.endAt) {
    setFormError("endAt", "終了日時は必須です。");
    isValid = false;
  }

  if (raw.startAt && raw.endAt) {
    const start = new Date(raw.startAt).getTime();
    const end = new Date(raw.endAt).getTime();
    if (!(start < end)) {
      setFormError("endAt", "終了日時は開始日時より後にしてください。");
      isValid = false;
    }
  }

  return { isValid, raw };
}

function saveEventFromForm() {
  const { isValid, raw } = validateEventForm();
  if (!isValid) return;

  const eventId = formFields.eventId.value;
  const nowIso = new Date().toISOString();

  if (eventId) {
    const updatedEvents = state.events.map((event) => {
      if (event.id !== eventId) return event;
      return {
        ...event,
        ...raw,
        startAt: new Date(raw.startAt).toISOString(),
        endAt: new Date(raw.endAt).toISOString(),
        updatedAt: nowIso,
      };
    });
    saveEvents(updatedEvents);
  } else {
    const newEvent = {
      id: crypto.randomUUID(),
      title: raw.title,
      description: raw.description,
      venue: raw.venue,
      capacity: raw.capacity,
      startAt: new Date(raw.startAt).toISOString(),
      endAt: new Date(raw.endAt).toISOString(),
      participants: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    saveEvents([newEvent, ...state.events]);
  }

  els.eventDialog.close();
  renderEvents();
}

function joinEvent(eventId) {
  const participantName = getParticipantName();
  if (!participantName.trim()) return;
  persistParticipantName(participantName);

  const updatedEvents = state.events.map((event) => {
    if (event.id !== eventId) return event;
    if (event.participants.includes(participantName)) return event;
    if (event.participants.length >= Number(event.capacity)) {
      alert("このイベントは満員です。");
      return event;
    }
    return {
      ...event,
      participants: [...event.participants, participantName],
      updatedAt: new Date().toISOString(),
    };
  });

  saveEvents(updatedEvents);
  renderEvents();
  if (els.detailDialog.open && state.selectedEventId === eventId) openDetailDialog(eventId);
}

function cancelEvent(eventId) {
  const participantName = getParticipantName();
  persistParticipantName(participantName);

  const updatedEvents = state.events.map((event) => {
    if (event.id !== eventId) return event;
    return {
      ...event,
      participants: event.participants.filter((name) => name !== participantName),
      updatedAt: new Date().toISOString(),
    };
  });

  saveEvents(updatedEvents);
  renderEvents();
  if (els.detailDialog.open && state.selectedEventId === eventId) openDetailDialog(eventId);
}

function deleteEvent(eventId) {
  const event = getEventById(eventId);
  if (!event) return;
  const ok = confirm(`「${event.title}」を削除します。よろしいですか？`);
  if (!ok) return;

  saveEvents(state.events.filter((item) => item.id !== eventId));
  if (els.detailDialog.open) els.detailDialog.close();
  renderEvents();
}

function seedInitialData() {
  const ok = confirm("現在のデータを削除して、サンプルデータに戻します。よろしいですか？");
  if (!ok) return;
  const events = defaultEvents();
  saveEvents(events);
  renderEvents();
}

function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (!id || !action) return;

  if (action === "detail") openDetailDialog(id);
  if (action === "edit") openEditDialog(id);
  if (action === "join") joinEvent(id);
  if (action === "cancel") cancelEvent(id);
  if (action === "delete") deleteEvent(id);
}

function attachEventListeners() {
  els.openCreateButton.addEventListener("click", openCreateDialog);
  els.closeDialogButton.addEventListener("click", () => els.eventDialog.close());
  els.cancelDialogButton.addEventListener("click", () => els.eventDialog.close());
  els.closeDetailButton.addEventListener("click", () => els.detailDialog.close());
  els.seedButton.addEventListener("click", seedInitialData);

  els.eventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEventFromForm();
  });

  els.eventList.addEventListener("click", handleListClick);

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    renderEvents();
  });

  els.statusFilter.addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    renderEvents();
  });

  els.participantName.addEventListener("input", (event) => {
    persistParticipantName(event.target.value.trim() || DEFAULT_PARTICIPANT_NAME);
    renderEvents();
  });

  els.detailJoinButton.addEventListener("click", () => {
    if (!state.selectedEventId) return;
    if (els.detailJoinButton.dataset.action === "cancel") {
      cancelEvent(state.selectedEventId);
    } else {
      joinEvent(state.selectedEventId);
    }
  });

  els.detailEditButton.addEventListener("click", () => {
    if (!state.selectedEventId) return;
    els.detailDialog.close();
    openEditDialog(state.selectedEventId);
  });

  els.detailDeleteButton.addEventListener("click", () => {
    if (!state.selectedEventId) return;
    deleteEvent(state.selectedEventId);
  });
}

function initialize() {
  state.events = loadEvents();
  restoreParticipantName();
  attachEventListeners();
  renderEvents();
}

function runSmokeTestIfNeeded() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("smoke") !== "1") return;

  const lines = [];
  const assert = (condition, label) => {
    lines.push(`${condition ? "PASS" : "FAIL"} | ${label}`);
  };

  const smokeParticipant = "スモーク テスター";
  els.participantName.value = smokeParticipant;
  persistParticipantName(smokeParticipant);

  const baseEvents = defaultEvents();
  saveEvents(baseEvents);

  const newEvent = {
    id: crypto.randomUUID(),
    title: "Smoke Test Event",
    description: "スモークテスト用のイベントです。説明文は10文字以上あります。",
    venue: "検証ルーム",
    capacity: 3,
    startAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveEvents([newEvent, ...state.events]);
  assert(getEventById(newEvent.id) !== null, "イベント作成が保存される");

  joinEvent(newEvent.id);
  assert(getEventById(newEvent.id).participants.includes(smokeParticipant), "イベント参加が保存される");

  cancelEvent(newEvent.id);
  assert(!getEventById(newEvent.id).participants.includes(smokeParticipant), "参加キャンセルが保存される");

  saveEvents(
    state.events.map((event) =>
      event.id === newEvent.id
        ? {
            ...event,
            title: "Smoke Test Event Updated",
            updatedAt: new Date().toISOString(),
          }
        : event
    )
  );
  assert(getEventById(newEvent.id).title === "Smoke Test Event Updated", "イベント編集が保存される");

  saveEvents(state.events.filter((event) => event.id !== newEvent.id));
  assert(getEventById(newEvent.id) === null, "イベント削除が保存される");

  renderEvents();
  els.smokePanel.classList.remove("hidden");
  els.smokeOutput.textContent = lines.join("\n");
}

initialize();
runSmokeTestIfNeeded();
