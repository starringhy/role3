/**
 * 우리 반 1인 1역할 배정기 (Classgram) - script.js
 * 인스타그램 감성의 깔끔한 피드, 스토리 트레이, 3-2-1 카운트다운 및 스프레드시트 연동
 */

// ==========================================
// 1. 기본 예시 데이터 (학생 12명, 역할 12개)
// ==========================================
const DEFAULT_STUDENTS = [
  "김민준", "이서연", "박도윤", "최지우",
  "정하은", "강예준", "조수아", "윤시우",
  "장유진", "임도현", "한채원", "오지호"
];

const DEFAULT_ROLES = [
  { id: 1, name: "칠판 지킴이", handle: "clean_blackboard", icon: "✨", duty: "수업 후 칠판을 깨끗이 지우고 분필과 지우개 바르게 정리하기", theme: "theme-sky" },
  { id: 2, name: "우유 도우미", handle: "fresh_milk_box", icon: "🥛", duty: "아침 우유 상자 받아오기 및 다 마신 우유갑 납작하게 분리배출하기", theme: "theme-pink" },
  { id: 3, name: "에너지 지킴이", handle: "green_energy_save", icon: "💡", duty: "쉬는 시간과 이동 수업 때 전등과 전자칠판 전원 끄기", theme: "theme-yellow" },
  { id: 4, name: "도서관 반장", handle: "class_library_lead", icon: "📚", duty: "학급문고 책장 가지런히 정리하고 빌려 간 책 확인하기", theme: "theme-mint" },
  { id: 5, name: "바른 줄 대장", handle: "perfect_line_leader", icon: "🚶", duty: "급식실 및 특별실 이동 시 바르고 조용하게 두 줄 서기 이끌기", theme: "theme-purple" },
  { id: 6, name: "맑은 공기 요정", handle: "fresh_air_breeze", icon: "🍃", duty: "쉬는 시간마다 앞뒤 창문 열어 교실 공기 상쾌하게 환기하기", theme: "theme-mint" },
  { id: 7, name: "초록 식물 친구", handle: "plant_care_keeper", icon: "🌱", duty: "교실 화분에 알맞게 물을 주고 햇볕 쬐어주며 사랑으로 가꾸기", theme: "theme-yellow" },
  { id: 8, name: "소식통 우체부", handle: "notice_postman", icon: "💌", duty: "선생님 안내장 및 가정통신문을 모둠별로 바르게 나누어주기", theme: "theme-orange" },
  { id: 9, name: "분리수거 박사", handle: "eco_recycle_master", icon: "♻️", duty: "종이, 비닐, 플라스틱 분리배출 바구니 확인하고 돕기", theme: "theme-mint" },
  { id: 10, name: "건강 지킴이", handle: "health_guard_safe", icon: "🧼", duty: "손 소독제 비치 및 급식 전 손 씻기 안내와 위생 챙기기", theme: "theme-pink" },
  { id: 11, name: "체육 활동 대장", handle: "sports_pe_captain", icon: "⚽", duty: "체육 시간 전후 공과 안전 운동 기구 챙기고 제자리에 반납하기", theme: "theme-orange" },
  { id: 12, name: "정리정돈 천사", handle: "neat_tidy_angel", icon: "🧹", duty: "사물함 위와 청소도구함 바르게 정리하고 교실 바닥 정돈 돕기", theme: "theme-purple" }
];

const THEME_LIST = ["theme-sky", "theme-pink", "theme-yellow", "theme-mint", "theme-purple", "theme-orange"];
const STUDENT_EMOJIS = ["👦", "👧", "🧑", "🧒", "🎒", "🌟", "🐥", "🐰", "🐻", "🐶", "🐱", "🦊"];

// ==========================================
// 2. 상태 관리 (State)
// ==========================================
let state = {
  students: [],
  roles: [],
  assignments: [], // { student: string, roleId: number, roleName: string, likes: number, isLiked: boolean }
  classTitle: "우리 반 (3학년 2반)",
  lastAssignedDate: "",
  appsScriptUrl: "",
  searchQuery: ""
};

// ==========================================
// 3. 로컬 스토리지 로드 & 저장
// ==========================================
const STORAGE_KEY = "classgram_role_app_v2";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.students = Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : [...DEFAULT_STUDENTS];
      state.roles = Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : JSON.parse(JSON.stringify(DEFAULT_ROLES));
      state.assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
      state.classTitle = parsed.classTitle || "우리 반 (3학년 2반)";
      state.lastAssignedDate = parsed.lastAssignedDate || "";
      state.appsScriptUrl = parsed.appsScriptUrl || "";
    } else {
      resetToDefaultState();
    }
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
    resetToDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

