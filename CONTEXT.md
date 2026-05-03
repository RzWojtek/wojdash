# CONTEXT.md — WojDash v5
> Ostatnia aktualizacja: maj 2026. Oparty na rzeczywistym kodzie index.html (1132 linie).

---

## 1. CO TO JEST I JAK DZIAŁA

**WojDash** = osobisty dashboard Wojtka (kurator sądowy + twórca projektów krypto/web3).
Single-page app w vanilla JS/HTML/CSS. Zero frameworka, zero buildu, zero node_modules.

- **URL produkcja**: https://wojdash.vercel.app
- **Repo GitHub**: `wojdash` — plik MUSI nazywać się `index.html` (Vercel szuka index)
- **Dwa pliki w repo**:
  - `index.html` — cała aplikacja (1132 linie)
  - `firebase-config.js` — TYLKO konfiguracja Firebase (wgraj raz, nie ruszaj przy aktualizacjach)
- **Deploy**: edycja na GitHubie → auto-deploy Vercel w ~30 sekund

---

## 2. ARCHITEKTURA FIREBASE

Dashboard łączy się jednocześnie z **7 osobnymi projektami Firebase** przez `safeInitDb()`:

```javascript
// Wzorzec inicjalizacji (linia 34-44 index.html):
function safeInitDb(cfg, name) {
  try { return getFS2(initApp2(cfg, name)); }
  catch(e) { console.warn(name + ' Firebase skip:', e.message); return null; }
}
const xpostDb    = safeInitDb(xpostConfig,    'xpost');
const tiktokDb   = safeInitDb(tiktokConfig,   'tiktok');
const signalDb   = safeInitDb(signalConfig,   'signal');
const cryptoDb   = safeInitDb(cryptotodoConfig,'cryptotodo');
const vpsDb      = safeInitDb(vpsConfig,      'vps');
const kuratorDb  = safeInitDb(kuratorConfig,  'kurator');
```

Wszystkie db instancje i funkcje Firestore eksponowane przez `window._*` (linia 46-58):
```javascript
window._auth, window._db, window._xpostDb, window._tiktokDb,
window._signalDb, window._cryptoDb, window._vpsDb, window._kuratorDb,
window._doc, window._getDoc, window._setDoc, window._collection,
window._getDocs, window._query, window._orderBy, window._limit,
window._onSnapshot, window._where,
window._KURATOR_UID, window._CRYPTOTODO_UID, window._VPS_UID
```

### Auth Flow (linia 60-73):
```
onAuthStateChanged(auth, user) →
  user? → window._uid = user.uid → ukryj login → pokaż app → window.initApp()
  null? → window._uid = null → pokaż login → ukryj app
```

### WAŻNE: Różne UID per aplikacja!
Każda aplikacja może być zalogowana **innym kontem Google** — WojDash ma swój UID, Kurator swój itd.
```
WojDash UID:    (dynamiczny po logowaniu, window._uid)
KURATOR_UID:    IBg9euqw0ZMNFwBKDVLrD3Qs4sH2
CRYPTOTODO_UID: 8mVxUaygq3e2B0gbVmQah2BGEDD3
VPS_UID:        0SNtjmHctNOs3Z6io3xoBP2w7sV2
```

---

## 3. FIREBASE-CONFIG.JS — PEŁNA STRUKTURA

```javascript
// Eksporty (wszystkie muszą być present):
export const firebaseConfig     = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
export const xpostConfig        = { ... };  // projekt: xpost-manager-e481d
export const tiktokConfig       = { ... };  // projekt: tiktokai-c7013
export const signalConfig       = { ... };  // projekt: SIGNAL_PROJECT (jeszcze nie skonfigurowany)
export const cryptotodoConfig   = { ... };  // projekt: cryptotodo
export const vpsConfig          = { ... };  // projekt: vps-monitor-pro
export const kuratorConfig      = { ... };  // projekt: kurator-app-8bd54

export const KURATOR_UID    = 'IBg9euqw0ZMNFwBKDVLrD3Qs4sH2';
export const CRYPTOTODO_UID = '8mVxUaygq3e2B0gbVmQah2BGEDD3';
export const VPS_UID        = '0SNtjmHctNOs3Z6io3xoBP2w7sV2';
```

