# 홈닉 Easy — 프로젝트 스펙

## 개요
아파트 입주민 대상 **라이트/시니어 친화형** 웹 앱.
기존 노크타운(→ 홈닉) 앱이 무거운 사용자(시니어, 라이트 유저)를 위한 Easy 모드.

## 기술 스택
- **Vue 3** (Composition API `<script setup>`)
- **Vite** (빌드 도구)
- **Vue Router 4** (라우팅, 현재 미사용 — 단일 페이지 구조)
- CSS: 컴포넌트 scoped 스타일 (별도 CSS 프레임워크 없음)

## 프로젝트 구조
```
src/
├── main.js
├── App.vue              # 루트: 헤더 + <RouterView>
├── router/
│   └── index.js
├── views/               # 페이지 컴포넌트
│   ├── HomeView.vue     # 메인 카드 그리드
│   ├── IotView.vue      # 홈 IoT
│   ├── BookingView.vue  # 커뮤니티시설 예약
│   ├── NoticeView.vue   # 공지사항
│   ├── CarRegView.vue   # 방문차량 등록
│   └── ChatView.vue     # 모두챗
└── components/
    └── AppHeader.vue    # 공통 헤더
```

## 레이아웃 구조
단일 페이지(HomeView). 라우팅 없이 **카드 그리드 + 확장 패널** 방식.
- 상단: 2열 카드 그리드 (5개 메뉴, 모두챗은 전체너비)
- 하단: 선택 카드의 콘텐츠가 패널로 확장 (재클릭 시 닫힘)

## 메뉴 스펙 (홈 카드 그리드)

### 1. 홈 IoT (`/iot`)
- 조명 on/off 토글
- 냉방 on/off 토글
- 방범 on 전용 (켜면 비활성화 — 끄기 불가)
- 각 토글 변경 시 API 호출 (현재는 mock)

### 2. 커뮤니티시설 예약 (`/booking`)
- 시설 탭: 헬스장, 수영장, 골프장, BBQ장, 독서실
- 날짜 선택 → 시간 슬롯 선택 → 예약 신청
- 마감된 슬롯은 비활성화

### 3. 공지사항 (`/notice`)
- 긴급 / 안내 / 일반 태그 구분
- 목록 조회, 상세 확장(accordion)

### 4. 방문차량 등록 (`/car`)
- 입력: 차량번호, 방문일시, 방문 목적(선택)
- 등록 완료 시 토스트 피드백

### 5. 모두챗 (`/chat`)
- 입주민 공개 채팅방
- 메시지 전송 (현재는 mock)

## 디자인 원칙
- **시니어 친화**: 큰 텍스트(최소 15px), 큰 터치 영역(최소 44px)
- 모바일 우선 (max-width 430px 중앙 정렬)
- 카드 기반 그리드 레이아웃 (홈 화면)
- 라이트 배경 (#f0f2f5), 화이트 카드, 둥근 모서리
- 메인 컬러: #1a56db (파랑)
- 토스트 메시지로 액션 피드백

## API 연동 (향후)
- 모든 API 호출은 `src/api/` 디렉토리에 모듈화 예정
- 현재는 각 View 내 mock 데이터로 동작
- IoT 토글: `PATCH /api/iot/{device}`
- 시설 예약: `POST /api/booking`
- 차량 등록: `POST /api/visitor-car`
- 공지 조회: `GET /api/notices`
- 채팅: WebSocket 또는 `GET/POST /api/chat`

## 개발 명령
```bash
npm run dev      # 개발 서버 (localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## MCP 워크플로우

### 연결된 MCP 서버
- **Pencil MCP**: 디자인 생성 및 편집 (`untitled.pen`)
- **GitHub MCP**: PR/이슈/레포 관리 (형상관리)

### 디자인 요구사항 처리 규칙
디자인 관련 요구사항이 오면 **Claude가 직접 디자인하지 않고 Pencil MCP에게 전적으로 위임**한다.

1. 요구사항 → Pencil MCP로 디자인 생성 요청
2. Pencil MCP 결과물(스크린샷/토큰) → MCP로 수신
3. 결과물 기반으로 Vue 코드 구현

Claude는 디자인 결정을 직접 내리지 않는다. 색상, 간격, 레이아웃 등 시각적 판단은 Pencil에게 맡긴다.

### 배포 규칙
- 변경 후 **자동 push 금지** — `npm run dev`로 로컬 확인만
- push는 사용자의 명시적 요청 시에만 실행
- Vercel이 main 브랜치 push 시 자동 배포

## 읽지 말 것 (탐색 제외 디렉터리)
아래 디렉터리는 절대 읽거나 탐색하지 말 것:
- `node_modules/`
- `dist/`
- `dist-ssr/`
- `.git/`