function resetToDefaultState() {
  state.students = [...DEFAULT_STUDENTS];
  state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
  state.assignments = [];
  state.classTitle = "우리 반 (3학년 2반)";
  state.lastAssignedDate = "";
}

// ==========================================
// 4. 초기화 및 이벤트 바인딩
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initUI();
  renderAll();
});

function initUI() {
  // 학급 명칭 수정
  const titleInput = document.getElementById("classTitleInput");
  if (titleInput) {
    titleInput.value = state.classTitle;
    titleInput.addEventListener("input", (e) => {
      state.classTitle = e.target.value.trim() || "우리 반";
      saveState();
      updateProfileAndPrintHeader();
    });
  }

  // 검색 필터
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      renderCardsGrid();
    });
  }

  // 주요 버튼들
  document.getElementById("btnRoll")?.addEventListener("click", handleRollAssignments);
  document.getElementById("btnPrint")?.addEventListener("click", handlePrint);
  document.getElementById("btnSheetLoad")?.addEventListener("click", () => openModal("modalSheetLoad"));
  document.getElementById("btnSheetSave")?.addEventListener("click", () => openModal("modalSheetSave"));
  document.getElementById("btnToggleManage")?.addEventListener("click", toggleManagementPanel);

  // 관리 패널
  document.getElementById("btnResetDefaults")?.addEventListener("click", handleResetDefaults);
  document.getElementById("btnAddStudent")?.addEventListener("click", handleAddStudent);
  document.getElementById("inputNewStudent")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAddStudent();
  });
  document.getElementById("btnAddRole")?.addEventListener("click", handleAddRole);
  document.getElementById("inputNewRoleName")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAddRole();
  });

  // 모달 닫기
  document.querySelectorAll(".btn-modal-close, .btn-modal-cancel").forEach(btn => {
    btn.addEventListener("click", () => {
      const overlay = btn.closest(".modal-overlay");
      if (overlay) overlay.classList.remove("active");
    });
  });

  // 시트 연동 기능들
  document.getElementById("btnSaveScriptUrl")?.addEventListener("click", handleSaveScriptUrl);
  document.getElementById("btnFetchFromSheet")?.addEventListener("click", handleFetchFromSheet);
  document.getElementById("btnApplyPastedData")?.addEventListener("click", handleApplyPastedData);
  document.getElementById("btnCopyForSheet")?.addEventListener("click", handleCopyForSheet);
  document.getElementById("btnDownloadCsv")?.addEventListener("click", handleDownloadCsv);
  document.getElementById("btnPostToSheet")?.addEventListener("click", handlePostToSheet);
  document.getElementById("btnToggleGuide")?.addEventListener("click", toggleAppsScriptGuide);

  // 스왑 확정
  document.getElementById("btnConfirmSwap")?.addEventListener("click", handleConfirmSwap);
}

function renderAll() {
  updateProfileAndPrintHeader();
  renderStoriesTray();
  renderCardsGrid();
  renderManagementLists();
}

// ==========================================
// 5. 인스타그램 스토리 트레이 (학생 12명 원형 아바타)
// ==========================================
function renderStoriesTray() {
  const tray = document.getElementById("storiesTray");
  if (!tray) return;

  tray.innerHTML = "";

  state.students.forEach((student, index) => {
    const assigned = state.assignments.find(a => a.student === student);
    const hasRole = Boolean(assigned && assigned.roleName);
    const emoji = STUDENT_EMOJIS[index % STUDENT_EMOJIS.length];

    const item = document.createElement("div");
    item.className = "story-item";
    item.title = hasRole ? `${student} · ${assigned.roleName}` : `${student} (배정 대기 중)`;
    item.onclick = () => focusStudentCard(student);

    item.innerHTML = `
      <div class="story-ring ${hasRole ? '' : 'unassigned'}">
        <div class="story-avatar">
          <span>${emoji}</span>
        </div>
      </div>
      <span class="story-name">${escapeHtml(student)}</span>
    `;

    tray.appendChild(item);
  });
}

// 스토리 클릭 시 해당 학생의 카드로 스크롤 및 포커스
function focusStudentCard(studentName) {
  const assigned = state.assignments.find(a => a.student === studentName);
  if (!assigned) {
    showToast(`${studentName} 학생은 아직 역할이 배정되지 않았습니다.`);
    return;
  }
  const targetCard = document.querySelector(`[data-role-id="${assigned.roleId}"]`);
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
    targetCard.style.outline = "2px solid #0095F6";
    targetCard.style.boxShadow = "0 0 20px rgba(0, 149, 246, 0.4)";
    setTimeout(() => {
      targetCard.style.outline = "";
      targetCard.style.boxShadow = "";
    }, 1800);
  }
}

