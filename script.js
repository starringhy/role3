/**
 * ==========================================================================
 * 우리 반 1인 1역할 배정 시스템 - script.js (Apple Pink Edition)
 * 방어적 프로그래밍 적용: [object Object], null, undefined 완전 방지
 * ==========================================================================
 */

// 1. 기본 예시 데이터 (학생 12명 & 역할 12개)
const DEFAULT_STUDENTS = [
  "김민준", "이서아", "박도윤", "최지우",
  "정하준", "강서연", "윤은우", "조시은",
  "서지호", "임다은", "한지후", "오예린"
];

const DEFAULT_ROLES = [
  { id: 1, name: "칠판 도우미", icon: "🧼", desc: "쉬는 시간마다 칠판을 깨끗하게 정리하고 분필을 정돈합니다." },
  { id: 2, name: "우유 도우미", icon: "🥛", desc: "아침 우유 수량을 확인하고 친구들에게 안전하게 배부합니다." },
  { id: 3, name: "급식 도우미", icon: "🍱", desc: "식사 전 손 씻기와 급식 줄서기, 식판 정리를 안내합니다." },
  { id: 4, name: "환기·창문 도우미", icon: "🪟", desc: "중간 놀이와 점심시간에 창문을 열어 교실 공기를 쾌적하게 유지합니다." },
  { id: 5, name: "소등·에너지 도우미", icon: "💡", desc: "이동 수업이나 체육 시간 시 전등과 전자칠판을 소등합니다." },
  { id: 6, name: "도서 도우미", icon: "📚", desc: "학급 문고의 책을 번호순으로 정갈하게 정리정돈합니다." },
  { id: 7, name: "분리수거 도우미", icon: "♻️", desc: "종이와 플라스틱 등 재활용품이 올바르게 분리배출되도록 돕습니다." },
  { id: 8, name: "식물·화분 도우미", icon: "🪴", desc: "교실 화분의 토양을 살피고 주기적으로 수분을 공급합니다." },
  { id: 9, name: "위생·청결 도우미", icon: "🧴", desc: "손 소독제 잔량을 점검하고 교실 내 방역 비품을 관리합니다." },
  { id: 10, name: "체육·교구 도우미", icon: "⚽", desc: "체육 활동 기구 및 수업 교구를 안전하게 챙기고 반납합니다." },
  { id: 11, name: "학습지·유인물 도우미", icon: "📑", desc: "가정통신문과 수업 학습지를 분단별로 균등하게 배부합니다." },
  { id: 12, name: "소식·전달 도우미", icon: "💌", desc: "선생님의 주요 공지사항과 교무실 전달 업무를 지원합니다." }
];

// 2. 상태 저장 객체
const state = {
  className: "3학년 2반",
  termName: "2026학년도 1학기",
  students: [...DEFAULT_STUDENTS],
  roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
  assignments: [], // { number: 1, studentName: '김민준', roleId: 1, roleName: '칠판 도우미', role: {...} }
  gasUrl: ""
};

// 3. Apple 햅틱 사운드 합성 (Web Audio API)
function playAppleSound(type = 'click') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'shuffle') {
      const notes = [
        { freq: 880.00, time: 0.00, dur: 0.20, vol: 0.12 },
        { freq: 1318.51, time: 0.08, dur: 0.22, vol: 0.14 },
        { freq: 1760.00, time: 0.16, dur: 0.35, vol: 0.16 }
      ];
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);
        gain.gain.setValueAtTime(note.vol, ctx.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.time + note.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + note.time);
        osc.stop(ctx.currentTime + note.time + note.dur + 0.05);
      });
    } else if (type === 'countdown') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'fanfare') {
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.18 },
        { freq: 659.25, time: 0.10, dur: 0.20 },
        { freq: 783.99, time: 0.20, dur: 0.25 },
        { freq: 1046.50, time: 0.32, dur: 0.45 }
      ];
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.time + note.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + note.time);
        osc.stop(ctx.currentTime + note.time + note.dur + 0.05);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch (e) {
    // 오디오 컨텍스트 차단 무시
  }
}

