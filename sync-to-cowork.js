#!/usr/bin/env node
/**
 * sync-to-cowork.js
 *
 * tasks.json에서 대기중인 작업을 읽어
 * Claude Code cowork에 전달할 수 있는 형식으로 출력합니다.
 *
 * 사용법:
 *   node sync-to-cowork.js              # 대기중 작업을 stdout에 출력
 *   node sync-to-cowork.js --watch      # 파일 변경 감지하여 자동 출력
 *   node sync-to-cowork.js --markdown   # 마크다운 파일로 저장
 *   node sync-to-cowork.js --next       # 가장 우선순위 높은 다음 작업 1개만 출력
 */

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, 'tasks.json');
const OUTPUT_FILE = path.join(__dirname, 'COWORK_TASKS.md');

function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch {
    return { version: '1.0', tasks: [] };
  }
}

function getPendingTasks() {
  const data = readTasks();
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return data.tasks
    .filter(t => t.status === 'pending' || t.status === 'in_progress')
    .sort((a, b) => {
      const statusOrder = { in_progress: 0, pending: 1 };
      const s = (statusOrder[a.status] || 1) - (statusOrder[b.status] || 1);
      if (s !== 0) return s;
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });
}

function formatForCowork(tasks) {
  if (tasks.length === 0) return '작업이 없습니다. 갤럭시 폰에서 새 작업을 추가해주세요.\n';

  let output = '';
  tasks.forEach((t, i) => {
    const priorityIcon = { high: '[HIGH]', medium: '[MED]', low: '[LOW]' }[t.priority] || '[---]';
    const statusIcon = t.status === 'in_progress' ? '[진행중]' : '[대기]';
    output += `${i + 1}. ${priorityIcon} ${statusIcon} ${t.title}\n`;
    if (t.description) output += `   설명: ${t.description}\n`;
    if (t.tags && t.tags.length) output += `   태그: ${t.tags.join(', ')}\n`;
    output += '\n';
  });
  return output;
}

function formatMarkdown(tasks) {
  let md = '# Cowork 작업 목록\n\n';
  md += `> 마지막 동기화: ${new Date().toLocaleString('ko-KR')}\n\n`;

  if (tasks.length === 0) {
    md += '작업이 없습니다.\n';
    return md;
  }

  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const pending = tasks.filter(t => t.status === 'pending');

  if (inProgress.length > 0) {
    md += '## 진행중\n\n';
    inProgress.forEach(t => {
      md += `- **${t.title}**`;
      if (t.description) md += ` - ${t.description}`;
      md += '\n';
    });
    md += '\n';
  }

  if (pending.length > 0) {
    md += '## 대기중\n\n';
    pending.forEach(t => {
      const p = { high: '🔴', medium: '🟡', low: '🟢' }[t.priority] || '⚪';
      md += `- ${p} **${t.title}**`;
      if (t.description) md += ` - ${t.description}`;
      if (t.tags && t.tags.length) md += ` _(${t.tags.join(', ')})_`;
      md += '\n';
    });
    md += '\n';
  }

  return md;
}

function markTaskInProgress(taskId) {
  const data = readTasks();
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'in_progress';
    task.updatedAt = new Date().toISOString();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`작업 "${task.title}" → 진행중으로 변경됨`);
  }
}

function markTaskCompleted(taskId) {
  const data = readTasks();
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'completed';
    task.updatedAt = new Date().toISOString();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`작업 "${task.title}" → 완료로 변경됨`);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--watch')) {
  console.log('파일 변경 감지 모드 (Ctrl+C로 종료)\n');
  const show = () => {
    console.clear();
    console.log('=== Cowork 작업 목록 ===\n');
    console.log(formatForCowork(getPendingTasks()));
    console.log(`마지막 확인: ${new Date().toLocaleString('ko-KR')}`);
  };
  show();
  fs.watch(TASKS_FILE, show);
} else if (args.includes('--markdown')) {
  const tasks = getPendingTasks();
  const md = formatMarkdown(tasks);
  fs.writeFileSync(OUTPUT_FILE, md, 'utf8');
  console.log(`${OUTPUT_FILE} 에 ${tasks.length}개 작업 저장됨`);
} else if (args.includes('--next')) {
  const tasks = getPendingTasks();
  if (tasks.length === 0) {
    console.log('처리할 작업이 없습니다.');
  } else {
    const next = tasks[0];
    console.log(`다음 작업: ${next.title}`);
    if (next.description) console.log(`설명: ${next.description}`);
    console.log(`우선순위: ${next.priority}`);
    console.log(`ID: ${next.id}`);
  }
} else if (args.includes('--complete') && args.length > args.indexOf('--complete') + 1) {
  markTaskCompleted(args[args.indexOf('--complete') + 1]);
} else if (args.includes('--start') && args.length > args.indexOf('--start') + 1) {
  markTaskInProgress(args[args.indexOf('--start') + 1]);
} else {
  const tasks = getPendingTasks();
  console.log(formatForCowork(tasks));
}