// ==========================================
// 6. 인스타그램 피드 포스트 카드 그리드
// ==========================================
function renderCardsGrid() {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  container.innerHTML = "";

  const query = state.searchQuery || "";

  // 검색 필터 적용
  const filteredRoles = state.roles.filter(role => {
    if (!query) return true;
    const assigned = state.assignments.find(a => a.roleId === role.id);
    const student = assigned ? assigned.student.toLowerCase() : "";
    return role.name.toLowerCase().includes(query) || 
           role.duty.toLowerCase().includes(query) || 
           student.includes(query);
  });

  if (filteredRoles.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: #8E8E8E;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">🔍</span>
        <p style="font-weight: 600;">검색 결과가 없습니다.</p>
        <p style="font-size: 0.85rem;">다른 학생 이름이나 역할을 검색해 보세요.</p>
      </div>
    `;
    return;
  }

  filteredRoles.forEach((role, index) => {
    const assigned = state.assignments.find(a => a.roleId === role.id);
    const studentName = assigned ? assigned.student : "";
    const likes = assigned ? (assigned.likes || 12) : 12;
    const isLiked = assigned ? Boolean(assigned.isLiked) : false;
    const themeClass = role.theme || THEME_LIST[index % THEME_LIST.length];
    const handle = role.handle || `role_${role.id}`;

    const card = document.createElement("article");
    card.className = `role-card ${themeClass}`;
    card.dataset.roleId = role.id;
    card.dataset.roleName = role.name;

    card.innerHTML = `
      <!-- 1. 포스트 헤더 -->
      <div class="post-header">
        <div class="post-user-info">
          <div class="post-avatar-ring">
            <div class="post-avatar-inner">
              <span>${role.icon || "⭐"}</span>
            </div>
          </div>
          <div class="post-user-names">
            <span class="post-handle">@${escapeHtml(role.name.replace(/\s+/g, '_'))}</span>
            <span class="post-location">${escapeHtml(state.classTitle)} · 교실</span>
          </div>
        </div>
        <button class="btn-post-more" title="담당 학생 맞바꾸기" onclick="openSwapModal(${role.id}, '${escapeHtml(role.name)}')">
          •••
        </button>
      </div>

      <!-- 2. 포스트 메인 비주얼 영역 (사진 프레임) -->
      <div class="post-visual-area" ondblclick="toggleLikePost(${role.id})" title="더블 클릭하면 좋아요 ❤️">
        <div class="post-big-icon">${role.icon || "⭐"}</div>
        <div class="post-tag-sticker ${studentName ? '' : 'unassigned'}" onclick="openSwapModal(${role.id}, '${escapeHtml(role.name)}')">
          <span>🏷️</span>
          <span id="student-slot-${role.id}">${studentName ? escapeHtml(studentName) : '배정 대기 중... 🎲'}</span>
        </div>
      </div>

      <!-- 3. 포스트 액션 바 -->
      <div class="post-actions-bar">
        <div class="post-actions-left">
          <button class="btn-icon-action ${isLiked ? 'liked' : ''}" onclick="toggleLikePost(${role.id})" title="좋아요">
            ${isLiked ? '❤️' : '🤍'}
          </button>
          <button class="btn-icon-action" onclick="showCommentPrompt('${escapeHtml(role.name)}')" title="칭찬 댓글">
            💬
          </button>
          <button class="btn-icon-action" onclick="openSwapModal(${role.id}, '${escapeHtml(role.name)}')" title="학생 교체">
            🔄
          </button>
        </div>
        <button class="btn-icon-action" title="역할 북마크">
          🔖
        </button>
      </div>

      <!-- 4. 포스트 캡션 및 댓글 -->
      <div class="post-caption-box">
        <span class="post-likes-count">좋아요 <span id="like-count-${role.id}">${likes}</span>개</span>
        <p class="post-caption-text">
          <span class="post-author-name">${studentName ? escapeHtml(studentName) : '선생님'}</span>
          ${escapeHtml(role.duty)}
        </p>
        <span class="post-hashtags">#1인1역할 #${escapeHtml(role.name.replace(/\s+/g, ''))} #행복한교실</span>
        <span class="post-time-stamp">${state.lastAssignedDate ? '배정완료' : '배정 대기'}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

// 피드 좋아요 토글
window.toggleLikePost = function(roleId) {
  let assigned = state.assignments.find(a => a.roleId === roleId);
  if (!assigned) {
    showToast("먼저 [🎲 역할 배정하기]를 진행해 주세요.");
    return;
  }

  assigned.isLiked = !assigned.isLiked;
  assigned.likes = (assigned.likes || 12) + (assigned.isLiked ? 1 : -1);
  saveState();
  renderCardsGrid();

  if (assigned.isLiked) {
    showToast(`❤️ '${assigned.roleName}' 역할을 응원합니다!`);
  }
};

window.showCommentPrompt = function(roleName) {
  showToast(`💬 "${roleName}" 친구에게 따뜻한 격려 한마디를 전해주세요!`);
};

// ==========================================
// 7. 프로필 통계 및 인쇄 헤더 업데이트
// ==========================================
function updateProfileAndPrintHeader() {
  const profileTitle = document.getElementById("profileClassTitle");
  if (profileTitle) profileTitle.textContent = state.classTitle;

  const printTitle = document.getElementById("printClassTitle");
  if (printTitle) printTitle.textContent = `${state.classTitle} 1인 1역할 배정표`;

  const studentCount = state.students.length;
  const roleCount = state.roles.length;

  document.getElementById("statStudentCount").textContent = `${studentCount}`;
  document.getElementById("statRoleCount").textContent = `${roleCount}`;

  const matchEl = document.getElementById("statMatchStatus");
  if (matchEl) {
    if (studentCount === roleCount && studentCount > 0) {
      matchEl.textContent = "1:1 완벽 일치";
      matchEl.style.color = "#0095F6";
    } else if (studentCount > roleCount) {
      matchEl.textContent = `학생 +${studentCount - roleCount}`;
      matchEl.style.color = "#ED4956";
    } else {
      matchEl.textContent = `역할 +${roleCount - studentCount}`;
      matchEl.style.color = "#ED4956";
    }
  }

  const assignedDateEl = document.getElementById("lastAssignedDateText");
  if (assignedDateEl) {
    assignedDateEl.textContent = state.lastAssignedDate 
      ? `최근 업데이트: ${state.lastAssignedDate}` 
      : "아직 배정 전입니다.";
  }

  const printDate = document.getElementById("printDate");
  if (printDate) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    printDate.textContent = `배정일자: ${state.lastAssignedDate || dateStr}`;
  }
}

// ==========================================
// 8. 3, 2, 1 카운트다운 및 역할 매칭
// ==========================================
let isRolling = false;

function playBeep(freq = 520, duration = 0.2) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context error ignore
  }
}

