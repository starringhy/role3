/**
 * ==========================================================================
 * 우리 반 1인 1역할 배정 시스템 - script.js (Apple Pink Edition)
 * 방어적 프로그래밍 완벽 적용: [object Object], null, undefined 절대 방지
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

// 2. 전역 상태 객체
const state = {
  className: "3학년 2반",
  termName: "2026학년도 1학기",
  students: [...DEFAULT_STUDENTS],
  roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
  assignments: [], // { number: 1, studentName: '김민준', roleId: 1, roleName: '칠판 도우미', role: {...} }
  gasUrl: ""
};

// 3. 강력한 안전 문자열 정제 함수 ([object Object], null, undefined 완벽 차단)
function extractCleanString(val, fallback = "") {
  if (val === null || val === undefined) return fallback;

  // 객체가 전달되었을 경우 내부 필드 안전 탐색
  if (typeof val === "object") {
    const candidate = val.name || val.studentName || val.student || val.text || val.value || val.title || "";
    return extractCleanString(candidate, fallback);
  }

  let str = String(val).trim();

  // 자바스크립트 기본 객체 직렬화 오류 방지
  if (
    str === "[object Object]" ||
    str === "null" ||
    str === "undefined" ||
    str === "NaN" ||
    str.startsWith("[object")
  ) {
    return fallback;
  }

  return str;
}

// 학생 이름 전용 정제 (앞자리 번호 '1. ', '01. ' 등 자동 제거)
function extractCleanStudentName(val) {
  let name = extractCleanString(val, "");
  if (!name) return "";

  // "1. 김민준", "01. 김민준", "1) 김민준", "1 김민준" 형태의 번호 제거
  name = name.replace(/^[\d]{1,2}[\s.\-)]+\s*/, "").trim();

  return name;
}

