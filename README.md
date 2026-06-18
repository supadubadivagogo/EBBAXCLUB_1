# EBB AX CLUB · 1회차 「첫 출근」 아레나

SSO(사번 로그인) 없이, 참가자가 **이름/닉네임**만 넣고 푸는 GitHub Pages용 정적 아레나입니다.
앱(in-app) 아레나와 같은 다크 보라 톤이고, **제출 → 리더보드 → 운영자 콘솔**까지 갖췄습니다.

## 페이지

| 파일 | 용도 |
|---|---|
| `index.html` | 아레나 — 스토리·자료·정답 입력·제출 (여러 번 가능) |
| `leaderboard.html` | 리더보드 — 점수(16점)·제출시각 순위, 실시간 갱신 |
| `admin.html` | 운영자 콘솔 — 아레나 열기/닫기, 제출 현황, 초기화·CSV |

- 채점은 **브라우저 안에서** 이뤄지고, **정답은 평문이 아니라 SHA-256 해시로만** 들어 있습니다(소스 보기로 정답이 그대로 보이지 않음).
- 운영자 콘솔 기본 패스프레이즈 = `ebbax1-admin` → `assets/club.js`의 `adminPassHash`를 교체해 바꿉니다.
  (새 해시: 브라우저 콘솔에서 `hsh('새-패스')` 실행한 값.)

## 운영 흐름 (행사 당일)

**기본 상태 = `오픈 전`(draft)** 입니다. 배포만 하면 참가자는 "아직 오픈 전" 안내만 보고, 문제·정답 폼은 보이지 않습니다(조기 제출 방지).

1. 행사 시작 → `admin.html` 입장 → **진행 중** 클릭. 이제 참가자가 문제를 풀고 제출할 수 있습니다.
2. 진행 중 `leaderboard.html`가 실시간으로 순위를 보여줍니다.
3. 마감 시 → admin에서 **마감** 클릭. 제출이 차단되고 결과가 공개됩니다.

> 💡 **데모로 아레나 화면을 바로 보려면** `admin.html`(패스 `ebbax1-admin`)에서 **진행 중**을 한 번 누른 뒤 `index.html`을 새로고침하세요.

## 두 가지 동작 모드

데이터 저장소를 어댑터로 분리해, 설정에 따라 자동 전환됩니다.

### 1) 데모 모드 (기본값 · 설정 0)
`firebase-config.js`가 `null`이면 **localStorage**를 씁니다.
→ 제출·리더보드가 **그 브라우저 안에서만** 공유됩니다. 혼자 흐름을 확인하거나 시연할 때 사용.

### 2) 공유 모드 (실제 행사용 · Firebase) — ✅ 구축 완료
여러 사람의 브라우저에서 제출이 한 리더보드로 모이려면 **외부 데이터 저장소가 1개** 필요합니다
(GitHub Pages는 정적 호스팅이라 서버·DB가 없습니다). 이 저장소는 **이미 무료 Firebase Firestore로 연결돼 있습니다.**

- **프로젝트** = `divine-for-sk-project` · **리전** = `asia-northeast3`(서울) · **요금** = `(default)` DB 무료 등급(freeTier). 결제계정 미연결이라 한도를 넘겨도 과금 대신 요청만 제한됩니다.
- `firebase-config.js`에 `apiKey`·`projectId`가 배선돼 있어, 페이지를 열면 **자동으로 공유 모드**로 뜹니다(`admin.html` 상단 배너로 확인).
- 보안 규칙은 아래 내용으로 **이미 배포**돼 있습니다. 규칙을 바꾸려면 `_deploy_rules.py`의 `RULES`를 고치고 `TK=$(gcloud auth print-access-token) python _deploy_rules.py`로 재배포하면 됩니다.

#### 적용된 Firestore 보안 규칙
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /meta/{id} {
      allow read, write: if true;             // 회차 상태(열기/닫기) 토글
    }
    match /{coll}/{id} {
      allow read, create, delete: if true;    // 제출 생성·읽기·삭제(운영자 콘솔) 허용
      allow update: if false;                 // 기존 제출 점수 위변조만 차단
    }
  }
}
```
- **운영자 콘솔의 삭제·전체초기화가 그대로 동작합니다**(delete 허용). 점수 수정(update)만 서버에서 막아 위변조를 차단합니다. — 스모크 테스트로 create=200 / update=403 / delete=200 검증 완료.
- 단, SSO가 없어 "운영자만 삭제"를 서버가 강제하지 못합니다(아래 한계 참고).

## ⚠️ 정직한 한계 (SSO가 없기 때문)
- **점수 위·변조 가능성**: 채점이 클라이언트에서 일어나므로, 작정하면 개발자도구로 가짜 점수를 제출할 수 있습니다. 친목·교육용 행사엔 무방하나, 고스테이크 경쟁엔 약합니다.
- **정답 해시는 캐주얼 차단용**: 사원명은 자료 39명 안, 지역은 5곳, 금액은 7자리라 작정하면 역산 가능합니다. "소스 보기로 슬쩍 보는 것"은 막지만 완벽한 비밀은 아닙니다.
- **제출 봉인 없음 (여러 번 제출 가능)**: 한 사람이 여러 번 제출하면 리더보드에 여러 기록으로 쌓입니다(연습·재도전용). 최고점 하나만 남기려면 별도 처리가 필요합니다.
- **삭제·상태변경이 인증 없이 열려 있음**: 운영 편의를 위해 규칙에서 `delete`와 `meta write`를 허용했습니다. 그래서 제출 목록(누구나 읽기 가능)에서 문서 id를 얻으면 작정한 외부인이 콘솔 없이도 남의 제출이나 전체를 지우거나, 아레나 상태를 바꿀 수 있습니다. **운영자 URL/패스를 공유하지 말고**, 신뢰되는 단기·소규모 행사 전제로 쓰세요. 더 엄격히 막으려면 Firebase Authentication(운영자 1계정)을 켜고 `delete`/`meta write`를 `if request.auth != null`로 좁히면 됩니다(admin.html에 로그인 배선 추가 필요).

## 로컬에서 보기
파일을 더블클릭해도 열리지만(파일://), 정식 확인은 GitHub Pages 또는 로컬 서버 권장:
```
python -m http.server 8000   # → http://localhost:8000
```

## 배포 (GitHub Pages)
저장소 Settings → Pages → Source = `main` 브랜치 `/ (root)` → 저장. 잠시 후
`https://supadubadivagogo.github.io/EBBAXCLUB_1/` 에 공개됩니다.