function handleRollAssignments() {
  if (isRolling) return;

  if (state.students.length === 0) {
    showToast("⚠️ 배정할 학생 목록이 비어 있습니다. 학생을 등록해 주세요.");
    return;
  }
  if (state.roles.length === 0) {
    showToast("⚠️ 배정할 역할 목록이 비어 있습니다. 역할을 등록해 주세요.");
    return;
  }

  isRolling = true;
  const rollBtn = document.getElementById("btnRoll");
  if (rollBtn) {
    rollBtn.disabled = true;
    rollBtn.innerHTML = `<span>⏳</span> 카운트다운...`;
  }

  // Fisher-Yates 무작위 셔플
  const shuffledStudents = [...state.students];
  for (let i = shuffledStudents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
  }

  // 3, 2, 1 카운트다운 시작
  runCountdown(() => {
    startCardRollAndAssignment(shuffledStudents);
  });
}

function runCountdown(callback) {
  const overlay = document.getElementById("countdownOverlay");
  const numberEl = document.getElementById("countdownNumber");
  const cheerEl = document.getElementById("countdownCheer");

  if (!overlay || !numberEl) {
    if (callback) callback();
    return;
  }

  overlay.classList.add("active");

  const steps = [
    { count: "3", cheer: "카메라 롤! 두근두근 기대돼요! 🎲", freq: 440 },
    { count: "2", cheer: "과연 나의 이번 학기 역할은? ✨", freq: 554 },
    { count: "1", cheer: "숨을 죽이고 피드를 주목하세요! 🌟", freq: 659 },
    { count: "짠! 🎉", cheer: "Classgram 배정 결과 공개! 🎈", freq: 880 }
  ];

  let stepIndex = 0;

  function showStep() {
    const current = steps[stepIndex];
    numberEl.textContent = current.count;
    if (cheerEl) cheerEl.textContent = current.cheer;
    
    numberEl.classList.remove("pop");
    void numberEl.offsetWidth;
    numberEl.classList.add("pop");

    playBeep(current.freq, stepIndex === 3 ? 0.4 : 0.2);

    stepIndex++;
    if (stepIndex < steps.length) {
      setTimeout(showStep, 950);
    } else {
      setTimeout(() => {
        overlay.classList.remove("active");
        if (callback) callback();
      }, 750);
    }
  }

  showStep();
}

