# CONTEXT.md — WojDash

> Plik kontekstowy do wklejenia na początku nowej rozmowy z Claude.
> Ostatnia aktualizacja: kwiecień 2026

---

## 1. Czym jest aplikacja

**WojDash** to osobisty dashboard Wojtka — kuratora sądowego i twórcy wielu projektów webowych/krypto. Aplikacja służy jako centralne centrum zarządzania wszystkimi projektami: zawiera komendy VPS do kopiowania, skrypty z instrukcjami, notatki per projekt, listę linków do aplikacji i globalny notatnik.

Aplikacja jest dostępna pod adresem: **https://wojdash.vercel.app**  
Plik źródłowy: **`index.html`** (pojedynczy plik, brak frameworka, brak buildu)

---

## 2. Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — jeden plik `index.html` |
| Hosting | Vercel (auto-deploy z GitHub) |
| Baza danych | Firebase Firestore |
| Auth | Firebase Auth — Google Sign-In (signInWithPopup ONLY) |
| Firebase SDK | v10.12.0, ładowany przez ESM z gstatic CDN |
| Fonty | Google Fonts: Share Tech Mono + Exo 2 |
| Repo | GitHub: `wojdash` (plik musi nazywać się `index.html`) |

**Ważne zasady Firebase:**
- Używamy wyłącznie `signInWithPopup` — nigdy `getRedirectResult`
- Dane per użytkownik: `users/{uid}/col/docId`
- Kolekcje: `cmds`, `notes`, `scripts`, `settings` (linki, global note)

---

## 3. Struktura pliku index.html

```
index.html
├── <script type="module">   — Firebase init + auth watcher (ESM)
├── <style>                  — Cały CSS inline
├── #login-screen            — Ekran logowania Google
├── #app                     — Główna aplikacja (display:none przed loginem)
│   ├── <header>             — Logo, zegar, info o userze, logout
│   ├── .tabs-bar            — Zakładki projektów + zakładka LINKI
│   └── .body-area           — Grid 1fr 350px
│       ├── #views-wrap      — Widoki projektów + widok Linki
│       └── .right-col       — Prawy panel (stały)
├── #modal-cmd               — Modal dodawania komendy VPS
├── #modal-link              — Modal dodawania/edycji linku
├── #modal-script            — Modal dodawania skryptu
└── <script>                 — Cała logika aplikacji (non-module)
```

---

## 4. Struktura UI

### Zakładki (tabs-bar)
Zakładki projektów są generowane dynamicznie z tablicy `PROJECTS`. Na końcu zawsze stała zakładka **🔗 LINKI**.

Kolejność zakładek projektów:
1. 📋 XPost Manager
2. 📡 Signal Monitor (TG)
3. ⚖️ Aplikacja Kuratora
4. 🎵 TikTok Monitor
5. ✅ CryptoToDo
6. 🤖 XParafBot
7. 🎮 CryptoQuests

### Widok projektu (każda zakładka)
```
[top bar: ikona, nazwa, opis, przycisk ↗ OTWÓRZ]
┌─────────────────────┬─────────────────────┐
│  ⌨ KOMENDY VPS     │  📜 SKRYPTY          │
│  Lista komend       │  Dropdown + treść   │
│  + DODAJ            │  + DODAJ            │
└─────────────────────┴─────────────────────┘
┌─────────────────────────────────────────────┐
│  📝 NOTATKI PROJEKTU (full width)           │
│  Textarea — auto-zapis Firebase             │
└─────────────────────────────────────────────┘
```

**Przycisk ↗ OTWÓRZ** bierze URL z Firebase (STATE.links), nie z kodu. Po edycji linku w zakładce Linki przycisk aktualizuje się bez reload.

### Zakładka 🔗 LINKI
Wyświetla wszystkie projekty jako karty (grid). Każda karta:
- Kolorowa kropka + emoji + nazwa + opis
- URL (klikalny) lub etykieta "VPS only"
- Przyciski: ↗ OTWÓRZ, ✏️ EDYTUJ, ✕ USUŃ

Przy pierwszym uruchomieniu Firebase jest puste → aplikacja automatycznie zapisuje `DEFAULT_LINKS` (16 projektów) do Firestore.

### Prawy panel (stały, 350px)
- **● STATUS SYSTEMU** — statyczne wskaźniki (VPS, Firebase, Vercel, PM2, Telethon)
- **🪙 INNE PROJEKTY** — chipsy z linkami (te same dane co zakładka Linki, jako skrót)
- **📋 NOTATNIK GLOBALNY** — textarea, Ctrl+S lub przycisk ZAPISZ, auto-zapis 1.5s

---

## 5. Flow danych

### Inicjalizacja
```
Firebase Auth → onAuthStateChanged → user logged in
  → initApp()
    → buildViews()          # tworzy DOM zakładek dynamicznie
    → loadAll()             # pobiera z Firestore:
        cmds/{pid}          # komendy per projekt
        notes/{pid}         # notatki per projekt
        scripts/{pid}       # skrypty per projekt
        settings/links      # lista wszystkich projektów/linków
        settings/global     # globalny notatnik
    → renderLinks()         # renderuje zakładkę Linki + chipsy
    → refreshOpenButtons()  # aktualizuje href przycisków OTWÓRZ
    → odświeża textarea + dropdowny
```