---

## 4. STRUKTURA UI — DOKŁADNA

```
#login-screen (position:fixed, z-index:999)
  → przycisk Google → googleLogin() → signInWithPopup

#app (display:none → flex po logowaniu, flex-direction:column, height:100vh)
  header (height:52px, flex-shrink:0)
    .logo-icon (animacja glow 3s)
    #clock (font-mono, color:var(--neon))
    .user-info (onclick→doLogout)
      #user-avatar, #user-name, .logout-btn

  .tabs-bar (flex, height:40px)
    .tab-btn[data-tab="home"].active  → switchTab('home')
    .tab-btn[data-tab="links"]        → switchTab('links')

  .body-area (flex:1, display:flex, overflow:hidden)
    ┌── #tab-home.tab-view.home-view.active ─────────────────┐
    │   .home-inner (flex, overflow:hidden)                   │
    │   ┌── .projects-list (width:380px) ──────────────────┐ │
    │   │ .proj-card × N (onclick→openDetail(pid))         │ │
    │   │   .proj-card-icon, .proj-card-info, .proj-card-tag│ │
    │   │   CSS var --c = proj.color (pasek + border hover) │ │
    │   │ .add-proj-btn (onclick→openAddProjectModal)       │ │
    │   └────────────────────────────────────────────────────┘ │
    │   ┌── .detail-panel (flex:1) ─────────────────────────┐ │
    │   │ #detail-empty (display:flex/none)                  │ │
    │   │ #detail-content (display:none/flex)                │ │
    │   │   .detail-top                                      │ │
    │   │     .detail-title: #d-icon, #d-name, #d-desc      │ │
    │   │     .detail-actions:                               │ │
    │   │       .edit-proj-btn → editCurrentProject()        │ │
    │   │       .edit-proj-btn[red] → deleteCurrentProject() │ │
    │   │       #d-open-btn (href=proj.url)                  │ │
    │   │   #d-stats-area (generowany przez renderStats())   │ │
    │   │   .detail-body (grid 1fr 1fr)                      │ │
    │   │     .dnotes                                        │ │
    │   │       .dpanel-hdr: "📝 NOTATKI" + #d-note-status  │ │
    │   │       #d-note-ta (textarea, auto-zapis 1.5s)       │ │
    │   │     .dscripts                                      │ │
    │   │       .dpanel-hdr: "📜 SKRYPTY" + #d-add-script-btn│ │
    │   │       #d-script-sel (dropdown)                     │ │
    │   │       #d-script-body (treść wybranego skryptu)     │ │
    │   └────────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────────┘

    ┌── #tab-links.tab-view.links-view ──────────────────────┐
    │   .links-top-bar: tytuł + przycisk "+ DODAJ"           │
    │   .links-grid-wrap → .links-grid                       │
    │     .link-card × N                                     │
    │       .lc-open, .lc-edit → openEditLinkModal(i)        │
    │       .lc-del → removeLink(i)                          │
    └────────────────────────────────────────────────────────┘

    ┌── .right-col (width:300px, flex-shrink:0) ─────────────┐
    │   .stat-sys-box (statyczne statusy)                    │
    │   .gnote-box (flex:1)                                  │
    │     #gnp (textarea, auto-zapis 1.5s debounce)          │
    │     svG(), cpG(), Ctrl+S                               │
    └────────────────────────────────────────────────────────┘

Modals (position:fixed, .ov → .ov.open):
  #modal-proj  → saveProject()
  #modal-script → saveScript()
  #modal-link  → saveLinkModal()
  Zamknięcie: Escape, klik na overlay, closeModal(id)
```

---

## 5. STATE — STRUKTURA DANYCH W PAMIĘCI

