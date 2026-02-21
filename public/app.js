const apiBase = "/api/v1";

const state = {
  token: sessionStorage.getItem("authToken") || "",
  user: null,
  editingTaskId: null,
  selectedAdminUserId: null,
};

const ui = {
  messages: document.getElementById("messages"),
  authGate: document.getElementById("authGate"),
  registerForm: document.getElementById("registerForm"),
  loginForm: document.getElementById("loginForm"),
  dashboard: document.getElementById("dashboard"),
  userMeta: document.getElementById("userMeta"),
  logoutButton: document.getElementById("logoutButton"),
  adminCheckButton: document.getElementById("adminCheckButton"),
  taskForm: document.getElementById("taskForm"),
  taskFormTitle: document.getElementById("taskFormTitle"),
  taskSubmitButton: document.getElementById("taskSubmitButton"),
  taskCancelEditButton: document.getElementById("taskCancelEditButton"),
  refreshTasksButton: document.getElementById("refreshTasksButton"),
  taskList: document.getElementById("taskList"),
  adminPanel: document.getElementById("adminPanel"),
  refreshUsersButton: document.getElementById("refreshUsersButton"),
  userList: document.getElementById("userList"),
  adminTaskList: document.getElementById("adminTaskList"),
  adminTaskTitle: document.getElementById("adminTaskTitle"),
};

function showMessage(type, message) {
  if (!ui.messages) {
    return;
  }

  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = message;
  ui.messages.prepend(div);

  window.setTimeout(() => {
    div.remove();
  }, 5000);
}

function toIsoDateTimeLocal(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 16);
}

function setToken(token) {
  state.token = token || "";
  if (state.token) {
    sessionStorage.setItem("authToken", state.token);
  } else {
    sessionStorage.removeItem("authToken");
  }
}

async function request(path, options = {}) {
  const { method = "GET", body = null, auth = true } = options;
  const headers = { "Content-Type": "application/json" };

  if (auth && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(payload.errors)
      ? payload.errors.map((err) => `${err.field || "field"}: ${err.message}`).join("; ")
      : "";
    const message = payload.message || "Request failed";
    throw new Error(details ? `${message} (${details})` : message);
  }

  return payload;
}

function renderAuthState() {
  const isLoggedIn = Boolean(state.user && state.token);
  if (ui.dashboard) {
    ui.dashboard.classList.toggle("hidden", !isLoggedIn);
  }
  if (ui.authGate) {
    ui.authGate.classList.toggle("hidden", isLoggedIn);
  }

  if (!isLoggedIn) {
    if (ui.userMeta) {
      ui.userMeta.textContent = "";
    }
    if (ui.taskList) {
      ui.taskList.innerHTML = "";
    }
    if (ui.adminPanel) {
      ui.adminPanel.classList.add("hidden");
    }
    if (ui.userList) {
      ui.userList.innerHTML = "";
    }
    if (ui.adminTaskList) {
      ui.adminTaskList.innerHTML = "";
    }
    if (ui.adminTaskTitle) {
      ui.adminTaskTitle.textContent = "Selected User Tasks";
    }
    return;
  }

  if (ui.userMeta) {
    ui.userMeta.textContent = `${state.user.name} | ${state.user.email} | role: ${state.user.role}`;
  }

  if (ui.adminPanel) {
    ui.adminPanel.classList.toggle("hidden", state.user.role !== "admin");
  }
}

function resetTaskForm() {
  if (!ui.taskForm) {
    return;
  }
  ui.taskForm.reset();
  ui.taskFormTitle.textContent = "Create Task";
  ui.taskSubmitButton.textContent = "Create Task";
  ui.taskCancelEditButton.classList.add("hidden");
  state.editingTaskId = null;
}

