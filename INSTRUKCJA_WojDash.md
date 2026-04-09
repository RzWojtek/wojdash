# ⚡ WojDash — Instrukcja konfiguracji krok po kroku

---

## KROK 1 — Utwórz projekt w Firebase

1. Wejdź na **https://console.firebase.google.com**
2. Kliknij **"Add project"** (Dodaj projekt)
3. Wpisz nazwę np. `wojdash` → kliknij **Continue**
4. Wyłącz Google Analytics (nie potrzebujesz) → kliknij **Create project**
5. Poczekaj chwilę aż projekt się utworzy → kliknij **Continue**

---

## KROK 2 — Dodaj aplikację webową do Firebase

1. W panelu Firebase kliknij ikonę **`</>`** (Web)
2. Wpisz nazwę aplikacji np. `WojDash` → kliknij **Register app**
3. Zobaczysz blok kodu z danymi konfiguracyjnymi. **Skopiuj go i trzymaj na boku** — będzie potrzebny w Kroku 5.
   Wygląda tak:
   ```
   apiKey: "AIzaSy..."
   authDomain: "wojdash-xxxx.firebaseapp.com"
   projectId: "wojdash-xxxx"
   storageBucket: "wojdash-xxxx.appspot.com"
   messagingSenderId: "1234567890"
   appId: "1:12345:web:abcdef"
   ```
4. Kliknij **Continue to console**

---

## KROK 3 — Włącz logowanie przez Google

1. W lewym menu Firebase wybierz **Build → Authentication**
2. Kliknij **Get started**
3. W zakładce **Sign-in method** kliknij **Google**
4. Włącz przełącznik (Enable) → wpisz swój email jako "Project support email"
5. Kliknij **Save**

---

## KROK 4 — Utwórz bazę danych Firestore

1. W lewym menu Firebase wybierz **Build → Firestore Database**
2. Kliknij **Create database**
3. Wybierz **Start in production mode** → kliknij **Next**
4. Wybierz lokalizację **eur3 (Europe)** → kliknij **Enable**
5. Poczekaj aż baza się utworzy

### Ustaw reguły bezpieczeństwa Firestore:

1. Kliknij zakładkę **Rules**
2. Usuń wszystko i wklej poniższy kod:

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

3. Kliknij **Publish**

> To oznacza: każdy zalogowany użytkownik ma dostęp tylko do swoich danych.

---

## KROK 5 — Wklej konfigurację Firebase do pliku dashboard.html

1. Otwórz plik `dashboard.html` w Notatniku (kliknij prawym → "Otwórz za pomocą" → Notepad)
2. Znajdź ten fragment (około linii 20):

```javascript
const firebaseConfig = {
  apiKey:            "TWOJ_API_KEY",
  authDomain:        "TWOJ_PROJECT.firebaseapp.com",
  projectId:         "TWOJ_PROJECT_ID",
  storageBucket:     "TWOJ_PROJECT.appspot.com",
  messagingSenderId: "TWOJ_SENDER_ID",
  appId:             "TWOJ_APP_ID"
};
```

3. Zamień każdą wartość `"TWOJ_..."` na odpowiednią wartość z Firebase z Kroku 2.
4. Zapisz plik (Ctrl+S)

---

## KROK 6 — Wrzuć na GitHub

1. Wejdź na **https://github.com** i zaloguj się
2. Kliknij **"+"** (prawy górny róg) → **"New repository"**
3. Nazwa: `wojdash` → wybierz **Public** → kliknij **Create repository**
4. Na stronie repozytorium kliknij **"uploading an existing file"**
5. Przeciągnij plik `dashboard.html` do okna
6. Kliknij **Commit changes**

---

## KROK 7 — Wdróż na Vercel

1. Wejdź na **https://vercel.com** i zaloguj się przez GitHub
2. Kliknij **"Add New Project"**
3. Wybierz repozytorium `wojdash` → kliknij **Import**
4. Nic nie zmieniaj → kliknij **Deploy**
5. Po chwili dostaniesz adres URL np. `https://wojdash.vercel.app`

---

## KROK 8 — Dodaj domenę Vercel do Firebase (ważne!)

Bez tego logowanie przez Google nie zadziała.

1. Wróć do **Firebase Console → Authentication → Settings**
2. Kliknij zakładkę **Authorized domains**
3. Kliknij **Add domain**
4. Wpisz swój adres z Vercel np. `wojdash.vercel.app`
5. Kliknij **Add**

---

## GOTOWE! ✅

Wejdź na swój adres Vercel, kliknij **"Zaloguj przez Google"** i korzystaj.

---

## JAK DODAĆ NOWY PROJEKT W PRZYSZŁOŚCI?

Otwórz `dashboard.html` w Notatniku, znajdź sekcję `const PROJECTS = [` i dopisz nowy obiekt na końcu listy (przed ostatnim `];`):

```javascript
  { id:'gm-deploy', icon:'🌅', name:'GM Deploy Bot', color:'#ffd740',
    url:'https://twoj-link.vercel.app',
    desc:'Codzienne GM + deploy na różnych sieciach',
    cmds:[
      {n:'Status GM Bot',          c:'pm2 status gm-bot'},
      {n:'Restart GM Bot',         c:'pm2 restart gm-bot'},
      {n:'Logi GM Bot',            c:'pm2 logs gm-bot --lines 50'},
      {n:'Start GM Bot (Python)',   c:'cd /home/wojtek/gm-bot\npm2 start main.py --interpreter python3 --name gm-bot'},
    ]},
```

**Pamiętaj:** każde `id` musi być unikalne (bez spacji, małe litery).

Po zapisaniu pliku wgraj go na GitHub (zakładka pliku → ołówek → wklej nową treść → Commit) i Vercel automatycznie wdroży zmiany.

---

## PLIK SPRAWOZDANIA HTML — jak podlinkować?

**Opcja A (najprostsza):** Wgraj plik `sprawozdania.html` do repozytorium GitHub obok `dashboard.html`. Będzie dostępny pod adresem `https://wojdash.vercel.app/sprawozdania.html`. Wklej ten URL w sekcji "Inne projekty" w dashboardzie.

**Opcja B:** W `dashboard.html` zmień chip Sprawozdania na właściwy URL:
Znajdź `{n:'Sprawozdania',url:'#',c:'#69ffb4'}` i zamień `'#'` na pełny URL.

---

## NOTATKI

- Wszystkie dane (komendy, notatki, linki) są zapisywane w Firebase pod Twoim kontem Google
- Możesz logować się z każdego urządzenia i dane będą zsynchronizowane
- Auto-zapis notatek następuje 1,5 sekundy po zakończeniu pisania
- Ctrl+S = natychmiastowy zapis notatek
