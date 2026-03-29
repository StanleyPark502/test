const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3456;
const TASKS_FILE = path.join(__dirname, 'tasks.json');

function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch {
    return { version: '1.0', tasks: [] };
  }
}

function writeTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, {});
    return;
  }

  // Serve static files from public/
  if (url.pathname === '/' || url.pathname === '/index.html') {
    sendFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html; charset=utf-8');
    return;
  }
  if (url.pathname === '/pc-parts' || url.pathname === '/pc-parts-price.html') {
    sendFile(res, path.join(__dirname, 'public', 'pc-parts-price.html'), 'text/html; charset=utf-8');
    return;
  }

  // API: List all tasks
  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    const data = readTasks();
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    let tasks = data.tasks;
    if (status) tasks = tasks.filter(t => t.status === status);
    if (priority) tasks = tasks.filter(t => t.priority === priority);
    sendJson(res, 200, { tasks });
    return;
  }

  // API: Create a new task
  if (url.pathname === '/api/tasks' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const data = readTasks();
      const now = new Date().toISOString();
      const task = {
        id: crypto.randomUUID(),
        title: body.title || '제목 없음',
        description: body.description || '',
        priority: body.priority || 'medium',
        status: 'pending',
        tags: body.tags || [],
        createdAt: now,
        createdFrom: 'mobile',
        updatedAt: now,
      };
      data.tasks.push(task);
      writeTasks(data);
      sendJson(res, 201, { task });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // API: Update a task
  const updateMatch = url.pathname.match(/^\/api\/tasks\/(.+)$/);
  if (updateMatch && req.method === 'PUT') {
    try {
      const id = updateMatch[1];
      const body = await parseBody(req);
      const data = readTasks();
      const idx = data.tasks.findIndex(t => t.id === id);
      if (idx === -1) { sendJson(res, 404, { error: 'Task not found' }); return; }
      const task = data.tasks[idx];
      if (body.title !== undefined) task.title = body.title;
      if (body.description !== undefined) task.description = body.description;
      if (body.priority !== undefined) task.priority = body.priority;
      if (body.status !== undefined) task.status = body.status;
      if (body.tags !== undefined) task.tags = body.tags;
      task.updatedAt = new Date().toISOString();
      data.tasks[idx] = task;
      writeTasks(data);
      sendJson(res, 200, { task });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // API: Delete a task
  if (updateMatch && req.method === 'DELETE') {
    const id = updateMatch[1];
    const data = readTasks();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx === -1) { sendJson(res, 404, { error: 'Task not found' }); return; }
    data.tasks.splice(idx, 1);
    writeTasks(data);
    sendJson(res, 200, { deleted: true });
    return;
  }

  // API: Export tasks for Claude Code cowork (Markdown format)
  if (url.pathname === '/api/cowork-export' && req.method === 'GET') {
    const data = readTasks();
    const pending = data.tasks.filter(t => t.status === 'pending');
    let md = '# Cowork 작업 목록\n\n';
    pending.forEach((t, i) => {
      const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[t.priority] || '⚪';
      md += `## ${i + 1}. ${priorityEmoji} ${t.title}\n`;
      if (t.description) md += `${t.description}\n`;
      if (t.tags.length) md += `태그: ${t.tags.join(', ')}\n`;
      md += `우선순위: ${t.priority} | 생성: ${t.createdAt}\n\n`;
    });
    res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
    res.end(md);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Cross-Device Task Sync Server`);
  console.log(`   로컬:  http://localhost:${PORT}`);
  console.log(`\n📱 갤럭시 폰에서 접속하려면:`);
  console.log(`   같은 Wi-Fi에서 랩탑 IP로 접속하세요`);
  console.log(`   예: http://<랩탑IP>:${PORT}\n`);
  console.log(`🤖 Claude Code cowork 연동:`);
  console.log(`   node sync-to-cowork.js\n`);
});