// 4. 안전한 문자열 변환 및 XSS 방지 유틸
function sanitizeString(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") {
    // 혹시 객체가 들어온 경우
    return val.name || val.studentName || val.student || fallback;
  }
  const str = String(val).trim();
  if (str === "[object Object]" || str === "null" || str === "undefined") {
    return fallback;
  }
  return str;
}

function escapeHtml(str) {
  const clean = sanitizeString(str);
  if (!clean) return "";
  return clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 5. 로컬스토리지 저장 및 불러오기 (철저한 데이터 검증)
const STORAGE_KEY = 'class_role_system_apple_pink_v4';

function saveToStorage() {
  try {
    const dataToSave = {
      className: sanitizeString(state.className, "3학년 2반"),
      termName: sanitizeString(state.termName, "2026학년도 1학기"),
      students: state.students.map(s => sanitizeString(s)).filter(Boolean),
      roles: state.roles.map(r => ({
        id: Number(r.id) || 1,
        name: sanitizeString(r.name, "역할"),
        icon: sanitizeString(r.icon, "⭐"),
        desc: sanitizeString(r.desc || r.duty, "")
      })),
      assignments: state.assignments.map(a => ({
        number: Number(a.number) || 1,
        studentName: sanitizeString(a.studentName || a.student, ""),
        roleId: Number(a.roleId || a.role?.id) || 1,
        roleName: sanitizeString(a.roleName || a.role?.name, ""),
        role: a.role ? {
          id: Number(a.role.id) || 1,
          name: sanitizeString(a.role.name, "역할"),
          icon: sanitizeString(a.role.icon, "⭐"),
          desc: sanitizeString(a.role.desc || a.role.duty, "")
        } : null
      })),
      gasUrl: sanitizeString(state.gasUrl, "")
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("Storage save error", e);
  }
}

function loadFromStorage() {
  try {
    // 현재 키 또는 이전 키에서 복원 시도
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem('class_role_system_apple_pink_v3');
    }

    if (!raw) {
      state.students = [...DEFAULT_STUDENTS];
      state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
      return;
    }

    const parsed = JSON.parse(raw);
    state.className = sanitizeString(parsed.className, "3학년 2반");
    state.termName = sanitizeString(parsed.termName, "2026학년도 1학기");
    state.gasUrl = sanitizeString(parsed.gasUrl, "");

    // 학생 명단 정제 ([object Object] 완전 필터링)
    if (Array.isArray(parsed.students) && parsed.students.length > 0) {
      const cleanStudents = parsed.students
        .map(s => sanitizeString(s))
        .filter(s => s.length > 0 && s !== "[object Object]");
      state.students = cleanStudents.length > 0 ? cleanStudents : [...DEFAULT_STUDENTS];
    } else {
      state.students = [...DEFAULT_STUDENTS];
    }

    // 역할 목록 정제
    if (Array.isArray(parsed.roles) && parsed.roles.length > 0) {
      const cleanRoles = parsed.roles.map((r, idx) => {
        if (!r || typeof r !== "object") {
          return { id: idx + 1, name: sanitizeString(r, `역할 ${idx + 1}`), icon: "⭐", desc: "" };
        }
        const name = sanitizeString(r.name || r.roleName, `역할 ${idx + 1}`);
        const icon = sanitizeString(r.icon, "⭐");
        const desc = sanitizeString(r.desc || r.duty, "");
        return {
          id: Number(r.id) || idx + 1,
          name: name,
          icon: icon,
          desc: desc
        };
      }).filter(r => r.name !== "[object Object]");
      state.roles = cleanRoles.length > 0 ? cleanRoles : JSON.parse(JSON.stringify(DEFAULT_ROLES));
    } else {
      state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    }

    // 배정 내역 정제
    if (Array.isArray(parsed.assignments)) {
      state.assignments = parsed.assignments.map((a, idx) => {
        const studentName = sanitizeString(a.studentName || a.student, "");
        const roleId = Number(a.roleId || a.role?.id) || idx + 1;
        const roleName = sanitizeString(a.roleName || a.role?.name, "");
        return {
          number: Number(a.number) || idx + 1,
          studentName: studentName === "[object Object]" ? "" : studentName,
          roleId: roleId,
          roleName: roleName,
          role: a.role ? {
            id: Number(a.role.id) || roleId,
            name: sanitizeString(a.role.name, roleName),
            icon: sanitizeString(a.role.icon, "⭐"),
            desc: sanitizeString(a.role.desc || a.role.duty, "")
          } : null
        };
      });
    } else {
      state.assignments = [];
    }
  } catch (e) {
    console.warn("Storage load error, falling back to defaults", e);
    state.students = [...DEFAULT_STUDENTS];
    state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    state.assignments = [];
  }
}

// 6. 애플 벤토(Bento) 카드 렌더링
function renderCards() {
  const grid = document.getElementById("assignmentGrid");
  if (!grid) return;

  grid.innerHTML = "";

  state.roles.forEach((role, idx) => {
    if (!role) return;
    const card = document.createElement("article");
    card.className = "role-card";
    card.dataset.roleId = role.id;

    // 배정된 학생 안전하게 찾기
    const assignedItem = state.assignments.find(item => {
      if (!item) return false;
      if (item.roleId && item.roleId === role.id) return true;
      if (item.role && Number(item.role.id) === Number(role.id)) return true;
      if (item.roleName && item.roleName === role.name) return true;
      return false;
    });

    const studentName = assignedItem ? sanitizeString(assignedItem.studentName || assignedItem.student) : "";

    card.innerHTML = `
      <div class="card-header-bar">
        <span class="card-student-number">No. ${String(idx + 1).padStart(2, '0')}</span>
        <div class="card-role-badge">${escapeHtml(role.icon || '⭐')}</div>
      </div>
      <div class="card-body-content">
        <h3 class="card-role-name">${escapeHtml(role.name)}</h3>
        <p class="card-role-desc">${escapeHtml(role.desc || '')}</p>
        <div class="card-assigned-block" onclick="openRoleChangeModal(${role.id})" title="클릭하여 학생 변경">
          <span class="assigned-label">담당 학생</span>
          <span class="assigned-name ${studentName ? '' : 'empty'}" id="slot-name-${role.id}">
            ${studentName ? escapeHtml(studentName) : '배정 대기 중'}
          </span>
        </div>
      </div>
      <div class="card-footer-actions">
        <button type="button" class="btn-card-swap" onclick="openRoleChangeModal(${role.id})">
          역할 변경 🔄
        </button>
      </div>
    `;

    grid.appendChild(card);
  });

  updateSpecs();
  updatePrintHeader();
}

// 7. 스펙 통계 및 인쇄 헤더 업데이트
function updateSpecs() {
  const totalStudentsEl = document.getElementById("statTotalStudents");
  if (totalStudentsEl) totalStudentsEl.textContent = state.students.length;

  const totalRolesEl = document.getElementById("statTotalRoles");
  if (totalRolesEl) totalRolesEl.textContent = state.roles.length;

  const assignedCount = state.assignments.filter(a => a && sanitizeString(a.studentName || a.student)).length;
  const statAssignedEl = document.getElementById("statAssignedCount");
  if (statAssignedEl) {
    statAssignedEl.textContent = `${assignedCount} / ${state.roles.length}`;
    if (assignedCount === state.roles.length && state.roles.length > 0) {
      statAssignedEl.className = "spec-value highlight";
    } else {
      statAssignedEl.className = "spec-value";
    }
  }
}

function updatePrintHeader() {
  const pTitle = document.getElementById("printTitle");
  if (pTitle) pTitle.textContent = `${state.className} 1인 1역할 배정표`;

  const pClass = document.getElementById("printClass");
  if (pClass) pClass.textContent = `학급: ${state.className}`;

  const pDate = document.getElementById("printDate");
  if (pDate) pDate.textContent = `배정 일자: ${state.termName}`;
}

// 8. 역할 배정하기 및 3-2-1 카운트다운
let isProcessingRoll = false;

function handleAssignWithCountdown() {
  if (isProcessingRoll) return;

  if (state.students.length === 0) {
    showToast("⚠️ 등록된 학생이 없습니다. 명단을 먼저 등록해 주세요.");
    return;
  }
  if (state.roles.length === 0) {
    showToast("⚠️ 등록된 역할이 없습니다. 역할을 먼저 등록해 주세요.");
    return;
  }

  isProcessingRoll = true;
  const btn = document.getElementById("btnAssignMain");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-symbol">⏳</span><span>배정 진행 중...</span>`;
  }

  // Fisher-Yates 무작위 셔플 준비
  const shuffledStudents = [...state.students];
  for (let i = shuffledStudents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
  }

  // 3, 2, 1 카운트다운 시작
  runCountdown(() => {
    startSlotMachineRoll(shuffledStudents);
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
    { count: "3", cheer: "두근두근! 자리에 바르게 앉아요 ✨" },
    { count: "2", cheer: "이번 학기 나의 소중한 역할은? 🎲" },
    { count: "1", cheer: "숨을 죽이고 카드를 주목하세요 🌟" },
    { count: "짠! 🎉", cheer: "Class Roles 배정 결과를 공개합니다! 🎈" }
  ];

  let step = 0;

  function nextStep() {
    const current = steps[step];
    numberEl.textContent = current.count;
    if (cheerEl) cheerEl.textContent = current.cheer;

    numberEl.classList.remove("pop");
    void numberEl.offsetWidth;
    numberEl.classList.add("pop");

    if (step === 3) {
      playAppleSound('fanfare');
    } else {
      playAppleSound('countdown');
    }

    step++;
    if (step < steps.length) {
      setTimeout(nextStep, 950);
    } else {
      setTimeout(() => {
        overlay.classList.remove("active");
        if (callback) callback();
      }, 750);
    }
  }

  nextStep();
}

function startSlotMachineRoll(shuffledStudents) {
  const cards = document.querySelectorAll(".role-card");
  cards.forEach(card => card.classList.add("rolling"));

  let ticks = 0;
  const maxTicks = 8;
  const interval = setInterval(() => {
    ticks++;
    state.roles.forEach(role => {
      const slot = document.getElementById(`slot-name-${role.id}`);
      if (slot) {
        const randName = state.students[Math.floor(Math.random() * state.students.length)];
        slot.textContent = sanitizeString(randName);
      }
    });

    if (ticks >= maxTicks) {
      clearInterval(interval);
      finishAssignment(shuffledStudents);
    }
  }, 70);
}

function finishAssignment(shuffledStudents) {
  const newAssignments = [];
  state.roles.forEach((role, idx) => {
    const student = sanitizeString(shuffledStudents[idx], "");
    newAssignments.push({
      number: idx + 1,
      studentName: student,
      roleId: role.id,
      roleName: role.name,
      role: {
        id: role.id,
        name: role.name,
        icon: role.icon,
        desc: role.desc
      }
    });
  });

  state.assignments = newAssignments;
  saveToStorage();

  const cards = document.querySelectorAll(".role-card");
  cards.forEach(card => card.classList.remove("rolling"));

  state.roles.forEach(role => {
    const slot = document.getElementById(`slot-name-${role.id}`);
    const assigned = state.assignments.find(a => a.roleId === role.id);
    if (slot) {
      const name = assigned ? sanitizeString(assigned.studentName) : "";
      slot.className = `assigned-name ${name ? '' : 'empty'}`;
      slot.textContent = name ? name : '배정 대기 중';
    }
  });

  const btn = document.getElementById("btnAssignMain");
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span class="btn-symbol">🎲</span><span>역할 배정하기</span>`;
  }

  isProcessingRoll = false;
  updateSpecs();
  playAppleSound('shuffle');
  showToast("🎉 1인 1역할 배정이 완료되었습니다!");
}

// 9. 모달 제어 & 세그먼트 탭 전환
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("active");
  playAppleSound('click');

  if (id === "sheetModal") {
    const gasInput = document.getElementById("gasUrlInput");
    if (gasInput) gasInput.value = state.gasUrl || "";
  } else if (id === "manageModal") {
    populateManageModal();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
  playAppleSound('click');
}

function initSegmentedTabs() {
  document.querySelectorAll(".apple-segmented-tabs").forEach(tabContainer => {
    tabContainer.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        playAppleSound('click');
        const targetId = btn.dataset.tab;
        const modalBody = btn.closest(".modal-body");

        tabContainer.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (modalBody) {
          modalBody.querySelectorAll(".tab-pane").forEach(pane => {
            pane.style.display = pane.id === targetId ? "block" : "none";
          });
        }
      });
    });
  });
}

// 10. 학생 명단 및 역할 관리 모달 채우기 & 저장 ([object Object] 완전 방지)
function populateManageModal() {
  const studentArea = document.getElementById("manageStudentsText");
  if (studentArea) {
    // 순수 문자열 배열로만 안전하게 변환
    studentArea.value = state.students
      .map(s => sanitizeString(s))
      .filter(s => s && s !== "[object Object]")
      .join("\n");
  }

  const roleArea = document.getElementById("manageRolesText");
  if (roleArea) {
    roleArea.value = state.roles
      .map(r => {
        if (!r) return "";
        const icon = sanitizeString(r.icon, "⭐");
        const name = sanitizeString(r.name, "역할");
        const desc = sanitizeString(r.desc || r.duty, "");
        if (name === "[object Object]") return "";
        return `${icon} ${name} | ${desc}`.trim();
      })
      .filter(Boolean)
      .join("\n");
  }
}

function handleSaveManage() {
  const studentArea = document.getElementById("manageStudentsText");
  const roleArea = document.getElementById("manageRolesText");

  if (studentArea) {
    const rawLines = studentArea.value
      .split("\n")
      .map(s => sanitizeString(s))
      .filter(s => s.length > 0 && s !== "[object Object]");

    if (rawLines.length > 0) {
      state.students = rawLines;
    }
  }

  if (roleArea) {
    const rawRoleLines = roleArea.value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== "[object Object]");

    if (rawRoleLines.length > 0) {
      state.roles = rawRoleLines.map((line, idx) => {
        let icon = "⭐";
        let name = line;
        let desc = "";

        // 유니코드 이모지 안전 매칭
        const emojiMatch = line.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}])/u);
        if (emojiMatch) {
          icon = emojiMatch[0];
          line = line.replace(emojiMatch[0], "").trim();
        }

        // 구분자(|) 처리
        if (line.includes("|")) {
          const parts = line.split("|");
          name = parts[0].trim();
          desc = parts.slice(1).join("|").trim();
        } else {
          name = line.trim();
        }

        name = sanitizeString(name, `역할 ${idx + 1}`);
        desc = sanitizeString(desc, "");

        return {
          id: idx + 1,
          name: name,
          icon: icon,
          desc: desc
        };
      });
    }
  }

  saveToStorage();
  renderCards();
  closeModal("manageModal");
  showToast("명단 및 역할이 성공적으로 저장되었습니다.");
}

function handleResetManage() {
  if (confirm("기본 12명 학생과 12개 기본 역할로 되돌리시겠습니까?")) {
    state.students = [...DEFAULT_STUDENTS];
    state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    state.assignments = [];
    saveToStorage();
    populateManageModal();
    renderCards();
    showToast("기본값으로 복원되었습니다.");
  }
}

// 11. 단일 카드 역할 변경 (스왑) 모달
let currentTargetRoleId = null;

window.openRoleChangeModal = function(roleId) {
  currentTargetRoleId = Number(roleId);
  const role = state.roles.find(r => r.id === currentTargetRoleId);
  if (!role) return;

  const assigned = state.assignments.find(a => (a.roleId === currentTargetRoleId) || (a.role && a.role.id === currentTargetRoleId));
  let currentStudent = assigned ? sanitizeString(assigned.studentName || assigned.student) : "";
  if (!currentStudent || currentStudent === "[object Object]") {
    currentStudent = "배정 없음";
  }

  const titleEl = document.getElementById("roleChangeStudentTitle");
  if (titleEl) {
    titleEl.textContent = `${role.name} (${currentStudent}) 담당 변경`;
  }

  const select = document.getElementById("roleChangeSelect");
  if (select) {
    select.innerHTML = `<option value="">-- 배정 안 함 (공석) --</option>`;
    state.students.forEach(student => {
      const studentClean = sanitizeString(student);
      if (!studentClean) return;

      const otherAssigned = state.assignments.find(a => sanitizeString(a.studentName || a.student) === studentClean);
      const roleText = otherAssigned ? ` (현재: ${otherAssigned.roleName || otherAssigned.role?.name || ''})` : " (미배정)";
      const isSelected = studentClean === currentStudent ? "selected" : "";
      select.innerHTML += `<option value="${escapeHtml(studentClean)}" ${isSelected}>${escapeHtml(studentClean)}${escapeHtml(roleText)}</option>`;
    });
  }

  openModal("roleChangeModal");
};

function handleConfirmRoleChange() {
  if (currentTargetRoleId === null) return;

  const select = document.getElementById("roleChangeSelect");
  const selectedStudent = select ? sanitizeString(select.value) : "";
  const role = state.roles.find(r => r.id === currentTargetRoleId);
  if (!role) return;

  const currentAssigned = state.assignments.find(a => a.roleId === currentTargetRoleId);
  const previousStudent = currentAssigned ? sanitizeString(currentAssigned.studentName) : "";

  // 스왑 처리 (상대방이 다른 역할을 맡고 있었다면 맞바꾸기)
  if (selectedStudent) {
    const otherAssignment = state.assignments.find(a => sanitizeString(a.studentName) === selectedStudent);
    if (otherAssignment && otherAssignment.roleId !== currentTargetRoleId) {
      otherAssignment.studentName = previousStudent;
    }
  }

  if (currentAssigned) {
    currentAssigned.studentName = selectedStudent;
  } else {
    state.assignments.push({
      number: state.assignments.length + 1,
      studentName: selectedStudent,
      roleId: role.id,
      roleName: role.name,
      role: { ...role }
    });
  }

  saveToStorage();
  renderCards();
  closeModal("roleChangeModal");
  showToast(`'${role.name}' 담당 학생이 변경되었습니다.`);
}

// 12. 구글 스프레드시트 연동
function handleSaveGasUrl() {
  const input = document.getElementById("gasUrlInput");
  if (input) {
    state.gasUrl = sanitizeString(input.value);
    saveToStorage();
    playAppleSound('click');
    showToast("Apps Script Web App URL이 저장되었습니다.");
  }
}

async function handleFetchFromSheet() {
  const url = state.gasUrl || sanitizeString(document.getElementById("gasUrlInput")?.value);
  if (!url) {
    showToast("⚠️ Apps Script Web App URL을 입력하세요.");
    return;
  }

  const btn = document.getElementById("btnDoFetchSheet");
  if (btn) btn.textContent = "가져오는 중...";

  try {
    const res = await fetch(`${url}?action=getData&t=${Date.now()}`);
    const data = await res.json();

    if (data && (Array.isArray(data.students) || Array.isArray(data.roles))) {
      if (Array.isArray(data.students) && data.students.length > 0) {
        state.students = data.students.map(s => sanitizeString(s)).filter(Boolean);
      }
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        state.roles = data.roles.map((r, i) => ({
          id: Number(r.id) || i + 1,
          name: sanitizeString(r.name, `역할 ${i + 1}`),
          icon: sanitizeString(r.icon, "⭐"),
          desc: sanitizeString(r.desc || r.duty, "")
        }));
      }
      saveToStorage();
      renderCards();
      closeModal("sheetModal");
      showToast("🎉 스프레드시트에서 명단과 역할을 성공적으로 가져왔습니다!");
    } else {
      throw new Error("올바른 응답 형식이 아닙니다.");
    }
  } catch (err) {
    console.warn("Sheet fetch error", err);
    alert("구글 시트에서 데이터를 불러오지 못했습니다. 배포 권한(모든 사용자) 및 스크립트 코드를 확인하세요.");
  } finally {
    if (btn) btn.textContent = "🔄 시트에서 불러오기";
  }
}

async function handleSaveToSheet() {
  const url = state.gasUrl || sanitizeString(document.getElementById("gasUrlInput")?.value);
  if (!url) {
    showToast("⚠️ Apps Script Web App URL을 입력하세요.");
    return;
  }

  if (state.assignments.length === 0) {
    showToast("⚠️ 배정된 결과가 없습니다. 먼저 역할을 배정하세요.");
    return;
  }

  const btn = document.getElementById("btnDoSaveSheet");
  if (btn) btn.textContent = "저장 중...";

  const payload = {
    className: state.className,
    termName: state.termName,
    assignments: state.assignments
  };

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    closeModal("sheetModal");
    showToast("💾 구글 스프레드시트로 배정 결과 저장 요청이 전송되었습니다!");
  } catch (err) {
    console.warn("Sheet save error", err);
    alert("구글 시트 저장 중 오류가 발생했습니다.");
  } finally {
    if (btn) btn.textContent = "💾 시트로 결과 저장";
  }
}

// 13. 결과 텍스트 복사 (알림장 및 메신저 전송용)
function handleCopyResult() {
  if (state.assignments.length === 0) {
    showToast("⚠️ 먼저 역할을 배정해 주세요.");
    return;
  }

  let text = `📢 [${state.className} 1인 1역할 배정표 - ${state.termName}]\n\n`;
  state.roles.forEach((role, idx) => {
    const assigned = state.assignments.find(a => a.roleId === role.id || a.role?.id === role.id);
    const student = assigned ? sanitizeString(assigned.studentName) : "미배정";
    text += `${idx + 1}. ${role.icon || '⭐'} ${role.name}: ${student}\n   (${role.desc || ''})\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    playAppleSound('click');
    showToast("📋 배정 결과가 클립보드에 복사되었습니다! 알림장에 붙여넣으세요.");
  }).catch(() => {
    showToast("클립보드 접근 권한을 확인하세요.");
  });
}