function startCardRollAndAssignment(shuffledStudents) {
  const rollBtn = document.getElementById("btnRoll");
  if (rollBtn) {
    rollBtn.innerHTML = `<span>🎲</span> 피드 업데이트 중...`;
  }

  const cards = document.querySelectorAll(".role-card");
  cards.forEach(card => card.classList.add("rolling"));

  let rollTicks = 0;
  const maxRollTicks = 8;
  const intervalTime = 70;

  const rollInterval = setInterval(() => {
    rollTicks++;
    state.roles.forEach(role => {
      const slot = document.getElementById(`student-slot-${role.id}`);
      if (slot) {
        const randomName = state.students[Math.floor(Math.random() * state.students.length)];
        slot.textContent = randomName;
      }
    });

    if (rollTicks >= maxRollTicks) {
      clearInterval(rollInterval);
      finishRoll(shuffledStudents);
    }
  }, intervalTime);
}

function finishRoll(shuffledStudents) {
  const newAssignments = [];
  state.roles.forEach((role, index) => {
    const student = shuffledStudents[index] || "";
    newAssignments.push({
      roleId: role.id,
      roleName: role.name,
      student: student,
      likes: Math.floor(Math.random() * 8) + 12,
      isLiked: false
    });
  });

  state.assignments = newAssignments;
  const now = new Date();
  state.lastAssignedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  saveState();

  const rollBtn = document.getElementById("btnRoll");
  if (rollBtn) {
    rollBtn.disabled = false;
    rollBtn.innerHTML = `<span>🎲</span> 역할 배정하기`;
  }

  isRolling = false;
  renderAll();
  showToast("🎉 Classgram 1인 1역할 배정이 완료되었습니다!");
}

// ==========================================
// 9. 교실 게시판 부착용 A4 인쇄
// ==========================================
function handlePrint() {
  if (state.assignments.length === 0 || !state.assignments.some(a => a.student)) {
    if (!confirm("아직 역할 배정을 진행하지 않았습니다. 빈 상태로 인쇄하시겠습니까?")) {
      return;
    }
  }
  updateProfileAndPrintHeader();
  window.print();
}

// ==========================================
// 10. 관리 패널 (학생/역할 편집)
// ==========================================
function toggleManagementPanel() {
  const panel = document.getElementById("managementPanel");
  if (!panel) return;
  panel.classList.toggle("active");
  const btn = document.getElementById("btnToggleManage");
  if (btn) {
    btn.textContent = panel.classList.contains("active") ? "✕ 닫기" : "⚙️ 편집";
  }
}

function renderManagementLists() {
  const studentListEl = document.getElementById("studentEditList");
  if (studentListEl) {
    studentListEl.innerHTML = "";
    state.students.forEach((student, index) => {
      const row = document.createElement("div");
      row.className = "edit-item-row";
      row.innerHTML = `
        <span style="font-size:0.75rem; color:#8E8E8E; width:20px;">${index + 1}.</span>
        <input type="text" value="${escapeHtml(student)}" onchange="updateStudentName(${index}, this.value)" />
        <button class="btn-remove-item" onclick="removeStudent(${index})" title="삭제">×</button>
      `;
      studentListEl.appendChild(row);
    });
  }

  const roleListEl = document.getElementById("roleEditList");
  if (roleListEl) {
    roleListEl.innerHTML = "";
    state.roles.forEach((role, index) => {
      const row = document.createElement("div");
      row.className = "edit-item-row";
      row.innerHTML = `
        <span style="font-size:1.05rem; width:24px; text-align:center;">${role.icon || '⭐'}</span>
        <input type="text" value="${escapeHtml(role.name)}" placeholder="역할명" style="font-weight:700; width:110px;" onchange="updateRoleName(${index}, this.value)" />
        <input type="text" value="${escapeHtml(role.duty)}" placeholder="임무 설명" style="flex:1; color:#737373; font-size:0.82rem;" onchange="updateRoleDuty(${index}, this.value)" />
        <button class="btn-remove-item" onclick="removeRole(${index})" title="삭제">×</button>
      `;
      roleListEl.appendChild(row);
    });
  }
}