function taskCard(task) {
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleString() : "none";
  const ownerLabel =
    typeof task.owner === "object" && task.owner
      ? `${task.owner.name} (${task.owner.role})`
      : "current user";

  return `
    <article class="task-item">
      <h4>${task.title}</h4>
      <p>${task.description || "No description"}</p>
      <div class="task-meta">
        <span class="task-badge">status: ${task.status}</span>
        <span class="task-badge">due: ${dueDate}</span>
        <span class="task-badge">owner: ${ownerLabel}</span>
      </div>
      <div class="task-actions">
        <button type="button" data-action="edit" data-id="${task._id}">Edit</button>
        <button type="button" class="secondary" data-action="delete" data-id="${task._id}">Delete</button>
      </div>
    </article>
  `;
}

function adminTaskCard(task) {
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleString() : "none";
  const ownerLabel =
    typeof task.owner === "object" && task.owner
      ? `${task.owner.name} (${task.owner.role})`
      : "unknown";

  return `
    <article class="task-item">
      <h4>${task.title}</h4>
      <p>${task.description || "No description"}</p>
      <div class="task-meta">
        <span class="task-badge">status: ${task.status}</span>
        <span class="task-badge">due: ${dueDate}</span>
        <span class="task-badge">owner: ${ownerLabel}</span>
      </div>
    </article>
  `;
}

function userCard(user) {
  return `
    <article class="user-item">
      <h4>${user.name}</h4>
      <p>${user.email} | role: ${user.role}</p>
      <button type="button" data-action="view-user-tasks" data-id="${user.id}" data-name="${user.name}">View Tasks</button>
    </article>
  `;
}

async function loadCurrentUser() {
  const payload = await request("/auth/me");
  state.user = payload.data.user;
  renderAuthState();
}

async function loadTasks() {
  if (!state.token || !ui.taskList) return;
  const payload = await request("/tasks?sortBy=createdAt&sortOrder=desc");
  const tasks = payload.data.items || [];

  if (!tasks.length) {
    ui.taskList.innerHTML = "<p>No tasks available yet.</p>";
    return;
  }

  ui.taskList.innerHTML = tasks.map(taskCard).join("");
}

async function loadUsers() {
  if (!state.token || !ui.userList || state.user?.role !== "admin") return;
  const payload = await request("/admin/users?limit=50&sortOrder=desc");
  const users = payload.data.items || [];

  if (!users.length) {
    ui.userList.innerHTML = "<p>No users available.</p>";
    return;
  }

  ui.userList.innerHTML = users.map(userCard).join("");
}

async function loadUserTasks(userId, userName = "Selected User") {
  if (!ui.adminTaskList || state.user?.role !== "admin") return;
  const payload = await request(`/admin/users/${userId}/tasks?limit=50`);
  const tasks = payload.data.items || [];
  state.selectedAdminUserId = userId;

  if (ui.adminTaskTitle) {
    ui.adminTaskTitle.textContent = `Tasks: ${userName}`;
  }

  if (!tasks.length) {
    ui.adminTaskList.innerHTML = "<p>No tasks for this user.</p>";
    return;
  }

  ui.adminTaskList.innerHTML = tasks.map(adminTaskCard).join("");
}

async function handleRegister(event) {
  event.preventDefault();
  if (!ui.registerForm) return;
  const form = new FormData(ui.registerForm);

  try {
    const payload = await request("/auth/register", {
      method: "POST",
      auth: false,
      body: {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      },
    });
    setToken(payload.data.token);
    state.user = payload.data.user;
    renderAuthState();
    showMessage("success", "Registration successful");
    ui.registerForm.reset();
    window.setTimeout(() => {
      window.location.href = "/";
    }, 400);
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!ui.loginForm) return;
  const form = new FormData(ui.loginForm);

  try {
    const payload = await request("/auth/login", {
      method: "POST",
      auth: false,
      body: {
        email: form.get("email"),
        password: form.get("password"),
      },
    });
    setToken(payload.data.token);
    state.user = payload.data.user;
    renderAuthState();
    showMessage("success", "Logged in successfully");
    ui.loginForm.reset();
    window.setTimeout(() => {
      window.location.href = "/";
    }, 400);
  } catch (error) {
    showMessage("error", error.message);
  }
}

function handleLogout() {
  state.user = null;
  setToken("");
  resetTaskForm();
  renderAuthState();
  showMessage("success", "Logged out");
}