function handleCopyGasCode() {
  const code = document.getElementById("gasCodeSnippet")?.innerText;
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      playAppleSound('click');
      showToast("📋 Apps Script 코드가 복사되었습니다!");
    });
  }
}

// 14. 플로팅 알림 토스트
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;

  toast.textContent = sanitizeString(message);
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// 15. 초기 로드 및 DOM 바인딩
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();

  // 인라인 인풋 연동
  const classInput = document.getElementById("classInput");
  if (classInput) {
    classInput.value = state.className;
    classInput.addEventListener("input", (e) => {
      state.className = sanitizeString(e.target.value, "3학년 2반");
      saveToStorage();
      updatePrintHeader();
    });
  }

  const termInput = document.getElementById("termInput");
  if (termInput) {
    termInput.value = state.termName;
    termInput.addEventListener("input", (e) => {
      state.termName = sanitizeString(e.target.value, "2026학년도 1학기");
      saveToStorage();
      updatePrintHeader();
    });
  }

  // 상단 바 버튼
  document.getElementById("btnSheetLoad")?.addEventListener("click", () => openModal("sheetModal"));
  document.getElementById("btnSheetSave")?.addEventListener("click", () => openModal("sheetModal"));
  document.getElementById("btnManage")?.addEventListener("click", () => openModal("manageModal"));
  document.getElementById("btnPrint")?.addEventListener("click", () => {
    updatePrintHeader();
    window.print();
  });

  // 메인 액션 덱 버튼
  document.getElementById("btnAssignMain")?.addEventListener("click", handleAssignWithCountdown);
  document.getElementById("btnReshuffle")?.addEventListener("click", handleAssignWithCountdown);
  document.getElementById("btnCopyResult")?.addEventListener("click", handleCopyResult);

  // 시트 모달 액션
  document.getElementById("btnSaveGasUrl")?.addEventListener("click", handleSaveGasUrl);
  document.getElementById("btnDoFetchSheet")?.addEventListener("click", handleFetchFromSheet);
  document.getElementById("btnDoSaveSheet")?.addEventListener("click", handleSaveToSheet);
  document.getElementById("btnCopyGasCode")?.addEventListener("click", handleCopyGasCode);

  // 관리 모달 액션
  document.getElementById("btnSaveManage")?.addEventListener("click", handleSaveManage);
  document.getElementById("btnResetManage")?.addEventListener("click", handleResetManage);

  // 단일 역할 변경 확인
  document.getElementById("btnConfirmRoleChange")?.addEventListener("click", handleConfirmRoleChange);

  // 모달 닫기
  document.querySelectorAll(".btn-modal-close, .btn-cancel").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay");
      if (modal) modal.classList.remove("active");
    });
  });

  initSegmentedTabs();
  renderCards();
});