window.updateStudentName = function(index, newName) {
  const trimmed = newName.trim();
  if (trimmed) {
    const oldName = state.students[index];
    state.students[index] = trimmed;
    state.assignments.forEach(a => {
      if (a.student === oldName) a.student = trimmed;
    });
    saveState();
    renderAll();
  }
};

window.removeStudent = function(index) {
  if (state.students.length <= 1) {
    showToast("⚠️ 학생은 최소 1명 이상이어야 합니다.");
    return;
  }
  const removed = state.students.splice(index, 1)[0];
  state.assignments = state.assignments.filter(a => a.student !== removed);
  saveState();
  renderAll();
  showToast(`'${removed}' 학생을 삭제했습니다.`);
};

function handleAddStudent() {
  const input = document.getElementById("inputNewStudent");
  if (!input) return;
  const name = input.value.trim();
  if (!name) return;

  const names = name.split(/[,，\s]+/).filter(n => n.length > 0);
  names.forEach(n => {
    if (!state.students.includes(n)) {
      state.students.push(n);
    }
  });

  input.value = "";
  saveState();
  renderAll();
  showToast(`새 학생 ${names.length}명을 추가했습니다.`);
}

window.updateRoleName = function(index, newName) {
  const trimmed = newName.trim();
  if (trimmed) {
    state.roles[index].name = trimmed;
    saveState();
    renderCardsGrid();
  }
};

window.updateRoleDuty = function(index, newDuty) {
  state.roles[index].duty = newDuty.trim();
  saveState();
  renderCardsGrid();
};

window.removeRole = function(index) {
  if (state.roles.length <= 1) {
    showToast("⚠️ 역할은 최소 1개 이상이어야 합니다.");
    return;
  }
  const removed = state.roles.splice(index, 1)[0];
  state.assignments = state.assignments.filter(a => a.roleId !== removed.id);
  saveState();
  renderAll();
  showToast(`'${removed.name}' 역할을 삭제했습니다.`);
};

function handleAddRole() {
  const nameInput = document.getElementById("inputNewRoleName");
  const dutyInput = document.getElementById("inputNewRoleDuty");
  const iconInput = document.getElementById("inputNewRoleIcon");

  const name = nameInput ? nameInput.value.trim() : "";
  const duty = dutyInput ? dutyInput.value.trim() : "학급을 위한 소중한 역할 실천하기";
  const icon = iconInput && iconInput.value.trim() ? iconInput.value.trim() : "⭐";

  if (!name) {
    showToast("⚠️ 역할 이름을 입력해 주세요.");
    return;
  }

  const newId = Date.now();
  const theme = THEME_LIST[state.roles.length % THEME_LIST.length];
  state.roles.push({
    id: newId,
    name: name,
    handle: `role_${newId.toString().slice(-4)}`,
    duty: duty || "학급을 위한 소중한 역할 실천하기",
    icon: icon,
    theme: theme
  });

  if (nameInput) nameInput.value = "";
  if (dutyInput) dutyInput.value = "";
  if (iconInput) iconInput.value = "";

  saveState();
  renderAll();
  showToast(`새 역할 '${name}'을 추가했습니다.`);
}

function handleResetDefaults() {
  if (confirm("기본 12명 학생과 12개 기본 역할로 되돌리시겠습니까?")) {
    resetToDefaultState();
    saveState();
    renderAll();
    showToast("기본 예시 데이터(12명/12개 역할)로 초기화되었습니다.");
  }
}

// ==========================================
// 11. 수동 스왑 모달
// ==========================================
let currentSwapRoleId = null;

window.openSwapModal = function(roleId, roleName) {
  currentSwapRoleId = roleId;
  const role = state.roles.find(r => r.id === roleId);
  const assigned = state.assignments.find(a => a.roleId === roleId);
  const currentStudent = assigned ? assigned.student : "";

  document.getElementById("swapRoleTitle").textContent = `${role ? role.name : roleName} 담당 학생 변경`;
  document.getElementById("swapCurrentStudentText").textContent = currentStudent || "현재 배정 없음";

  const select = document.getElementById("swapStudentSelect");
  if (select) {
    select.innerHTML = `<option value="">-- 배정 안 함 (비워두기) --</option>`;
    state.students.forEach(student => {
      const studentAssignedRole = state.assignments.find(a => a.student === student);
      const roleText = studentAssignedRole ? ` (현재: ${studentAssignedRole.roleName})` : " (미배정)";
      const isSelected = student === currentStudent ? "selected" : "";
      select.innerHTML += `<option value="${escapeHtml(student)}" ${isSelected}>${escapeHtml(student)}${roleText}</option>`;
    });
  }

  openModal("modalSwap");
};

