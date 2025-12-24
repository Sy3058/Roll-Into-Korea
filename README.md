# 🎲 굴려서 한국 속으로 (Roll_Into_Korea)

> 거리 뷰를 사용한 1인용 한국 여행 웹 보드 게임입니다.

## 📖 프로젝트 개요

**굴려서 한국 속으로**는 웹을 기반으로 한 주사위 굴리기 게임입니다.

사용자들은 주사위를 굴려 도착한 칸에 적힌 여행지를 방문하게 되며, 칸에 적힌 여행지는 매번 랜덤으로 정해집니다.

여행지에 도착하면 거리 뷰를 통해 상점에서 상품을 사거나 여행지 정보를 얻는 등 다양한 활동을 통해 실제로 여행하는 기분을 느낄 수 있습니다.

### ✨ 주요 특징

- **반응형 게임판:** 완벽하게 반응형으로 설계된 그리드 기반 보드 게임 레이아웃.

- **실제 세계 몰입:** 지도 API 연동을 통해 도착 시 랜드마크의 스트리트 뷰를 제공.

- **싱글 플레이어 모드:** 시스템을 상대로 하는 싱글 플레이어 모드 또는 순수 수집/탐험 모드에 최적화.

- **여정 기록:** 방문한 랜드마크와 스탬프를 추적하는 "수집" 시스템.

- **경제 시스템:** 게임을 통해 얻는 재화로 여행 자금을 직접 관리.

## 🛠️ Tech Stack

- **Framework:** Vue 3
- **Language:** TypeScript
- **State Management:** Pinia
- **Routing:** Vue Router
- **Styling:** CSS
- **External APIs:** Kakao Maps API

## 프로젝트 구조

```text
src/
├── api/                     # 백엔드 통신 코드 모음
│   ├── axios.ts             # Axios 인스턴스 (기본 설정, 인터셉터)
│   ├── authApi.ts           # 로그인, 회원가입 관련 API
│   ├── gameApi.ts           # 게임 저장, 로드, 점수 전송 API
│   └── mapApi.ts            # 지도 관련 서버 요청
│
├── assets/                  # 이미지, 폰트, 글로벌 스타일
│   ├── main.css             # 기본 CSS
│   ├── bag/                 # 가방 관련 이미지
│   ├── images/              # 일반 이미지
│   └── ui/                  # UI 관련 이미지
│
├── components/              # 재사용 가능한 UI 조각들
│   ├── common/              # 일반적인 버튼, 모달 등
│   │   ├── BaseButton.vue
│   │   └── BaseModal.vue
│   ├── game/                # 게임 관련 컴포넌트
│   │   └── GameModal.vue
│   ├── hero/                # 영웅 관련 컴포넌트
│   │   └── HeroDice.vue
│   ├── home/                # 홈 화면 컴포넌트
│   │   ├── HomeFooter.vue
│   │   ├── HomeHeader.vue
│   │   └── HomeMain.vue
│   ├── journey/             # 여행 기록 컴포넌트
│   │   ├── JourneyBagPanel.vue
│   │   ├── JourneyNotePanel.vue
│   │   ├── JourneyPanel.vue
│   │   └── ProfilePanel.vue
│   ├── map/                 # 지도 관련 컴포넌트
│   │   ├── LocationModal.vue
│   │   ├── MapContainer.vue
│   │   └── QuestMarker.vue
│   └── ui/                  # UI 컨트롤
│       ├── EditProfileModal.vue
│       ├── PlayerStats.vue
│       ├── RollingDice.vue
│       └── StreetViewModal.vue
│
├── composables/             # 컴포저블 함수
│   ├── useKakaoMap.ts       # 카카오 지도 관련
│   └── map/                 # 지도 관련 컴포저블
│       ├── useGeofencing.ts
│       ├── useKakaoLoader.ts
│       ├── useMapWalker.ts
│       └── useQuestSystem.ts
│
├── game/                    # 게임 로직 및 유틸리티
│   ├── BoardCard.ts
│   ├── BoardUtils.ts
│   └── GameBoard.ts
│
├── layouts/                 # 페이지 전체 레이아웃
│   └── GameLayout.vue
│
├── router/                  # 라우팅 구성
│   └── index.ts
│
├── services/                # 서비스 레이어
│   └── shopService.ts
│
├── stores/                  # Pinia 상태 관리
│   ├── game.ts
│   ├── landmarks.ts
│   └── player.ts
│
├── types/                   # TypeScript 타입 정의
│   ├── dice.ts
│   ├── game.ts
│   ├── kakao.d.ts
│   ├── quest.ts
│   └── user.ts
│
├── views/                   # 페이지 컴포넌트
│   ├── HomeView.vue
│   ├── JourneyView.vue
│   ├── MainGameView.vue
│   └── MapView.vue
│
├── App.vue                  # 최상위 컴포넌트
├── env.d.ts                 # 환경 타입 정의
└── main.ts                  # 애플리케이션 진입점
```