function escapeHtml(str) {
  const clean = extractCleanString(str, "");
  if (!clean) return "";
  return clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 4. Web Audio API 맑은 챠임 & 햅틱 사운드
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

// 5. 로컬스토리지 저장 및 불러오기 (데이터 오염 완전 복구)
const STORAGE_KEY = 'class_role_system_apple_pink_v5';

function saveToStorage() {
  try {
    const dataToSave = {
      className: extractCleanString(state.className, "3학년 2반"),
      termName: extractCleanString(state.termName, "2026학년도 1학기"),
      students: state.students.map(s => extractCleanStudentName(s)).filter(Boolean),
      roles: state.roles.map((r, idx) => ({
        id: Number(r.id) || idx + 1,
        name: extractCleanString(r.name, `역할 ${idx + 1}`),
        icon: extractCleanString(r.icon, "⭐"),
        desc: extractCleanString(r.desc, "")
      })),
      assignments: state.assignments.map((a, idx) => ({
        number: Number(a.number) || idx + 1,
        studentName: extractCleanStudentName(a.studentName),
        roleId: Number(a.roleId || a.role?.id) || idx + 1,
        roleName: extractCleanString(a.roleName || a.role?.name, ""),
        role: a.role ? {
          id: Number(a.role.id) || idx + 1,
          name: extractCleanString(a.role.name, "역할"),
          icon: extractCleanString(a.role.icon, "⭐"),
          desc: extractCleanString(a.role.desc, "")
        } : null
      })),
      gasUrl: extractCleanString(state.gasUrl, "")
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("Storage save error", e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.students = [...DEFAULT_STUDENTS];
      state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
      state.assignments = [];
      return;
    }

    const parsed = JSON.parse(raw);
    state.className = extractCleanString(parsed.className, "3학년 2반");
    state.termName = extractCleanString(parsed.termName, "2026학년도 1학기");
    state.gasUrl = extractCleanString(parsed.gasUrl, "");

    // 1) 학생 명단 정제 및 오염 데이터 방어
    if (Array.isArray(parsed.students) && parsed.students.length > 0) {
      const cleanStudents = parsed.students
        .map(s => extractCleanStudentName(s))
        .filter(s => s.length > 0);

      state.students = cleanStudents.length > 0 ? cleanStudents : [...DEFAULT_STUDENTS];
    } else {
      state.students = [...DEFAULT_STUDENTS];
    }

    // 2) 역할 목록 정제
    if (Array.isArray(parsed.roles) && parsed.roles.length > 0) {
      const cleanRoles = parsed.roles.map((r, idx) => {
        if (!r || typeof r !== "object") {
          return { id: idx + 1, name: extractCleanString(r, `역할 ${idx + 1}`), icon: "⭐", desc: "" };
        }
        return {
          id: Number(r.id) || idx + 1,
          name: extractCleanString(r.name, `역할 ${idx + 1}`),
          icon: extractCleanString(r.icon, "⭐"),
          desc: extractCleanString(r.desc, "")
        };
      }).filter(r => r.name.length > 0);

      state.roles = cleanRoles.length > 0 ? cleanRoles : JSON.parse(JSON.stringify(DEFAULT_ROLES));
    } else {
      state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    }

    // 3) 배정 내역 정제
    if (Array.isArray(parsed.assignments)) {
      state.assignments = parsed.assignments.map((a, idx) => {
        const student = extractCleanStudentName(a.studentName);
        const rId = Number(a.roleId || a.role?.id) || idx + 1;
        const rName = extractCleanString(a.roleName || a.role?.name, "");
        return {
          number: Number(a.number) || idx + 1,
          studentName: student,
          roleId: rId,
          roleName: rName,
          role: a.role ? {
            id: Number(a.role.id) || rId,
            name: extractCleanString(a.role.name, rName),
            icon: extractCleanString(a.role.icon, "⭐"),
            desc: extractCleanString(a.role.desc, "")
          } : null
        };
      });
    } else {
      state.assignments = [];
    }
  } catch (e) {
    console.warn("Storage load exception, resetting to defaults", e);
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
    card.dataset.roleId = String(role.id);

    // 해당 역할에 배정된 학생 안전하게 검색
    const assignedItem = state.assignments.find(item => {
      if (!item) return false;
      if (Number(item.roleId) === Number(role.id)) return true;
      if (item.role && Number(item.role.id) === Number(role.id)) return true;
      if (item.roleName && item.roleName === role.name) return true;
      return false;
    });

    const studentName = assignedItem ? extractCleanStudentName(assignedItem.studentName) : "";

    card.innerHTML = `
      <div class="card-header-bar">
        <span class="card-student-number">No. ${String(idx + 1).padStart(2, '0')}</span>
        <div class="card-role-badge">${escapeHtml(role.icon || '⭐')}</div>
      </div>
      <div class="card-body-content">
        <h3 class="card-role-name">${escapeHtml(role.name)}</h3>
        <p class="card-role-desc">${escapeHtml(role.desc || '')}</p>
        <div class="card-assigned-block" onclick="openRoleChangeModal(${role.id})" title="클릭하여 담당 학생 변경">
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

// 7. 스펙 메트릭스 및 인쇄 헤더 업데이트
function updateSpecs() {
  const totalStudentsEl = document.getElementById("statTotalStudents");
  if (totalStudentsEl) totalStudentsEl.textContent = state.students.length;

  const totalRolesEl = document.getElementById("statTotalRoles");
  if (totalRolesEl) totalRolesEl.textContent = state.roles.length;

  const assignedCount = state.assignments.filter(a => a && extractCleanStudentName(a.studentName)).length;
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

// 8. [🎲 역할 배정하기] 3, 2, 1 카운트다운 & 슬롯 롤링 애니메이션
let isProcessingRoll = false;

function handleAssignWithCountdown() {
  if (isProcessingRoll) return;

  if (state.students.length === 0) {
    showToast("⚠️ 등록된 학생이 없습니다. 상단 [명단 및 역할 관리]에서 등록해 주세요.");
    return;
  }
  if (state.roles.length === 0) {
    showToast("⚠️ 등록된 역할이 없습니다. 상단 [명단 및 역할 관리]에서 등록해 주세요.");
    return;
  }

  isProcessingRoll = true;
  const btn = document.getElementById("btnAssignMain");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-symbol">⏳</span><span>배정 진행 중...</span>`;
  }

  // Fisher-Yates 완전 무작위 셔플
  const shuffledStudents = [...state.students];
  for (let i = shuffledStudents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
  }

  // 3, 2, 1 카운트다운 실행
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
    { count: "짠! 🎉", cheer: "우리 반 1인 1역할 결과를 공개합니다! 🎈" }
  ];

  let step = 0;

  function nextStep() {
    const current = steps[step];
    numberEl.textContent = current.count;
    if (cheerEl) cheerEl.textContent = current.cheer;

    numberEl.classList.remove("pop");
    void numberEl.offsetWidth; // DOM 리플로우 유도하여 애니메이션 재트리거
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
        const randStudent = state.students[Math.floor(Math.random() * state.students.length)];
        slot.textContent = extractCleanStudentName(randStudent);
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
    const student = extractCleanStudentName(shuffledStudents[idx] || "");
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

  // 화면 카드 슬롯 업데이트
  state.roles.forEach(role => {
    const slot = document.getElementById(`slot-name-${role.id}`);
    const assigned = state.assignments.find(a => Number(a.roleId) === Number(role.id));
    if (slot) {
      const name = assigned ? extractCleanStudentName(assigned.studentName) : "";
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

// 9. 모달 관리 & 세그먼트 탭 전환
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("active");
  playAppleSound('click');

  if (id === "sheetModal") {
    const gasInput = document.getElementById("gasUrlInput");
    if (gasInput) gasInput.value = state.gasUrl || "";
  } else if (id === "manageModal") {
    // 명단 및 역할 관리 모달 열릴 때 항상 1번째 탭으로 초기화 및 데이터 채우기
    resetManageTabs();
    populateManageModal();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
  playAppleSound('click');
}

function resetManageTabs() {
  const tabStudents = document.getElementById("tabBtnStudents");
  const tabRoles = document.getElementById("tabBtnRoles");
  const paneStudents = document.getElementById("tabManageStudents");
  const paneRoles = document.getElementById("tabManageRoles");

  if (tabStudents) tabStudents.classList.add("active");
  if (tabRoles) tabRoles.classList.remove("active");
  if (paneStudents) paneStudents.style.display = "block";
  if (paneRoles) paneRoles.style.display = "none";
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

        if (modalBody && targetId) {
          modalBody.querySelectorAll(".tab-pane").forEach(pane => {
            pane.style.display = pane.id === targetId ? "block" : "none";
          });
        }
      });
    });
  });
}