function handleConfirmSwap() {
  if (currentSwapRoleId === null) return;

  const select = document.getElementById("swapStudentSelect");
  const targetStudent = select ? select.value : "";
  const role = state.roles.find(r => r.id === currentSwapRoleId);
  if (!role) return;

  const currentAssigned = state.assignments.find(a => a.roleId === currentSwapRoleId);
  const previousStudent = currentAssigned ? currentAssigned.student : "";

  // 스왑 처리 (상대방 역할과 맞바꾸기)
  if (targetStudent) {
    const otherAssignment = state.assignments.find(a => a.student === targetStudent);
    if (otherAssignment && otherAssignment.roleId !== currentSwapRoleId) {
      otherAssignment.student = previousStudent;
    }
  }

  if (currentAssigned) {
    currentAssigned.student = targetStudent;
  } else {
    state.assignments.push({
      roleId: role.id,
      roleName: role.name,
      student: targetStudent,
      likes: 12,
      isLiked: false
    });
  }

  saveState();
  renderAll();
  closeModal("modalSwap");
  showToast(`'${role.name}' 담당 학생이 변경되었습니다.`);
}

// ==========================================
// 12. 구글 스프레드시트 (Apps Script) 연동
// ==========================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("active");
    if (id === "modalSheetLoad" || id === "modalSheetSave") {
      const input = modal.querySelector(".apps-script-url-input");
      if (input) input.value = state.appsScriptUrl || "";
    }
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

function handleSaveScriptUrl(e) {
  const parent = e.target.closest(".modal-card");
  const input = parent ? parent.querySelector(".apps-script-url-input") : null;
  if (input) {
    state.appsScriptUrl = input.value.trim();
    saveState();
    showToast("구글 Apps Script 웹앱 URL이 저장되었습니다.");
  }
}

async function handleFetchFromSheet() {
  const urlInput = document.querySelector("#modalSheetLoad .apps-script-url-input");
  const url = urlInput ? urlInput.value.trim() : state.appsScriptUrl;

  if (!url) {
    showToast("⚠️ 먼저 Apps Script 웹앱 URL을 입력해 주세요.");
    return;
  }

  state.appsScriptUrl = url;
  saveState();

  const fetchBtn = document.getElementById("btnFetchFromSheet");
  if (fetchBtn) {
    fetchBtn.disabled = true;
    fetchBtn.textContent = "불러오는 중...";
  }

  try {
    const res = await fetch(`${url}?action=getData&t=${Date.now()}`);
    const data = await res.json();

    if (data && (Array.isArray(data.students) || Array.isArray(data.roles))) {
      if (Array.isArray(data.students) && data.students.length > 0) {
        state.students = data.students.map(s => String(s).trim()).filter(Boolean);
      }
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        state.roles = data.roles.map((r, i) => ({
          id: r.id || Date.now() + i,
          name: r.name || `역할 ${i + 1}`,
          duty: r.duty || "학급 역할 실천하기",
          icon: r.icon || "⭐",
          theme: THEME_LIST[i % THEME_LIST.length]
        }));
      }
      saveState();
      renderAll();
      closeModal("modalSheetLoad");
      showToast(`🎉 스프레드시트에서 학생 ${state.students.length}명, 역할 ${state.roles.length}개를 성공적으로 불러왔습니다!`);
    } else {
      throw new Error("올바른 응답 형식이 아닙니다.");
    }
  } catch (err) {
    console.warn("Sheet fetch failed:", err);
    alert("구글 시트에서 데이터를 불러오지 못했습니다.\n\nApps Script URL 및 배포 설정(액세스 권한: 모든 사용자)을 확인하시거나, 아래 '텍스트 복사/붙여넣기' 기능을 이용해 주세요.");
  } finally {
    if (fetchBtn) {
      fetchBtn.disabled = false;
      fetchBtn.textContent = "구글 시트에서 데이터 가져오기";
    }
  }
}

