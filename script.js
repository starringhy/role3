/**
 * ==========================================================================
 * 우리 반 1인 1역할 배정 시스템 - script.js (Apple Pink Edition)
 * 기능: 무작위 매칭, 3-2-1 카운트다운, Apple 햅틱 오디오, A4 인쇄, 로컬스토리지 보관, 구글 스프레드시트 연동
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
  assignments: [], // { number: 1, studentName: '김민준', role: { id, name, icon, desc } }
  gasUrl: ""
};

// 3. Apple AirDrop / macOS 햅틱 사운드 합성 (Web Audio API)
function playAppleSound(type = 'shuffle') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'shuffle') {
      // Apple AirDrop 스타일의 맑고 정교한 투톤 글래스 차임 (880Hz -> 1318Hz -> 1760Hz)
      const notes = [
        { freq: 880.00, time: 0.00, dur: 0.22, vol: 0.12 },
        { freq: 1318.51, time: 0.08, dur: 0.26, vol: 0.14 },
        { freq: 1760.00, time: 0.16, dur: 0.40, vol: 0.16 }
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
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
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
    console.debug('Audio autoplay prevented or unsupported', e);
  }
}

// 4. 로컬스토리지 저장 및 불러오기
const STORAGE_KEY = 'class_role_system_apple_pink_v3';

function saveToStorage() {
  const dataToSave = {
    className: state.className,
    termName: state.termName,
    students: state.students,
    roles: state.roles,
    assignments: state.assignments,
    gasUrl: state.gasUrl
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.students = [...DEFAULT_STUDENTS];
    state.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.className = parsed.className || "3학년 2반";
    state.termName = parsed.termName || "2026학년도 1학기";
    state.students = Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : [...DEFAULT_STUDENTS];
    state.roles = Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : JSON.parse(JSON.stringify(DEFAULT_ROLES));
    state.assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
    state.gasUrl = parsed.gasUrl || "";
  } catch (e) {
    console.error("Storage load error", e);
  }
}

// 5. 애플 벤토(Bento) 카드 렌더링
function renderCards() {
  const grid = document.getElementById("assignmentGrid");
  if (!grid) return;

  grid.innerHTML = "";

  state.roles.forEach((role, idx) => {
    const card = document.createElement("article");
    card.className = "role-card";
    card.dataset.roleId = role.id;

    // 현재 역할에 배정된 학생 찾기
    const assignedItem = state.assignments.find(item => item.role && item.role.id === role.id);
    const studentName = assignedItem ? assignedItem.studentName : "";

    card.innerHTML = `
      <div class="card-header-bar">
        <span class="card-student-number">No. ${String(idx + 1).padStart(2, '0')}</span>
        <div class="card-role-badge">${role.icon || '⭐'}</div>
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

// 6. 스펙 통계 및 인쇄 헤더 업데이트
function updateSpecs() {
  document.getElementById("statTotalStudents").textContent = state.students.length;
  document.getElementById("statTotalRoles").textContent = state.roles.length;
  
  const assignedCount = state.assignments.filter(a => a.studentName).length;
  const statAssignedEl = document.getElementById("statAssignedCount");
  statAssignedEl.textContent = `${assignedCount} / ${state.roles.length}`;
  
  if (assignedCount === state.roles.length && state.roles.length > 0) {
    statAssignedEl.className = "spec-value highlight";
  } else {
    statAssignedEl.className = "spec-value";
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

// 7. 역할 배정하기 및 3-2-1 카운트다운
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
        slot.textContent = randName;
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
    const student = shuffledStudents[idx] || "";
    newAssignments.push({
      number: idx + 1,
      studentName: student,
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
    const assigned = state.assignments.find(a => a.role.id === role.id);
    if (slot) {
      slot.className = `assigned-name ${assigned && assigned.studentName ? '' : 'empty'}`;
      slot.textContent = assigned && assigned.studentName ? assigned.studentName : '배정 대기 중';
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

// 8. 모달 제어 & 탭 제어
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
        const parentModal = btn.closest(".modal-body");

        tabContainer.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (parentModal) {
          parentModal.querySelectorAll(".tab-pane").forEach(pane => {
            pane.style.display = pane.id === targetId ? "block" : "none";
          });
        }
      });
    });
  });
}

// 9. 학생 명단 및 역할 관리 모달
function populateManageModal() {
  const studentArea = document.getElementById("manageStudentsText");
  if (studentArea) {
    studentArea.value = state.students.join("\n");
  }

  const roleArea = document.getElementById("manageRolesText");
  if (roleArea) {
    roleArea.value = state.roles.map(r => `${r.icon || '⭐'} ${r.name} | ${r.desc || ''}`).join("\n");
  }
}

function handleSaveManage() {
  const studentArea = document.getElementById("manageStudentsText");
  const roleArea = document.getElementById("manageRolesText");

  if (studentArea) {
    const rawLines = studentArea.value.split("\n").map(s => s.trim()).filter(Boolean);
    if (rawLines.length > 0) {
      state.students = rawLines;
    }
  }

  if (roleArea) {
    const rawRoleLines = roleArea.value.split("\n").map(s => s.trim()).filter(Boolean);
    if (rawRoleLines.length > 0) {
      state.roles = rawRoleLines.map((line, idx) => {
        let icon = "⭐";
        let name = line;
        let desc = "";

        // 이모지 분리
        const emojiMatch = line.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s*/u);
        if (emojiMatch) {
          icon = emojiMatch[1];
          line = line.replace(emojiMatch[0], "").trim();
        }

        // 구분자(|) 분리
        if (line.includes("|")) {
          const parts = line.split("|");
          name = parts[0].trim();
          desc = parts.slice(1).join("|").trim();
        } else {
          name = line.trim();
        }

        return {
          id: idx + 1,
          name: name || `역할 ${idx + 1}`,
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

// 10. 단일 카드 역할 변경 (스왑) 모달
let currentTargetRoleId = null;

window.openRoleChangeModal = function(roleId) {
  currentTargetRoleId = roleId;
  const role = state.roles.find(r => r.id === roleId);
  if (!role) return;

  const assigned = state.assignments.find(a => a.role.id === roleId);
  const currentStudent = assigned ? assigned.studentName : "배정 없음";

  document.getElementById("roleChangeStudentTitle").textContent = `${role.name} (${currentStudent}) 담당 변경`;

  const select = document.getElementById("roleChangeSelect");
  if (select) {
    select.innerHTML = `<option value="">-- 배정 안 함 (공석) --</option>`;
    state.students.forEach(student => {
      const otherAssigned = state.assignments.find(a => a.studentName === student);
      const roleText = otherAssigned ? ` (현재: ${otherAssigned.role.name})` : " (미배정)";
      const isSelected = student === currentStudent ? "selected" : "";
      select.innerHTML += `<option value="${escapeHtml(student)}" ${isSelected}>${escapeHtml(student)}${roleText}</option>`;
    });
  }

  openModal("roleChangeModal");
};

function handleConfirmRoleChange() {
  if (currentTargetRoleId === null) return;

  const select = document.getElementById("roleChangeSelect");
  const selectedStudent = select ? select.value : "";
  const role = state.roles.find(r => r.id === currentTargetRoleId);
  if (!role) return;

  const currentAssigned = state.assignments.find(a => a.role.id === currentTargetRoleId);
  const previousStudent = currentAssigned ? currentAssigned.studentName : "";

  // 스왑 처리 (만약 선택된 학생이 다른 역할을 맡고 있었다면 맞바꾸기)
  if (selectedStudent) {
    const otherAssignment = state.assignments.find(a => a.studentName === selectedStudent);
    if (otherAssignment && otherAssignment.role.id !== currentTargetRoleId) {
      otherAssignment.studentName = previousStudent;
    }
  }

  if (currentAssigned) {
    currentAssigned.studentName = selectedStudent;
  } else {
    state.assignments.push({
      number: state.assignments.length + 1,
      studentName: selectedStudent,
      role: { ...role }
    });
  }

  saveToStorage();
  renderCards();
  closeModal("roleChangeModal");
  showToast(`'${role.name}' 담당 학생이 변경되었습니다.`);
}

// 11. 구글 스프레드시트 연동
function handleSaveGasUrl() {
  const input = document.getElementById("gasUrlInput");
  if (input) {
    state.gasUrl = input.value.trim();
    saveToStorage();
    playAppleSound('click');
    showToast("Apps Script Web App URL이 저장되었습니다.");
  }
}

async function handleFetchFromSheet() {
  const url = state.gasUrl || document.getElementById("gasUrlInput")?.value.trim();
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
        state.students = data.students.map(s => String(s).trim()).filter(Boolean);
      }
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        state.roles = data.roles.map((r, i) => ({
          id: r.id || i + 1,
          name: r.name || `역할 ${i + 1}`,
          icon: r.icon || "⭐",
          desc: r.desc || ""
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
  const url = state.gasUrl || document.getElementById("gasUrlInput")?.value.trim();
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

// 12. 결과 텍스트 복사 (알림장 및 메신저 전송용)
function handleCopyResult() {
  if (state.assignments.length === 0) {
    showToast("⚠️ 먼저 역할을 배정해 주세요.");
    return;
  }

  let text = `📢 [${state.className} 1인 1역할 배정표 - ${state.termName}]\n\n`;
  state.roles.forEach((role, idx) => {
    const assigned = state.assignments.find(a => a.role.id === role.id);
    const student = assigned ? assigned.studentName : "미배정";
    text += `${idx + 1}. ${role.icon || '⭐'} ${role.name}: ${student}\n   (${role.desc})\n`;
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

// 13. 알림 토스트
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
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

// 14. 초기 로드 및 DOM 바인딩
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();

  // 인라인 인풋 연동
  const classInput = document.getElementById("classInput");
  if (classInput) {
    classInput.value = state.className;
    classInput.addEventListener("input", (e) => {
      state.className = e.target.value.trim() || "3학년 2반";
      saveToStorage();
      updatePrintHeader();
    });
  }

  const termInput = document.getElementById("termInput");
  if (termInput) {
    termInput.value = state.termName;
    termInput.addEventListener("input", (e) => {
      state.termName = e.target.value.trim() || "2026학년도 1학기";
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