// 10. 학생 명단 및 역할 관리 모달 데이터 바인딩 & 실시간 카운터
function updateManageCounters() {
  const studentArea = document.getElementById("manageStudentsText");
  const roleArea = document.getElementById("manageRolesText");

  let studentCount = 0;
  if (studentArea) {
    const lines = studentArea.value
      .split(/[\n,]/)
      .map(s => extractCleanStudentName(s))
      .filter(Boolean);
    studentCount = lines.length;
  }

  let roleCount = 0;
  if (roleArea) {
    const lines = roleArea.value
      .split("\n")
      .map(s => extractCleanString(s))
      .filter(Boolean);
    roleCount = lines.length;
  }

  const badgeS = document.getElementById("badgeStudentCount");
  if (badgeS) badgeS.textContent = `${studentCount}명`;

  const badgeR = document.getElementById("badgeRoleCount");
  if (badgeR) badgeR.textContent = `${roleCount}개`;

  const hintS = document.getElementById("studentCountHint");
  if (hintS) hintS.textContent = `현재 ${studentCount}명 등록됨`;

  const hintR = document.getElementById("roleCountHint");
  if (hintR) {
    if (studentCount > 0 && roleCount !== studentCount) {
      hintR.textContent = `현재 ${roleCount}개 (학생 ${studentCount}명과 맞춤 권장)`;
      hintR.style.color = "#FF2D55";
    } else {
      hintR.textContent = `현재 ${roleCount}개 등록됨`;
      hintR.style.color = "#86868B";
    }
  }
}

function populateManageModal() {
  const studentArea = document.getElementById("manageStudentsText");
  if (studentArea) {
    studentArea.value = state.students
      .map(s => extractCleanStudentName(s))
      .filter(Boolean)
      .join("\n");
  }

  const roleArea = document.getElementById("manageRolesText");
  if (roleArea) {
    roleArea.value = state.roles
      .map(r => {
        if (!r) return "";
        const icon = extractCleanString(r.icon, "⭐");
        const name = extractCleanString(r.name, "역할");
        const desc = extractCleanString(r.desc, "");
        if (desc) {
          return `${icon} ${name} | ${desc}`.trim();
        }
        return `${icon} ${name}`.trim();
      })
      .filter(Boolean)
      .join("\n");
  }

  updateManageCounters();
}

