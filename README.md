# 🎲 굴려서 한국 속으로 (Roll_Into_Korea)

> 거리 뷰를 사용한 1인용 한국 여행 웹 보드 게임입니다. 

## 📖 프로젝트 개요

**굴려서 한국 속으로**는 웹을 기반으로 한 주사위 굴리기 게임입니다.

사용자들은 주사위를 굴려 도착한 칸에 적힌 여행지를 방문하게 되며, 칸에 적힌 여행지는 매번 랜덤으로 정해집니다.

여행지에 도착하면 거리 뷰를 통해 상점에서 상품을 사거나 여행지 정보를 얻는 등 다양한 활동을 통해 실제로 여행하는 기분을 느낄 수 있습니다.

### ✨ 주요 특징
* **반응형 게임판:** 완벽하게 반응형으로 설계된 그리드 기반 보드 게임 레이아웃.

* **실제 세계 몰입:** 지도 API 연동을 통해 도착 시 랜드마크의 스트리트 뷰를 제공.

* **싱글 플레이어 모드:** 시스템을 상대로 하는 싱글 플레이어 모드 또는 순수 수집/탐험 모드에 최적화.

* **여정 기록:** 방문한 랜드마크와 스탬프를 추적하는 "수집" 시스템.

* **경제 시스템:** 게임을 통해 얻는 재화로 여행 자금을 직접 관리.


## 🛠️ Tech Stack

* **Framework:** Vue 3
* **Language:** TypeScript
* **State Management:** Pinia
* **Routing:** Vue Router
* **Styling:** CSS
* **External APIs:** Kakao Maps API

## 프로젝트 구조
```text
src/
├── api/                     # 백엔드 통신 코드 모음
│   ├── axios.ts             # Axios 인스턴스 (기본 설정, 인터셉터)
│   ├── authApi.ts           # 로그인, 회원가입 관련 API
│   ├── gameApi.ts           # 게임 저장, 로드, 점수 전송 API
│   └── mapApi.ts            # (선택) 지도 관련 서버 요청
│
├── assets/                  # 이미지, 폰트, 글로벌 스타일
│   ├── images/              # 보드판 배경, 플레이어 말(Token), 아이콘
│   └── main.css             # 기본 CSS
│
├── components/              # 재사용 가능한 UI 조각들
│   ├── board/               # [Main.png] 관련 컴포넌트
│   │   ├── GameBoard.vue    # 보드 전체 래퍼 (Grid 레이아웃)
│   │   ├── BoardSquare.vue  # 개별 타일 (땅)
│   │   └── PlayerToken.vue  # 플레이어 말 (애니메이션 처리)
│   │
│   ├── map/                 # 거리뷰 관련 컴포넌트
│   │   ├── StreetViewModal.vue # 거리뷰를 띄우는 모달 창
│   │   └── MapContainer.vue    # 카카오 지도 API가 그려질 div
│   │
│   ├── ui/                  # UI 컨트롤
│   │   ├── DiceRoller.vue   # 주사위 굴리기 버튼 및 애니메이션
│   │   ├── PlayerStats.vue  # 현재 여행 경비(돈), 위치 정보 표시
│   │   └── JourneyCard.vue  # 여행 기록 카드
│   │
│   └── common/              # 일반적인 버튼, 알림창 등
│       ├── BaseModal.vue
│       └── BaseButton.vue
│
├── composables/             # 핵심 로직
│   ├── useGameLogic.ts      # 주사위 굴리기, 턴 넘기기 로직
│   └── useMapApi.ts         # 카카오 지도 API 로딩 및 초기화 함수
│
├── layouts/                 # 페이지 전체 레이아웃
│   └── GameLayout.vue       # UI 오버레이 등을 포함한 기본 틀
│
├── router/                  # Routing 구성 
│   └── index.ts             # 경로 정의(홈, 게임, 여정 등)
│
├── stores/                  # [Pinia] 상태 관리 (데이터 저장소)
│   ├── game.ts              # 플레이어 위치, 돈, 현재 턴 상태
│   └── landmarks.ts         # 각 땅의 정보 (이름, 로드뷰 좌표, 통행료 등)
│
├── types/                   # 백엔드와 약속한 데이터 타입(Interface)
│   ├── user.ts              # 유저 정보 타입 (User, Profile...)
│   └── game.ts              # 게임 데이터 타입 (Landmark, GameState...)
│
├── views/                   # 실제 페이지 단위
│   ├── HomeView.vue         # 시작 화면
│   ├── MainGameView.vue     # 메인 게임 화면
│   └── JourneyView.vue      # 여행 기록 화면
│
├── App.vue                  # 최상위 컴포넌트
└── main.ts                  # 진입점
```
