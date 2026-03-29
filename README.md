# Cross-Device Task Sync for Claude Code Cowork

갤럭시 폰에서 Claude Code cowork 작업을 생성하고 관리하는 크로스 디바이스 태스크 싱크 시스템.

## 문제

- Claude Code의 cowork 모드는 랩탑/데스크탑 전용
- 갤럭시 폰 Claude 앱에서는 cowork 작업 생성/관리 불가
- 이동 중 떠오른 작업을 즉시 등록할 방법이 없음

## 해결

폰 브라우저 → 웹 UI로 작업 생성 → 랩탑 Claude Code가 작업 목록 읽기

```
┌─────────────┐     HTTP/WiFi     ┌──────────────┐     파일 읽기     ┌──────────────┐
│ 갤럭시 폰   │ ──────────────> │ Node.js 서버 │ ──────────────> │ Claude Code  │
│ (브라우저)   │ <────────────── │ (tasks.json) │ <────────────── │ (cowork 모드) │
└─────────────┘                  └──────────────┘                  └──────────────┘
```

## 빠른 시작

### 1. 서버 실행 (랩탑)

```bash
node server.js
```

서버가 `http://localhost:3456` 에서 실행됩니다.

### 2. 갤럭시 폰에서 접속

랩탑과 같은 Wi-Fi에 연결된 상태에서:

```
http://<랩탑IP주소>:3456
```

랩탑 IP 확인:
```bash
# Linux
hostname -I

# macOS
ipconfig getifaddr en0

# Windows
ipconfig
```

### 3. Claude Code cowork에서 사용

```bash
# 대기중인 작업 목록 보기
node sync-to-cowork.js

# 가장 높은 우선순위 작업 1개
node sync-to-cowork.js --next

# 마크다운 파일로 내보내기
node sync-to-cowork.js --markdown

# 실시간 변경 감지
node sync-to-cowork.js --watch

# 작업 시작/완료 처리
node sync-to-cowork.js --start <task-id>
node sync-to-cowork.js --complete <task-id>
```

## API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tasks` | 전체 작업 목록 |
| GET | `/api/tasks?status=pending` | 상태별 필터 |
| POST | `/api/tasks` | 새 작업 생성 |
| PUT | `/api/tasks/:id` | 작업 수정 |
| DELETE | `/api/tasks/:id` | 작업 삭제 |
| GET | `/api/cowork-export` | 마크다운 형식 내보내기 |

### 작업 생성 예시

```bash
curl -X POST http://localhost:3456/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "로그인 버그 수정", "priority": "high", "tags": ["bug"]}'
```

## 파일 구조

```
├── server.js           # HTTP 서버 (API + 정적 파일)
├── sync-to-cowork.js   # Claude Code cowork 연동 스크립트
├── tasks.json          # 작업 데이터 저장소
├── public/
│   └── index.html      # 모바일 웹 UI
├── package.json
└── README.md
```