function handleSaveManage() {
  const studentArea = document.getElementById("manageStudentsText");
  const roleArea = document.getElementById("manageRolesText");

  // 학생 명단 파싱 (줄바꿈 또는 쉼표 분리 허용)
  if (studentArea) {
    const rawStudents = studentArea.value
      .split(/[\n,]/)
      .map(s => extractCleanStudentName(s))
      .filter(Boolean);

    if (rawStudents.length > 0) {
      state.students = rawStudents;
    } else {
      showToast("⚠️ 최소 1명 이상의 학생 이름을 입력해야 합니다.");
      return;
    }
  }

  // 역할 목록 파싱 (이모지, 이름, 설명 분리)
  if (roleArea) {
    const rawRoleLines = roleArea.value
      .split("\n")
      .map(s => extractCleanString(s))
      .filter(Boolean);

    if (rawRoleLines.length > 0) {
      state.roles = rawRoleLines.map((rawLine, idx) => {
        let line = rawLine;
        let icon = "⭐";
        let name = "";
        let desc = "";

        // 앞자리 번호(1. 등) 제거
        line = line.replace(/^[\d]{1,2}[\s.\-)]+\s*/, "").trim();

        // 탭(\t) 또는 파이프(|) 구분자 지원
        if (line.includes("\t")) {
          const parts = line.split("\t");
          name = parts[0].trim();
          desc = parts.slice(1).join(" ").trim();
        } else if (line.includes("|")) {
          const parts = line.split("|");
          name = parts[0].trim();
          desc = parts.slice(1).join("|").trim();
        } else {
          name = line.trim();
        }

        // 선두 이모지 추출
        const firstToken = name.split(" ")[0];
        // 이모지 여부 체크 (한글/영숫자가 아닌 경우)
        if (firstToken && /^[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}|\p{Extended_Pictographic}/u.test(firstToken)) {
          icon = firstToken;
          name = name.substring(firstToken.length).trim();
        }

        name = extractCleanString(name, `역할 ${idx + 1}`);
        desc = extractCleanString(desc, "");

        return {
          id: idx + 1,
          name: name,
          icon: icon,
          desc: desc
        };
      });
    } else {
      showToast("⚠️ 최소 1개 이상의 역할을 입력해야 합니다.");
      return;
    }
  }

  saveToStorage();
  renderCards();
  closeModal("manageModal");
  showToast("✅ 학생 명단과 역할 목록이 안전하게 저장되었습니다.");
}

function handleResetManage() {
  if (confirm("기본 12명 학생과 12개 기본 역할로 되돌리시겠습니까?")) {
    state.students = [...DEFAULT_STUDENTS];
    state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    state.assignments = [];
    saveToStorage();
    populateManageModal();
    renderCards();
    showToast("기본 데이터로 복원되었습니다.");
  }
}

// 11. 단일 카드 담당 학생 수동 변경 (스왑) 모달
let currentTargetRoleId = null;