function handleApplyPastedData() {
  const studentText = document.getElementById("pasteStudentArea")?.value || "";
  const roleText = document.getElementById("pasteRoleArea")?.value || "";

  if (!studentText.trim() && !roleText.trim()) {
    showToast("⚠️ 붙여넣을 학생 명단이나 역할 목록을 입력해 주세요.");
    return;
  }

  if (studentText.trim()) {
    const parsedStudents = studentText
      .split(/[\n,，\t]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.includes("학생") && !s.includes("이름"));
    if (parsedStudents.length > 0) {
      state.students = [...new Set(parsedStudents)];
    }
  }

  if (roleText.trim()) {
    const lines = roleText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsedRoles = [];
    lines.forEach((line, i) => {
      const parts = line.split(/[\t,，]+/);
      const roleName = parts[0]?.trim();
      const roleDuty = parts[1]?.trim() || "학급을 위한 소중한 역할 실천하기";
      if (roleName && !roleName.includes("역할명") && !roleName.includes("임무")) {
        parsedRoles.push({
          id: Date.now() + i,
          name: roleName,
          duty: roleDuty,
          icon: "⭐",
          theme: THEME_LIST[i % THEME_LIST.length]
        });
      }
    });

    if (parsedRoles.length > 0) {
      state.roles = parsedRoles;
    }
  }

  saveState();
  renderAll();
  closeModal("modalSheetLoad");
  showToast("붙여넣은 명단과 역할이 성공적으로 반영되었습니다!");
}

function handleCopyForSheet() {
  if (state.assignments.length === 0) {
    showToast("⚠️ 아직 배정된 결과가 없습니다. 먼저 배정해 주세요.");
    return;
  }

  let tsv = `순번\t역할명\t담당 학생\t주요 임무\t배정일자\n`;
  state.roles.forEach((role, idx) => {
    const assigned = state.assignments.find(a => a.roleId === role.id);
    const student = assigned ? assigned.student : "미배정";
    tsv += `${idx + 1}\t${role.name}\t${student}\t${role.duty}\t${state.lastAssignedDate || ''}\n`;
  });

  navigator.clipboard.writeText(tsv).then(() => {
    showToast("📋 스프레드시트용 표가 클립보드에 복사되었습니다! 시트에서 Ctrl+V를 누르세요.");
  }).catch(() => {
    showToast("클립보드 접근 권한을 확인해 주세요.");
  });
}

function handleDownloadCsv() {
  if (state.assignments.length === 0) {
    showToast("⚠️ 아직 배정된 결과가 없습니다. 먼저 배정해 주세요.");
    return;
  }

  let csvContent = "\uFEFF순번,역할명,담당 학생,주요 임무,배정일시\n";
  state.roles.forEach((role, idx) => {
    const assigned = state.assignments.find(a => a.roleId === role.id);
    const student = assigned ? assigned.student : "미배정";
    const cleanDuty = role.duty.replace(/"/g, '""');
    csvContent += `${idx + 1},"${role.name}","${student}","${cleanDuty}","${state.lastAssignedDate || ''}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.classTitle.replace(/\s+/g, '_')}_1인1역할_배정결과.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("💾 CSV 파일이 다운로드되었습니다.");
}

async function handlePostToSheet() {
  const urlInput = document.querySelector("#modalSheetSave .apps-script-url-input");
  const url = urlInput ? urlInput.value.trim() : state.appsScriptUrl;

  if (!url) {
    showToast("⚠️ 먼저 Apps Script 웹앱 URL을 입력해 주세요.");
    return;
  }

  state.appsScriptUrl = url;
  saveState();

  const postBtn = document.getElementById("btnPostToSheet");
  if (postBtn) {
    postBtn.disabled = true;
    postBtn.textContent = "저장 전송 중...";
  }

  const payload = {
    action: "saveAssignments",
    classTitle: state.classTitle,
    assignedDate: state.lastAssignedDate || new Date().toISOString(),
    assignments: state.roles.map((role, idx) => {
      const assigned = state.assignments.find(a => a.roleId === role.id);
      return {
        number: idx + 1,
        roleName: role.name,
        studentName: assigned ? assigned.student : "",
        duty: role.duty
      };
    })
  };

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    closeModal("modalSheetSave");
    showToast("💾 구글 스프레드시트로 결과 저장 요청이 전송되었습니다!");
  } catch (err) {
    console.warn("Sheet post failed:", err);
    alert("구글 시트 전송 중 오류가 발생했습니다. 상단의 '스프레드시트용 표 복사하기(Ctrl+V)' 버튼을 이용하시면 즉시 시트에 붙여넣으실 수 있습니다.");
  } finally {
    if (postBtn) {
      postBtn.disabled = false;
      postBtn.textContent = "구글 시트에 직접 저장하기";
    }
  }
}

function toggleAppsScriptGuide() {
  const guide = document.getElementById("appsScriptGuideArea");
  if (guide) {
    guide.style.display = guide.style.display === "none" ? "block" : "none";
  }
}

// ==========================================
// 13. 알림 토스트 (Toast Notice)
// ==========================================
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