```javascript
// linia 573-578
const STATE = {
  projects: [],   // [{id, name, icon, color, type, url, desc}]
  links:    [],   // [{id, n, i, c, url, desc}]
  notes:    {},   // {pid: "tekst notatki"}
  scripts:  {},   // {pid: [{n: "nazwa", body: "treść"}]}
  global:   '',   // tekst notatnika globalnego
};
let saveTimer = {};     // debounce timery per pid
let activePid = null;   // aktualnie otwarty projekt
let editProjIdx = null; // indeks edytowanego projektu
let editLinkIdx = null;
let scriptTargetPid = null;
```

---

## 6. FIREBASE HELPERS — WOJDASH DB

```javascript
// linia 583-589 — tylko dla głównej bazy WojDash
function uDoc(col, docId) {
  return window._doc(window._db, 'users', window._uid, col, docId);
}
async function fbGet(col, docId) → returns data or null
async function fbSet(col, docId, data) → setDoc with merge:true
```

### Ścieżki WojDash Firestore:
```
users/{window._uid}/
  settings/projects  → { list: STATE.projects }
  settings/links     → { list: STATE.links }
  settings/global    → { text: STATE.global }
  notes/{pid}        → { text: "..." }
  scripts/{pid}      → { list: [{n, body}] }
```

---

## 7. LOAD ALL — SEKWENCJA INICJALIZACJI

```javascript
// linia 595-621
async function loadAll() {
  // 1. Projekty — z auto-merge brakujących DEFAULT
  const pd = await fbGet('settings', 'projects');
  if (pd && pd.list && pd.list.length > 0) {
    const existing = new Set(pd.list.map(p => p.id));
    const missing = DEFAULT_PROJECTS.filter(p => !existing.has(p.id));
    STATE.projects = [...pd.list, ...missing];
    if (missing.length) await fbSet('settings', 'projects', {list: STATE.projects});
  } else {
    STATE.projects = DEFAULT_PROJECTS.map(p => ({...p}));
    await fbSet('settings', 'projects', {list: STATE.projects});
  }

  // 2. Linki
  const ld = await fbGet('settings', 'links');
  STATE.links = (ld && ld.list && ld.list.length > 0)
    ? ld.list : DEFAULT_LINKS.map(l => ({...l}));

  // 3. Notatki i skrypty per projekt
  for (const p of STATE.projects) {
    const nd = await fbGet('notes', p.id);
    if (nd && nd.text !== undefined) STATE.notes[p.id] = nd.text;
    const sd = await fbGet('scripts', p.id);
    if (sd && sd.list) STATE.scripts[p.id] = sd.list;
  }

  // 4. Global note
  const gd = await fbGet('settings', 'global');
  if (gd && gd.text !== undefined) STATE.global = gd.text;

  renderProjects(); renderLinks();
  gnp.value = STATE.global; upGc();
}
```

---

## 8. RENDER STATS — SZCZEGÓŁY PER PROJEKT

### XPost Manager (linia 683-702)
```javascript
// Firebase: xpostDb, kolekcja: 'posts'
const snap = await getDocs(collection(xpostDb, 'posts'));
const all = snap.docs.map(d => d.data());
const isRT = p => p.isRT || (p.account && p.account.includes(' RT @'));
const active = all.filter(p => p.status !== 'Odrzucone' && p.status !== 'Opublikowane');
// Wyświetla: Aktywnych, Nowych (status='Nowy'), W toku (='Do zrobienia'||'W toku'),
//            Opublikowanych, Retweetów (active + isRT)
```

### TikTok Monitor (linia 704-728)
```javascript
// Firebase: tiktokDb, kolekcje: 'transkrypcje' i 'prompty'
const [tSnap, pSnap] = await Promise.all([
  getDocs(collection(tiktokDb, 'transkrypcje')),
  getDocs(collection(tiktokDb, 'prompty')),
]);
// status values: 'Nowy', 'Gotowy', 'Opublikowany', 'Odrzucony'
// Wyświetla: Transkrypcji aktywnych, Nowych, Gotowych, Opublikowanych, Promptów aktywnych
```