async function handleAdminCheck() {
  try {
    const payload = await request("/auth/admin");
    showMessage("success", payload.message || "Admin route is accessible");
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  const form = new FormData(ui.taskForm);
  const dueDateInput = form.get("dueDate");

  const body = {
    title: form.get("title"),
    description: form.get("description"),
    status: form.get("status"),
  };

  if (dueDateInput) {
    body.dueDate = new Date(dueDateInput).toISOString();
  }

  try {
    if (state.editingTaskId) {
      await request(`/tasks/${state.editingTaskId}`, { method: "PATCH", body });
      showMessage("success", "Task updated");
    } else {
      await request("/tasks", { method: "POST", body });
      showMessage("success", "Task created");
    }
    resetTaskForm();
    await loadTasks();
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function startEditing(taskId) {
  if (!ui.taskForm) return;
  try {
    const payload = await request(`/tasks/${taskId}`);
    const task = payload.data.task;

    state.editingTaskId = task._id;
    ui.taskFormTitle.textContent = "Edit Task";
    ui.taskSubmitButton.textContent = "Save Changes";
    ui.taskCancelEditButton.classList.remove("hidden");

    ui.taskForm.elements.title.value = task.title || "";
    ui.taskForm.elements.description.value = task.description || "";
    ui.taskForm.elements.status.value = task.status || "todo";
    ui.taskForm.elements.dueDate.value = toIsoDateTimeLocal(task.dueDate);
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function deleteTask(taskId) {
  if (!window.confirm("Delete this task?")) {
    return;
  }

  try {
    await request(`/tasks/${taskId}`, { method: "DELETE" });
    showMessage("success", "Task deleted");
    if (state.editingTaskId === taskId) {
      resetTaskForm();
    }
    await loadTasks();
  } catch (error) {
    showMessage("error", error.message);
  }
}

function handleTaskListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (!id) return;

  if (action === "edit") {
    startEditing(id);
  } else if (action === "delete") {
    deleteTask(id);
  }
}

function handleUserListClick(event) {
  const button = event.target.closest("button[data-action='view-user-tasks']");
  if (!button) return;
  const userId = button.dataset.id;
  const userName = button.dataset.name || "Selected User";
  if (!userId) return;
  loadUserTasks(userId, userName).catch((error) => showMessage("error", error.message));
}

async function boot() {
  if (ui.registerForm) {
    ui.registerForm.addEventListener("submit", handleRegister);
  }
  if (ui.loginForm) {
    ui.loginForm.addEventListener("submit", handleLogin);
  }
  if (ui.logoutButton) {
    ui.logoutButton.addEventListener("click", handleLogout);
  }
  if (ui.adminCheckButton) {
    ui.adminCheckButton.addEventListener("click", handleAdminCheck);
  }
  if (ui.taskForm) {
    ui.taskForm.addEventListener("submit", handleTaskSubmit);
  }
  if (ui.taskCancelEditButton) {
    ui.taskCancelEditButton.addEventListener("click", resetTaskForm);
  }
  if (ui.refreshTasksButton) {
    ui.refreshTasksButton.addEventListener("click", loadTasks);
  }
  if (ui.taskList) {
    ui.taskList.addEventListener("click", handleTaskListClick);
  }
  if (ui.refreshUsersButton) {
    ui.refreshUsersButton.addEventListener("click", () => {
      loadUsers().catch((error) => showMessage("error", error.message));
    });
  }
  if (ui.userList) {
    ui.userList.addEventListener("click", handleUserListClick);
  }

  if (!ui.dashboard) {
    if (state.token) {
      try {
        await loadCurrentUser();
        window.location.href = "/";
      } catch (error) {
        setToken("");
      }
    }
    return;
  }

  if (!state.token || !ui.dashboard) {
    renderAuthState();
    return;
  }

  try {
    await loadCurrentUser();
    await loadTasks();
    if (state.user.role === "admin") {
      await loadUsers();
    }
    showMessage("success", "Session restored");
  } catch (error) {
    handleLogout();
    showMessage("error", "Session expired. Please login again.");
  }
}

boot();