### Zapis danych
- **Notatki**: auto-zapis 1.5s po zakończeniu pisania (debounce) lub Ctrl+S natychmiast
- **Komendy/Skrypty/Linki**: zapis natychmiast po dodaniu/edycji/usunięciu
- **Global note**: identycznie jak notatki projektu

### Struktura Firestore
```
users/
  {uid}/
    cmds/
      {pid}  →  { list: [{n, c}, ...] }
    notes/
      {pid}  →  { text: "..." }
    scripts/
      {pid}  →  { list: [{n, body}, ...] }
    settings/
      links  →  { list: [{id, n, i, c, url, desc}, ...] }
      global →  { text: "..." }
```

---

## 6. Tablica PROJECTS (w kodzie — statyczna)

Tablica `PROJECTS` w JS zawiera dane projektów z zakładkami VPS. Zmiana wymaga edycji `index.html`. Zawiera: `id`, `icon`, `name`, `color`, `url` (fallback), `desc`, `cmds[]`.

**Ważne**: `url` w PROJECTS to tylko fallback — faktyczny URL pobierany jest z Firebase (`STATE.links`). `refreshOpenButtons()` synchronizuje przyciski OTWÓRZ po załadowaniu danych.

### Dodawanie nowego projektu do zakładek
Dopisz obiekt do tablicy `PROJECTS` w `index.html`:
```javascript
{ id:'gm-bot', icon:'🌅', name:'GM Deploy Bot', color:'#ffd740',
  url:'',
  desc:'Codzienne GM + deploy na różnych sieciach',
  cmds:[
    {n:'Status GM Bot', c:'pm2 status gm-bot'},
    {n:'Restart GM Bot', c:'pm2 restart gm-bot'},
    {n:'Logi GM Bot',   c:'pm2 logs gm-bot --lines 50'},
  ]},
```
Potem dodaj wpis w zakładce Linki przez UI (nie trzeba ruszać `DEFAULT_LINKS`).

---

## 7. Komendy VPS — lista per projekt

### XPost Manager
- `pm2 status` / `pm2 restart xpost-manager` / `pm2 logs xpost-manager --lines 50`
- `cd /home/wojtek/xpost-manager && git pull && pm2 restart xpost-manager`

### Signal Monitor (TG) — Telethon, api_id=21596975
- `pm2 restart signal-monitor` / `pm2 logs signal-monitor --lines 80`
- `python3 add_signal_manual.py` — ręczne dodanie sygnału
- `python3 cleanup_firebase.py` — czyszczenie starych wpisów
- `python3 auth_session.py` — re-auth sesji Telegram
- `python3 list_channels.py` — lista obserwowanych kanałów

### Aplikacja Kuratora
- `pm2 restart kurator-server` / `pm2 logs kurator-server --lines 50`
- `node fetch_emails.js` / `node generate_karta.js` / `node upload_drive.js`

### TikTok Monitor — yt-dlp + Whisper
- `pm2 restart tiktok-monitor` / `pm2 logs tiktok-monitor --lines 80`
- `python3 manual_download.py https://vm.tiktok.com/LINK`
- `python3 cleanup_audio.py` / `python3 add_account.py @nazwa`
- `pip install -U yt-dlp --break-system-packages`

### XParafBot
- `pm2 restart xparafbot` / `pm2 logs xparafbot --lines 50`
- `node update_coins.js`

### CryptoQuests
- `pm2 restart cryptoquests-api` / `pm2 logs cryptoquests-api --lines 50`

---

## 8. VPS — informacje ogólne

- **IP**: 185.202.239.239
- **OS**: Ubuntu 24
- **Node**: v22.22.0
- **Process manager**: PM2
- **Upload plików**: przez GitHub web UI (nie terminal git)
- **pip**: zawsze z flagą `--break-system-packages`

---

## 9. Konwencje i zasady

### Kod
- **Jeden plik** `index.html` — brak buildu, brak frameworka, brak node_modules
- CSS: CSS variables (`--bg`, `--neon`, `--surface` itd.), inline w `<style>`
- JS: vanilla, bez jQuery, bez bundlera
- Firebase: `window._auth`, `window._db` — eksponowane z modułu ESM do globalnego scope

### Styl wizualny
- **Tło**: `#484862` (ciemny fioletowo-niebieski)
- **Neon akcentowy**: `#00e5ff` (cyjan)
- **Inne kolory**: `--purple: #b39ddb`, `--red: #ff6b6b`, `--green: #69ffb4`, `--yellow: #ffd740`
- **Fonty**: Share Tech Mono (mono), Exo 2 (UI)
- Ciemny motyw, grid background (linie neonowe), glow effects

### Deployment
- Zmiany: edycja `index.html` na GitHubie (ołówek) → Commit → Vercel auto-deploy (~30s)
- Plik **musi** nazywać się `index.html` (nie `dashboard.html`) — Vercel szuka index
- Wercel dodano do Firebase Authorized Domains: `wojdash.vercel.app`

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 10. Co zostało zbudowane w tej sesji