### Signal Monitor — Bybit (linia 730-777)
```javascript
// Firebase: signalDb
// Dokument: bybit_portfolio/portfolio → {wallet_balance, total_pnl}
// Kolekcja: bybit_positions where status=='OPEN' → {symbol, signal_type, unrealized_pnl, realized_pnl}
// P&L = unrealized_pnl + realized_pnl
// isLong = ['LONG','SPOT_BUY'].includes(signal_type)
// Wyświetla: Wallet Balance, P&L (kolor green/red), Otwarte poz., tabela par
```

### CryptoToDo — Daily Tasks (linia 779-817)
```javascript
// Firebase: cryptoDb, ścieżka: users/{CRYPTOTODO_UID}/tasks (orderBy createdAt)
const CTUID = window._CRYPTOTODO_UID || window._uid;
const tasksSnap = await getDocs(query(
  collection(cryptoDb, 'users', CTUID, 'tasks'),
  orderBy('createdAt')
));
// Stan "done" z localStorage: taskDone = JSON.parse(localStorage['taskdone_' + uid])
// isDone(id) → taskDone[id] === todayStr (format: 'YYYY-MM-DD')
// Wyświetla: pasek postępu (doneCount/total, %), lista z ✅/⬜
```

### Aplikacja Kuratora — Terminy (linia 819-878)
```javascript
// Firebase: kuratorDb
// KUID = window._KURATOR_UID || 'IBg9euqw0ZMNFwBKDVLrD3Qs4sH2'
// Ścieżka osób: users/{KUID}/persons (getDocs zwraca dokumenty z polem 'imie')
// UWAGA: ghost documents — documents istnieją tylko jako kontenery podkolekcji!
//        getDocs() NA SZCZĘŚCIE zwraca je bo mają pole 'imie' (nie są pure ghost)
// Ścieżka ustawień: users/{KUID}/persons/{personId}/kal_settings → doc 'config' → {startDate, freq}
// Ścieżka historii: users/{KUID}/persons/{personId}/kal_historia → [{datumOddania}]

// WAŻNE: kal_persons (root collection) i users/KUID/persons mają RÓŻNE document IDs!
// Łączone były pierwotnie przez kal_persons, ale to nie działało.
// Finalne rozwiązanie: getDocs(users/KUID/persons) → personDoc.data().imie

// Generowanie dat:
function generateDates(startDate, freq) {
  // freq: '2w'=14 dni, '1m'/'2m'/'3m'/'6m'=miesiące, parseInt(freq) dla innych
  // generuje daty do 10 lat wprzód od startDate
}
function getEffectiveDate(dates, hist, todayStr) {
  // identyczna logika jak Kalendarz.jsx
  const pastDates = dates.filter(d => d < todayStr);
  if (pastDates.length > 0) {
    const lastPast = pastDates[pastDates.length - 1];
    const histDates = hist.map(h => h.datumOddania).sort();
    const coveredAfter = histDates.find(h => h >= lastPast);
    if (!coveredAfter) return lastPast; // przeterminowany!
  }
  return dates.find(d => d >= todayStr) || null;
}
// Wyświetla: tabela [imię | data | "za X dni" / "X dni PO TERMINIE"]
// Sortowanie: od najbliższego terminu
// Kolory: ok (zielony >14dni), warn (żółty ≤14dni), over (czerwony <0)
```

### VPS Monitor Pro (linia 880-909)
```javascript
// Firebase: vpsDb, dokument: vps_monitor/health
// Pola: cpu_percent, ram_percent, disk_percent, uptime_seconds,
//       load_1, load_5, load_15, ram_used_mb, ram_total_mb,
//       disk_used_gb, disk_total_gb, public_ip
// Progi kolorów CPU: >80→red, >60→yellow, else→neon
// Progi kolorów RAM: >85→red, >70→yellow, else→purple
// Progi kolorów Dysk: >90→red, >75→yellow, else→green
// Uptime: Math.floor(uptime_seconds/86400)+'d '+Math.floor((uptime_seconds%86400)/3600)+'h'
```

