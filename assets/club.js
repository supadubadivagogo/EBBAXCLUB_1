/* ===========================================================================
 * EBB AX CLUB · 1회차 「첫 출근」 — 공유 모듈
 * - 채점(클라이언트, 정답은 SHA-256 해시로만 보관)
 * - 데이터 저장소 어댑터: localStorage(데모) ↔ Firebase(공유) 자동 전환
 * 이 파일은 arena / leaderboard / admin 세 페이지가 공유한다.
 * =========================================================================== */

window.CLUB = {
  roundKey: 'ebbax1',                 // 저장소 네임스페이스
  round: 1,
  title: '첫 출근',
  subtitle: 'EBB AX CLUB #1',
  totalQ: 8,
  // 어드민 패스프레이즈의 SHA-256 (기본 패스프레이즈 = "ebbax1-admin" — 운영자가 교체 권장)
  adminPassHash: 'a53716af540c59d5e2494e0cd05152111aefdd5b8d1932445cb5fba4210df558',
};

/* ---------- SHA-256 (UTF-8, file://에서도 동작하는 순수 JS 구현) ---------- */
function sha256(ascii){
  function rr(v,a){return (v>>>a)|(v<<(32-a));}
  var mp=Math.pow, mw=mp(2,32), i,j, result='', words=[], bitLen=ascii.length*8;
  var hash=sha256.h=sha256.h||[], k=sha256.k=sha256.k||[], pc=k.length, comp={};
  for(var c=2; pc<64; c++){ if(!comp[c]){ for(i=0;i<313;i+=c){comp[i]=c;} hash[pc]=(mp(c,.5)*mw)|0; k[pc++]=(mp(c,1/3)*mw)|0; } }
  ascii+='\x80'; while(ascii.length%64-56) ascii+='\x00';
  for(i=0;i<ascii.length;i++){ j=ascii.charCodeAt(i); if(j>>8) return; words[i>>2]|=j<<((3-i)%4)*8; }
  words[words.length]=(bitLen/mw)|0; words[words.length]=bitLen;
  for(j=0;j<words.length;){
    var w=words.slice(j,j+=16), oh=hash; hash=hash.slice(0,8);
    for(i=0;i<64;i++){
      var w15=w[i-15], w2=w[i-2], a=hash[0], e=hash[4];
      var t1=hash[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+
        (w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
      var t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
      hash=[(t1+t2)|0].concat(hash); hash[4]=(hash[4]+t1)|0;
    }
    for(i=0;i<8;i++){ hash[i]=(hash[i]+oh[i])|0; }
  }
  for(i=0;i<8;i++){ for(j=3;j+1;j--){ var b=(hash[i]>>(j*8))&255; result+=((b<16)?0:'')+b.toString(16); } }
  return result;
}
function utf8(s){ return unescape(encodeURIComponent(s)); }
function hsh(s){ return sha256(utf8(s)); }
function norm(v, kind){ return kind==='number' ? String(v).replace(/[^0-9]/g,'') : String(v).trim().toLowerCase().replace(/\s+/g,''); }
window.sha256 = sha256; window.hsh = hsh; window.norm = norm;

/* ---------- 문항 정의 + 정답 해시 ----------
 * 라벨/순서는 채점·표시에 쓰이고, 정답은 해시로만 보관(평문 비노출). */
window.QFIELDS = [
  { qid:'emp1_name',    kind:'text', group:'emp',    rank:'1위', col:'name', label:'이달의 사원 1위 이름' },
  { qid:'emp2_name',    kind:'text', group:'emp',    rank:'2위', col:'name', label:'이달의 사원 2위 이름' },
  { qid:'emp3_name',    kind:'text', group:'emp',    rank:'3위', col:'name', label:'이달의 사원 3위 이름' },
  { qid:'region1_name', kind:'text', group:'region', rank:'1위', col:'name', label:'지역별 실적 1위 지역' },
  { qid:'region2_name', kind:'text', group:'region', rank:'2위', col:'name', label:'지역별 실적 2위 지역' },
  { qid:'region3_name', kind:'text', group:'region', rank:'3위', col:'name', label:'지역별 실적 3위 지역' },
  { qid:'region4_name', kind:'text', group:'region', rank:'4위', col:'name', label:'지역별 실적 4위 지역' },
  { qid:'region5_name', kind:'text', group:'region', rank:'5위', col:'name', label:'지역별 실적 5위 지역' },
];

window.ANS = {
  emp1_name:["e4ed6b36608a52a2c7e0245451de16ab2ea90029737cf4a3d5d9c3de4dcb7dcb","0b9c4c8ebc5f7c6b336c54365e5eaf2c5d88ba1df022802040e305232c4f9fe7"],
  emp2_name:["7e7e5e385a4ddd9a2cde90d4dd27f6a536f842cc60df20df6fcce023fefe6d1e","86956a9f6bc78fb3518d62a799036b59f0d3ea2a07540b672556a1fe53856d46"],
  emp3_name:["81f48753f36989aa00e49a82dacdd56dbe22b0b47479b7ae12aa4b3f6951e72a","e54f233416e2a424caa51d16d05ef237e9d4e2e6d51c556d03a471249ad648f7"],
  region1_name:["ca6c419327ce5a9d7e624ccac8219f676ea74b4c3cd58c6032ed39a8536aca67"],
  region2_name:["e56314e9a18b80c16a818ded6aac32c3dbc7fcd7cc72ef4775ab5a3b206c4973"],
  region3_name:["febd628ca9ac989de5fa60f789015238e1828deebdf936e3aa2aa31701d14eb1"],
  region4_name:["56efc3d9a1cffd83138c3bfcce5118cf8bf7326c37efdba2c55b5f5d999b957c"],
  region5_name:["6c9db53be31faa0c66e02ad4ba409dafeda29f21616a07b4111cbf629a0bb02a"],
};

/* values: {qid: raw} → {correct, total, breakdown:[{qid,ok}]} */
window.scoreValues = function(values){
  var correct=0, breakdown=[];
  window.QFIELDS.forEach(function(f){
    var raw=(values[f.qid]!=null ? String(values[f.qid]) : '').trim();
    var ok = raw!=='' && window.ANS[f.qid].indexOf(hsh(norm(raw, f.kind)))>=0;
    if(ok) correct++;
    breakdown.push({ qid:f.qid, ok:ok });
  });
  return { correct:correct, total:window.QFIELDS.length, breakdown:breakdown };
};

/* 해설 — 운영자가 admin에서 "해설 공개"하면 리더보드 하단에 노출된다.
 * 정답은 CSV 분석 + round1.py 원본 + ANS 해시 대조로 삼중 검증됨(2026-06-18). */
window.EXPLANATION_HTML = `
<h3>정답</h3>
<p><strong>이달의 사원</strong> — 전월(2월) · 구매확정 기준 · 개인 매출 합산(클라우드 서버 포함)</p>
<table><thead><tr><th>순위</th><th>사원</th><th>소속</th><th>2월 매출</th></tr></thead><tbody>
<tr><td>1위</td><td>최성호 (EMP1013)</td><td>경기1팀</td><td>6,581,846원</td></tr>
<tr><td>2위</td><td>이상현 (EMP1016)</td><td>경기2팀</td><td>4,752,672원</td></tr>
<tr><td>3위</td><td>오미래 (EMP1024)</td><td>부산2팀</td><td>4,732,854원</td></tr>
</tbody></table>
<p><strong>지역별 실적</strong> — 구매확정 기준 · 클라우드 서버 제외</p>
<table><thead><tr><th>순위</th><th>지역</th><th>2월 매출</th></tr></thead><tbody>
<tr><td>1위</td><td>서울</td><td>1,667,110원</td></tr>
<tr><td>2위</td><td>경기</td><td>1,512,596원</td></tr>
<tr><td>3위</td><td>광주</td><td>1,370,323원</td></tr>
<tr><td>4위</td><td>대전</td><td>1,234,342원</td></tr>
<tr><td>5위</td><td>부산</td><td>1,057,277원</td></tr>
</tbody></table>

<h3>① 녹취록에서 뽑은 조건</h3>
<p>전임자와의 통화에 풀이에 필요한 게 거의 다 들어있습니다 — <strong>데이터를 어떻게 정제할지</strong>도, <strong>어떻게 집계할지</strong>도요. (자판기 커피·구내식당 같은 잡담은 걸러내야 합니다.)</p>
<p class="expl-sub">데이터 정제 — 전임자가 "데이터가 지저분하다"며 일러준 것</p>
<ul>
<li><strong>상품명 통일</strong> — 같은 상품을 영문·한글·띄어쓰기·음차로 제각각 입력합니다(원래 드롭다운인데 직접 친 사람들). 실제 상품은 6개(5G 요금제·AI 비서 구독·IoT 패키지·인터넷 결합·IPTV 프리미엄·클라우드 서버)뿐이라, 소문자화·공백 제거 후 키워드로 묶습니다. <em>특히 '클라우드' 변형(클라우드서버·Cloud 서버 등)은 지역별 제외 때문에 하나도 놓치면 안 됩니다. (녹취 05:08~05:31)</em></li>
<li><strong>금액 정제</strong> — 일부 금액이 "52,726"처럼 따옴표·쉼표로 감싸여 있습니다. 따옴표를 인식하는 CSV 파서로 읽고 숫자만 추출해 정수로 바꿉니다. <em>(녹취 05:49)</em></li>
<li><strong>결측 행 제외</strong> — 사원번호·상품명·금액 중 하나라도 비면 억지로 채우지 말고 그 행 전체를 뺍니다. <em>(녹취 06:04)</em></li>
</ul>
<p class="expl-sub">집계 규칙 — 무엇을, 어떤 기준으로 셀지</p>
<ul>
<li><strong>대상 월 = 2026년 2월</strong> (3월 아님) — 오늘은 3/25지만 본부장 출장으로 밀린 '전월(2월) 먼슬리'입니다. 데이터엔 2025-01~2026-03이 다 들어있으니 2026년 2월만 골라야 합니다. <em>(녹취 01:28~01:55)</em></li>
<li><strong>매출 = '구매확정'</strong> — 개통 단계는 접수 → 검토완료 → 개통완료 → 구매확정 순서입니다. 매주 보는 위클리는 '개통완료'로 잡지만, <strong>월 마감(먼슬리)은 환불·철회 유예를 둬 마지막 '구매확정'</strong>만 매출로 인정합니다. 접수·검토완료·개통완료·환불은 전부 제외. <em>(녹취 03:34~04:42)</em></li>
<li><strong>이달의 사원 = 개인 실적, 클라우드 서버 포함</strong> — 개인 매출이라 모든 상품을 합산합니다. 사번 기준 상위 3명, 표시는 사원명·소속팀·매출. <em>(녹취 02:37 / 07:48~07:53)</em></li>
<li><strong>지역별 실적 = 팀 실적, 클라우드 서버 제외</strong> — 클라우드 서버는 본사 솔루션영업팀이 직접 수주하는 건이라(영업사원은 연결만) 지역 실적에선 뺍니다. 건당 금액이 커서 하나만 섞여도 지역 순위가 통째로 뒤집힙니다. <em>(녹취 07:16~07:53)</em></li>
</ul>
<p class="expl-hint"><strong>검증·참고</strong> — 영업본부는 5개 지역·9개 팀·39명(서울 3팀 / 경기·부산 각 2팀 / 대전·광주 각 1팀)이라 데이터 정합성 점검에 쓸 수 있습니다. 단 결측 제외 후 2월에 실제 집계되는 인원은 39명보다 적을 수 있어요. 전월(1월) 대비 증감은 시간 될 때 더하는 가점 항목입니다. <em>(녹취 06:23 / 06:53)</em></p>

<h3>② 녹취만 믿으면 틀리는 것 — 데이터를 직접 까봐야</h3>
<p>녹취가 항상 옳지는 않습니다. 전임자는 "<strong>구매확정 건 뽑아서 이름별로 합산</strong>하면 되죠?"라고 했지만(녹취 04:57), 데이터를 열어보면 <strong>동명이인</strong>이 있습니다. '서준혁'은 사번이 다른 두 사람(EMP1029·EMP1033)이라, 이름으로 묶으면 둘의 실적이 합산돼 7,623,278원으로 <strong>가짜 1위</strong>가 되고 진짜 1위(최성호)가 밀려납니다. 집계 키는 이름이 아니라 반드시 <strong>사원번호(EMP####)</strong>여야 합니다. ('이서연'도 사번이 둘입니다.)</p>

<h3>가장 틀리기 쉬운 함정</h3>
<ol>
<li><strong>위클리(개통완료) ↔ 먼슬리(구매확정) 혼동</strong> — 전임자가 "개통완료가 매출"이라 했다가 곧바로 "근데 이번엔 그 다음 걸로"라고 정정합니다. 앞말만 들으면 오답으로 빠집니다.</li>
<li><strong>클라우드 서버 비대칭</strong> — 같은 데이터인데 이달의 사원엔 <strong>포함</strong>, 지역별엔 <strong>제외</strong>. 규칙이 정반대라 한 번에 처리하면 한쪽이 틀립니다.</li>
<li><strong>동명이인 이름 합산</strong> — 이름으로 묶으면 가짜 1위가 생깁니다(위 ② 참고). 키는 사원번호.</li>
<li><strong>기간 3월 혼동</strong> — 밀려서 오늘 할 뿐, 집계 대상은 <strong>2월</strong>입니다.</li>
</ol>
`;

/* =========================================================================
 * Store — 데이터 저장소 어댑터 (모든 메서드 Promise 반환)
 * 백엔드:
 *   - window.FIREBASE_CONFIG.apiKey 가 있으면 → Firebase Firestore (공유/실시간)
 *   - 없으면 → localStorage (이 브라우저 한정, 데모용)
 * 데이터 모델:
 *   meta: { status: 'draft'|'open'|'closed' }
 *   submissions[]: { id, nickname, score, total, breakdown:[bool x16], submittedAt(ms) }
 *     ※ 정답 평문/원본답안은 저장하지 않는다(정답 누출 방지).
 * "내 마지막 제출"(리더보드 '나' 표시용)은 백엔드와 무관하게 localStorage에 기록.
 * ========================================================================= */
window.Store = (function(){
  var NS = window.CLUB.roundKey;
  var FB = (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) ? window.FIREBASE_CONFIG : null;

  // ----- 공통: 내 제출 가드 (브라우저 로컬) -----
  var MINE_KEY = NS + '_mine';
  function getMine(){ try { return JSON.parse(localStorage.getItem(MINE_KEY) || 'null'); } catch(e){ return null; } }
  function setMine(v){ try { localStorage.setItem(MINE_KEY, JSON.stringify(v)); } catch(e){} }
  function clearMine(){ try { localStorage.removeItem(MINE_KEY); } catch(e){} }

  /* ============================ localStorage ============================ */
  function LocalStore(){
    var SKEY = NS + '_subs';
    var MKEY = NS + '_meta';
    function readSubs(){ try { return JSON.parse(localStorage.getItem(SKEY) || '[]'); } catch(e){ return []; } }
    function writeSubs(a){ localStorage.setItem(SKEY, JSON.stringify(a)); ping(); }
    function readMeta(){ try { return JSON.parse(localStorage.getItem(MKEY) || '{}'); } catch(e){ return {}; } }
    function writeMeta(m){ localStorage.setItem(MKEY, JSON.stringify(m)); ping(); }
    var listeners = [];
    function ping(){ var subs=readSubs(), meta=readMeta(); listeners.forEach(function(cb){ try{cb(subs, meta);}catch(e){} }); }
    // 다른 탭 동기화
    window.addEventListener('storage', function(e){ if(e.key===SKEY || e.key===MKEY) ping(); });

    return {
      mode: 'local',
      getStatus: function(){ return Promise.resolve(readMeta().status || 'draft'); },
      setStatus: function(s){ var m=readMeta(); m.status=s; writeMeta(m); return Promise.resolve(); },
      setExplanation: function(open){ var m=readMeta(); m.explanationOpen=!!open; writeMeta(m); return Promise.resolve(); },
      list: function(){ return Promise.resolve(readSubs()); },
      add: function(sub){
        var a=readSubs();
        var id = 'L' + Date.now() + '-' + Math.floor((performance.now()%1)*1e6 + a.length);
        var rec = Object.assign({ id:id }, sub);
        a.push(rec); writeSubs(a);
        return Promise.resolve(id);
      },
      remove: function(id){ writeSubs(readSubs().filter(function(s){ return s.id!==id; })); return Promise.resolve(); },
      clearAll: function(){ writeSubs([]); return Promise.resolve(); },
      subscribe: function(cb){
        listeners.push(cb);
        Promise.resolve().then(function(){ cb(readSubs(), readMeta()); });
        return function(){ listeners = listeners.filter(function(x){ return x!==cb; }); };
      },
      getMine: getMine, setMine: setMine, clearMine: clearMine,
    };
  }

  /* ============================== Firebase ============================== */
  function FirebaseStore(){
    var ready = (async function(){
      var appMod = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
      var fsMod  = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
      var app = appMod.initializeApp(FB);
      var db  = fsMod.getFirestore(app);
      return { fs: fsMod, db: db };
    })();
    ready.catch(function(){});  // 루트 unhandledrejection 방지 (메서드별 거부는 호출부가 처리)
    var COL = NS + '_submissions';
    var METADOC = ['meta', NS];   // doc: collection 'meta', id = roundKey

    return {
      mode: 'firebase',
      getStatus: async function(){
        var { fs, db } = await ready;
        var snap = await fs.getDoc(fs.doc(db, METADOC[0], METADOC[1]));
        return (snap.exists() && snap.data().status) || 'draft';
      },
      setStatus: async function(s){
        var { fs, db } = await ready;
        await fs.setDoc(fs.doc(db, METADOC[0], METADOC[1]), { status:s }, { merge:true });
      },
      setExplanation: async function(open){
        var { fs, db } = await ready;
        await fs.setDoc(fs.doc(db, METADOC[0], METADOC[1]), { explanationOpen: !!open }, { merge:true });
      },
      list: async function(){
        var { fs, db } = await ready;
        var q = await fs.getDocs(fs.collection(db, COL));
        var out=[]; q.forEach(function(d){ out.push(Object.assign({id:d.id}, d.data())); });
        return out;
      },
      add: async function(sub){
        var { fs, db } = await ready;
        var ref = await fs.addDoc(fs.collection(db, COL), sub);
        return ref.id;
      },
      remove: async function(id){
        var { fs, db } = await ready;
        await fs.deleteDoc(fs.doc(db, COL, id));
      },
      clearAll: async function(){
        var { fs, db } = await ready;
        var q = await fs.getDocs(fs.collection(db, COL));
        var dels=[]; q.forEach(function(d){ dels.push(fs.deleteDoc(fs.doc(db, COL, d.id))); });
        await Promise.all(dels);
      },
      subscribe: function(cb, onError){
        var unsubs=[], subsReady=false, latestSubs=[], latestMeta={};
        ready.then(function(o){
          var fs=o.fs, db=o.db;
          unsubs.push(fs.onSnapshot(fs.collection(db, COL), function(q){
            latestSubs=[]; q.forEach(function(d){ latestSubs.push(Object.assign({id:d.id}, d.data())); });
            subsReady=true; cb(latestSubs, latestMeta);
          }, function(err){ if(onError) onError(err); }));
          unsubs.push(fs.onSnapshot(fs.doc(db, METADOC[0], METADOC[1]), function(d){
            latestMeta = d.exists() ? d.data() : {};
            // 제출 컬렉션이 한 번도 도착하기 전엔 빈 목록으로 렌더하지 않음(깜빡임 방지)
            if (subsReady) cb(latestSubs, latestMeta);
          }, function(err){ if(onError) onError(err); }));
        }).catch(function(err){ if(onError) onError(err); });
        return function(){ unsubs.forEach(function(u){ try{u();}catch(e){} }); };
      },
      getMine: getMine, setMine: setMine, clearMine: clearMine,
    };
  }

  return FB ? FirebaseStore() : LocalStore();
})();