1. **v1** — podstawowy dashboard HTML z przyciskami do projektów, chipsy VPS, notatnik (localStorage)
2. **v2** — zakładki per projekt, komendy VPS z scrollem, notatki per projekt
3. **v3** — przeprojektowanie UX: zakładki zamiast zwijanych kart, komendy widoczne w całości, layout 1fr+350px
4. **v4** — Firebase + Google Auth, linki per projekt w Firebase, dodawanie/usuwanie komend przez UI
5. **Zakładka LINKI** — pełne zarządzanie projektami: dodaj/edytuj/usuń, URL opcjonalny, VPS-only
6. **DEFAULT_LINKS** — 16 projektów zapisywanych do Firebase przy pierwszym uruchomieniu
7. **refreshOpenButtons()** — przyciski OTWÓRZ biorą URL z Firebase, nie z kodu
8. **Sekcja SKRYPTY** — dropdown per projekt, długie instrukcje krok po kroku, zapis w Firebase
9. **Fix SyntaxError** — utracona deklaracja `function openCmdModal` po edycji

---

## 11. Aktualny stan

### ✅ Działa
- Single-file app wdrożona na Vercel
- Logowanie przez Google (Firebase Auth)
- Wszystkie dane w Firestore per użytkownik
- Zakładki projektów z komendami VPS (kopiowanie)
- Skrypty z dropdownem i pełną instrukcją
- Notatki per projekt (auto-zapis)
- Notatnik globalny
- Zakładka Linki — pełne CRUD (dodaj/edytuj/usuń)
- Przycisk OTWÓRZ bierze URL z Firebase
- Chipsy w prawym panelu (skrót linków)

### ⚠️ Wymaga uwagi / do zrobienia
- **Firebase config** — Wojtek musi wkleić prawdziwe dane z Firebase Console (aktualnie placeholder `TWOJ_API_KEY`)
- **URL projektów** — większość projektów ma pusty URL, Wojtek uzupełnia przez UI (zakładka Linki → ✏️)
- **Status botów VPS** — statyczny ("SPRAWDŹ"), nie pinguje VPS w czasie rzeczywistym
- **Rzeczy do dodania w przyszłości** (zaproponowane):
  - Terminal webowy (WebSocket do VPS)
  - Alerty PM2 na Telegram gdy bot padnie
  - Kalendarz spraw kuratora z terminami
  - Widget krypto (BTC/ETH ceny live)
  - Monitor transakcji portfeli

---

## 12. Pliki statyczne HTML (podstrony)

Dodatkowe narzędzia HTML (np. generator sprawozdań) można wrzucić do repo obok `index.html`. Będą dostępne pod:
```
https://wojdash.vercel.app/NAZWA_PLIKU.html
```
Potem edytuj link w zakładce Linki przez UI.

---

## PROMPT STARTOWY

Wklej poniższy blok jako pierwszą wiadomość w nowym czacie:

---

```
Cześć! Pracujemy nad moją aplikacją WojDash — osobistym dashboardem do zarządzania projektami.

**Aplikacja:**
- Pojedynczy plik `index.html` (vanilla JS/HTML/CSS, zero frameworka)
- Hosting: Vercel → https://wojdash.vercel.app
- Repo: GitHub → wojdash/index.html (plik MUSI nazywać się index.html)
- Baza: Firebase Firestore, Auth: Google signInWithPopup ONLY
- Firebase SDK v10.12.0 z gstatic CDN (ESM module)

**Styl UI:**
- Tło: #484862, neon: #00e5ff, fonty: Share Tech Mono + Exo 2
- Ciemny motyw z grid background i glow effects
- Layout: header + tabs + body-area (1fr 350px)

**Struktura UI:**
- Zakładki: XPost Manager, Signal Monitor(TG), Aplikacja Kuratora, TikTok Monitor, CryptoToDo, XParafBot, CryptoQuests + zakładka LINKI
- Każda zakładka projektu: top bar (↗ OTWÓRZ bierze URL z Firebase) + górna część [KOMENDY VPS | SKRYPTY z dropdownem] + dolna część [NOTATKI full-width]
- Prawy panel stały 350px: Status systemu + chipsy linków + Notatnik globalny
- Zakładka LINKI: karty wszystkich projektów z CRUD (dodaj/edytuj/usuń)

**Firestore struktura:** users/{uid}/cmds/{pid}, notes/{pid}, scripts/{pid}, settings/links, settings/global

**Ważne zasady:**
- Nigdy nie używać getRedirectResult, tylko signInWithPopup
- pip zawsze z --break-system-packages
- Wojtek uploaduje pliki przez GitHub web UI, nie terminal
- Zmiany kodu: edycja na GitHubie → auto-deploy Vercel ~30s
- Dodawanie projektów: dopisz do tablicy PROJECTS w kodzie + dodaj przez UI w zakładce Linki

**VPS:** IP 185.202.239.239, Ubuntu 24, Node v22.22.0, PM2

**Aktualny problem / co chcę teraz zrobić:**
[OPISZ CO CHCESZ ZROBIĆ]
```