---

## 9. ZARZĄDZANIE PROJEKTAMI — FUNKCJE

```javascript
// Otwórz szczegóły projektu
async function openDetail(pid) {
  activePid = pid; renderProjects();  // aktualizuje klasę .active
  // wypełnia: d-icon, d-name, d-desc, d-open-btn
  // d-open-btn: jeśli proj.url → normalny link, jeśli puste → opacity:0.3, pointerEvents:none
  await renderStats(proj);
  // ustawia d-note-ta.value = STATE.notes[pid]
  // oninput: debounce 1.5s → fbSet('notes', pid, {text})
  // onkeydown Ctrl+S → natychmiastowy zapis
  refreshScriptDropdown(pid);
}

// Dodaj projekt
function openAddProjectModal()  // czyści formularz, otwiera #modal-proj
function editCurrentProject()   // wypełnia formularz z STATE.projects[editProjIdx]
function saveProject()          // tworzy id = name.toLowerCase().replace(/[^a-z0-9]/g,'_')+'_'+Date.now()
                                // zapisuje do STATE.projects i fbSet('settings','projects')

// Usuń projekt
function deleteCurrentProject() // confirm → filter STATE.projects → fbSet → activePid=null → renderProjects
// WAŻNE: notatki i skrypty NIE są usuwane z Firebase (tylko z listy projektów)
```

---

## 10. SKRYPTY — FUNKCJE

```javascript
// Struktura: STATE.scripts[pid] = [{n: "nazwa", body: "pełna instrukcja"}]
// Zapis: users/{uid}/scripts/{pid} → {list: [...]}

function refreshScriptDropdown(pid)  // wypełnia #d-script-sel opcjami
function showDetailScript()          // wyświetla s.n + s.body + przycisk KOPIUJ
function deleteDetailScript()        // confirm → splice → fbSet
function openScriptModal(pid)        // otwiera #modal-script, ustawia scriptTargetPid
function saveScript()                // push do STATE.scripts[pid] → fbSet
// KOPIUJ: navigator.clipboard.writeText(s.body)
```

---

## 11. LINKI — FUNKCJE

```javascript
// Struktura: STATE.links = [{id, n, i, c, url, desc}]
// n=nazwa, i=emoji, c=kolor hex, url=link (opcjonalny)
// Zapis: users/{uid}/settings/links → {list: [...]}
// Domyślne DEFAULT_LINKS (11 pozycji): xparaf, cryptoquests, opforge, pixelnft,
//   rabbits, fluxpay, kiichain, cryptofeed, xarticle, gmailword, sprawozdania

function openLinkModal()          // nowy link
function openEditLinkModal(i)     // edycja STATE.links[i]
function saveLinkModal()          // push/update + fbSet + renderLinks
function removeLink(i)            // confirm → splice → fbSet
function renderLinks()            // generuje .link-card per link w #links-grid
```

---

## 12. FIRESTORE REGUŁY — WYMAGANE PER BAZA

### WojDash (główna baza):
```
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### XPost, TikTok, VPS, CryptoToDo (tylko odczyt z WojDash):
```
match /{document=**} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### Kurator:
```
match /{document=**} {
  allow read, write: if true;
}
```

### ⚠️ TikTok — UWAGA NA WYGASANIE REGUŁ!
Projekt tiktokai-c7013 miał regułę z datą wygaśnięcia:
```
allow read, write: if request.time < timestamp.date(2026, 4, 29);
```
Po 29.04.2026 wszystko się zablokowało. Zmień na `allow read: if true`.

---

## 13. ZNANE PUŁAPKI I GOTOWE ROZWIĄZANIA

### Problem: Ghost documents w Firestore
`getDocs()` nie zwraca dokumentów które mają tylko podkolekcje i żadnych własnych pól.
**Rozwiązanie**: w Kuratorze documents users/KUID/persons/{id} mają pole `imie` → getDocs działa.

