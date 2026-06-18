/* ===========================================================================
 * 데이터 백엔드 설정
 *
 * 기본값 = null  →  localStorage 데모 모드(이 브라우저 안에서만 제출/리더보드 공유).
 *
 * 여러 사람이 함께 쓰는 "공유 리더보드"로 전환하려면:
 *   1) https://console.firebase.google.com 에서 무료 프로젝트 생성
 *   2) 웹 앱 추가 → firebaseConfig 객체 복사
 *   3) 아래 window.FIREBASE_CONFIG = null;  를 그 객체로 교체
 *   4) Firestore 사용 설정 + 보안 규칙 적용(README 참고)
 * =========================================================================== */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBYGaiWghdB1GMscvKc-Xk6293v8M8k454",
  authDomain: "divine-for-sk-project.firebaseapp.com",
  projectId: "divine-for-sk-project"
};