window.openRoleChangeModal = function(roleId) {
  currentTargetRoleId = Number(roleId);
  const role = state.roles.find(r => Number(r.id) === currentTargetRoleId);
  if (!role) return;

  const assigned = state.assignments.find(a => Number(a.roleId) === currentTargetRoleId);
  let currentStudent = assigned ? extractCleanStudentName(assigned.studentName) : "";
  if (!currentStudent) {
    currentStudent = "배정 없음 (공석)";
  }

  const titleEl = document.getElementById("roleChangeStudentTitle");
  if (titleEl) {
    titleEl.textContent = `${role.name} (${currentStudent}) 담당 변경`;
  }

  const select = document.getElementById("roleChangeSelect");
  if (select) {
    select.innerHTML = `<option value="">-- 배정 안 함 (공석) --</option>`;
    state.students.forEach(student => {
      const studentClean = extractCleanStudentName(student);
      if (!studentClean) return;

      const otherAssigned = state.assignments.find(a => extractCleanStudentName(a.studentName) === studentClean);
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
  const selectedStudent = select ? extractCleanStudentName(select.value) : "";
  const role = state.roles.find(r => Number(r.id) === currentTargetRoleId);
  if (!role) return;

  const currentAssigned = state.assignments.find(a => Number(a.roleId) === currentTargetRoleId);
  const previousStudent = currentAssigned ? extractCleanStudentName(currentAssigned.studentName) : "";

  // 스왑 처리 (새로 선택한 학생이 이미 다른 역할을 맡고 있었다면 맞바꿈)
  if (selectedStudent) {
    const otherAssignment = state.assignments.find(a => extractCleanStudentName(a.studentName) === selectedStudent);
    if (otherAssignment && Number(otherAssignment.roleId) !== currentTargetRoleId) {
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
    state.gasUrl = extractCleanString(input.value);
    saveToStorage();
    playAppleSound('click');
    showToast("Apps Script Web App URL이 저장되었습니다.");
  }
}

async function handleFetchFromSheet() {
  const url = state.gasUrl || extractCleanString(document.getElementById("gasUrlInput")?.value);
  if (!url) {
    showToast("⚠️ Apps Script Web App URL을 먼저 입력하세요.");
    return;
  }

  const btn = document.getElementById("btnDoFetchSheet");
  if (btn) btn.textContent = "가져오는 중...";

  try {
    const res = await fetch(`${url}?action=getData&t=${Date.now()}`);
    const data = await res.json();

    if (data && (Array.isArray(data.students) || Array.isArray(data.roles))) {
      if (Array.isArray(data.students) && data.students.length > 0) {
        state.students = data.students.map(s => extractCleanStudentName(s)).filter(Boolean);
      }
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        state.roles = data.roles.map((r, i) => ({
          id: Number(r.id) || i + 1,
          name: extractCleanString(r.name, `역할 ${i + 1}`),
          icon: extractCleanString(r.icon, "⭐"),
          desc: extractCleanString(r.desc, "")
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
  const url = state.gasUrl || extractCleanString(document.getElementById("gasUrlInput")?.value);
  if (!url) {
    showToast("⚠️ Apps Script Web App URL을 먼저 입력하세요.");
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
    assignments: state.assignments.map(a => ({
      number: a.number || 1,
      studentName: extractCleanStudentName(a.studentName),
      roleName: extractCleanString(a.roleName || a.role?.name, ""),
      role: {
        id: a.role?.id || a.roleId || 1,
        name: extractCleanString(a.role?.name || a.roleName, "역할"),
        icon: extractCleanString(a.role?.icon, "⭐"),
        desc: extractCleanString(a.role?.desc, "")
      }
    }))
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
    showToast("⚠️ 먼저 [역할 배정하기]를 눌러 배정을 완료해 주세요.");
    return;
  }

  let text = `📢 [${state.className} 1인 1역할 배정표 - ${state.termName}]\n\n`;
  state.roles.forEach((role, idx) => {
    const assigned = state.assignments.find(a => Number(a.roleId) === Number(role.id));
    const student = assigned ? extractCleanStudentName(assigned.studentName) : "미배정";
    text += `${idx + 1}. ${role.icon || '⭐'} ${role.name}: ${student}\n   (${role.desc || ''})\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    playAppleSound('click');
    showToast("📋 배정 결과가 복사되었습니다! 알림장/메신저에 붙여넣으세요.");
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

  toast.textContent = extractCleanString(message, "");
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// 15. 초기화 및 이벤트 리스너 바인딩
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();

  // 인라인 인풋 연동
  const classInput = document.getElementById("classInput");
  if (classInput) {
    classInput.value = state.className;
    classInput.addEventListener("input", (e) => {
      state.className = extractCleanString(e.target.value, "3학년 2반");
      saveToStorage();
      updatePrintHeader();
    });
  }

  const termInput = document.getElementById("termInput");
  if (termInput) {
    termInput.value = state.termName;
    termInput.addEventListener("input", (e) => {
      state.termName = extractCleanString(e.target.value, "2026학년도 1학기");
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

  // 관리 모달 액션 & 실시간 입력 카운터 감지
  document.getElementById("btnSaveManage")?.addEventListener("click", handleSaveManage);
  document.getElementById("btnResetManage")?.addEventListener("click", handleResetManage);

  document.getElementById("manageStudentsText")?.addEventListener("input", updateManageCounters);
  document.getElementById("manageRolesText")?.addEventListener("input", updateManageCounters);

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