### Problem: Różne UID
WojDash loguje się Twoim kontem Google → window._uid = 2eZjSkGRXUWT3p9Lh5FTqTbS6D93
Aplikacja Kuratora logujesz się innym kontem → KURATOR_UID = IBg9euqw0ZMNFwBKDVLrD3Qs4sH2
**Rozwiązanie**: KURATOR_UID, CRYPTOTODO_UID, VPS_UID hardkodowane w firebase-config.js

### Problem: Różne ID dokumentów między kolekcjami
`kal_persons/{id}` i `users/KUID/persons/{id}` mają RÓŻNE ID dla tej samej osoby.
**Rozwiązanie**: Finalne — getDocs(users/KUID/persons) i imiona z personDoc.data().imie

### Problem: Missing or insufficient permissions
Nie zawsze oznacza złe reguły — może oznaczać że WojDash łączy się z obcą bazą
bez żadnego auth token dla tej bazy.
**Rozwiązanie**: `allow read: if true` dla baz zewnętrznych

### Problem: SyntaxError przy edycji kodu
Zdarzało się że str_replace gubił deklarację `function` zostawiając samo `{`.
**Rozwiązanie**: zawsze sprawdzaj `node --check` po edycji JS.

---

## 14. DEFAULT PROJECTS — PEŁNA LISTA

```javascript
// linia 547-554
const DEFAULT_PROJECTS = [
  {id:'xpost',      name:'XPost Manager',       icon:'📋', color:'#00e5ff', type:'vercel',
   url:'https://xpost-manager.vercel.app',  desc:'Posty X · TG Sygnały · TG Wpisy'},
  {id:'signal',     name:'Signal Monitor (TG)', icon:'📡', color:'#ff6b9d', type:'vps',
   url:'', desc:'Telethon · monitoring kanałów TG'},
  {id:'kurator',    name:'Aplikacja Kuratora',  icon:'⚖️', color:'#69ffb4', type:'vercel',
   url:'https://kurator-app.vercel.app', desc:'Karty Czynności · Sprawozdania'},
  {id:'tiktok',     name:'TikTok Monitor',      icon:'🎵', color:'#ff6b6b', type:'vps',
   url:'', desc:'yt-dlp · Whisper · transkrypcje'},
  {id:'cryptotodo', name:'CryptoToDo',           icon:'✅', color:'#b39ddb', type:'vercel',
   url:'https://cryptotodo.vercel.app', desc:'Zadania i workflow krypto'},
  {id:'vps',        name:'VPS Monitor Pro',      icon:'🖥️', color:'#ffd740', type:'vercel',
   url:'', desc:'System Health · CPU · RAM · Dysk'},
];
```

### Auto-merge przy starcie:
Przy każdym uruchomieniu sprawdzane są brakujące projekty z DEFAULT_PROJECTS.
Jeśli projekt z DEFAULT nie istnieje w Firebase → jest dopisywany automatycznie.
Dzięki temu dodanie nowego projektu do DEFAULT_PROJECTS deployuje go dla wszystkich.

---

## 15. STYL WIZUALNY — CSS VARIABLES

```css
:root {
  --bg: #484862;         /* główne tło */
  --surface: #3e3e58;    /* nagłówki sekcji */
  --card: #3a3a54;       /* karty */
  --card2: #424260;      /* modals */
  --panel: #404058;      /* panele */
  --panel2: #383850;     /* nagłówki paneli */
  --neon: #00e5ff;       /* główny akcent (cyjan) */
  --purple: #b39ddb;
  --red: #ff6b6b;
  --green: #69ffb4;
  --yellow: #ffd740;
  --pink: #ff6b9d;
  --blue: #40c4ff;
  --text: #ffffff;
  --text2: #d0d0f0;
  --muted: #9090b8;
  --border: rgba(0,229,255,0.15);
  --mono: 'Share Tech Mono', monospace;
  --ui: 'Exo 2', sans-serif;
}
```

Grid background: `background-image: linear-gradient(rgba(0,229,255,.03) 1px, ...)` 44px×44px

---

## 16. VPS I DEPLOYMENT

```
IP VPS:  185.202.239.239
OS:      Ubuntu 24
Node:    v22.22.0
PM2:     process manager dla botów
pip:     ZAWSZE z flagą --break-system-packages
Upload:  przez GitHub web UI (nie terminal git)
```

### Dodanie HTML do dashboardu:
1. Wgraj plik.html do repo wojdash obok index.html
2. Dostępny pod: https://wojdash.vercel.app/plik.html
3. W dashboardzie: edytuj projekt → wklej URL

---

## PROMPT STARTOWY

```
Cześć! Pracujemy nad WojDash — moim osobistym dashboardem.

PLIKI W REPO:
- index.html (1132 linie, vanilla JS/HTML/CSS, zero frameworka)
- firebase-config.js (konfiguracje + UID)
URL: https://wojdash.vercel.app
Deploy: GitHub → Vercel auto (~30s)
Firebase SDK: v10.12.0 ESM z gstatic CDN

UI LAYOUT:
- Header (52px) + TabsBar (40px) + body-area (flex)
- body-area: .projects-list (380px) | .detail-panel (flex:1) | .right-col (300px)
- Dwie zakładki: 🏠 PROJEKTY i 🔗 LINKI
- Klik kafelku → openDetail(pid) → renderStats(proj) + notatki + skrypty
- Prawy panel stały: status systemu + notatnik globalny

FIREBASE — 7 baz przez safeInitDb():
window._db        = WojDash (główna)
window._xpostDb   = xpost-manager-e481d
window._tiktokDb  = tiktokai-c7013
window._signalDb  = SIGNAL (niekompletny)
window._cryptoDb  = cryptotodo
window._vpsDb     = vps-monitor-pro
window._kuratorDb = kurator-app-8bd54

UID PER APLIKACJA (różne konta Google!):
window._uid          = (WojDash — dynamiczny po logowaniu)
window._KURATOR_UID  = IBg9euqw0ZMNFwBKDVLrD3Qs4sH2
window._CRYPTOTODO_UID = 8mVxUaygq3e2B0gbVmQah2BGEDD3
window._VPS_UID      = 0SNtjmHctNOs3Z6io3xoBP2w7sV2

STATE:
{ projects:[], links:[], notes:{pid:text}, scripts:{pid:[{n,body}]}, global:'' }
Zapis WojDash: users/{uid}/settings/projects|links|global, notes/{pid}, scripts/{pid}

STATYSTYKI:
- xpost: getDocs('posts'), filtry po status ('Nowy','Do zrobienia','W toku','Opublikowane','Odrzucone'), isRT
- tiktok: Promise.all(['transkrypcje','prompty']), status ('Nowy','Gotowy','Opublikowany','Odrzucony')
- kurator: getDocs(users/KUID/persons) → per person: kal_settings/config{startDate,freq} + kal_historia{datumOddania}
- cryptotodo: getDocs(users/CTUID/tasks orderBy createdAt), done = localStorage['taskdone_'+uid][id]===todayStr
- vps: getDoc('vps_monitor/health') → cpu_percent, ram_percent, disk_percent, uptime_seconds itd.
- signal: getDoc('bybit_portfolio/portfolio'), getDocs('bybit_positions' where status=='OPEN')

REGUŁY FIRESTORE:
- WojDash: allow read,write if auth.uid == userId
- Zewnętrzne (XPost/TikTok/VPS/CryptoToDo): allow read: if true
- ⚠️ TikTok: reguły mają datę wygaśnięcia — sprawdzaj!

PUŁAPKI:
- Ghost documents: getDocs() nie zwraca dokumentów bez własnych pól
- Różne UID = różne konta Google w różnych aplikacjach
- kal_persons i users/KUID/persons mają RÓŻNE document IDs
- SyntaxError po edycji: zawsze node --check po zmianach JS

VPS: 185.202.239.239, Ubuntu 24, Node v22.22.0, PM2
pip: zawsze --break-system-packages

CO CHCĘ ZROBIĆ:
[OPISZ TUTAJ]
```
