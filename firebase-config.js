// ════════════════════════════════════════════════════════════
//  firebase-config.js — KONFIGURACJA FIREBASE
//  Wklej ten plik do repozytorium GitHub JEDEN RAZ.
//  Przy aktualizacji dashboard/index.html ten plik zostaje.
// ════════════════════════════════════════════════════════════

// 🔧 WOJDASH — główna baza danych dashboardu
export const firebaseConfig = {
  apiKey: "AIzaSyAeTtdeqZM-V3zioFmdvZ2a49G54qeI4sw",
  authDomain: "wojdash-5f4c9.firebaseapp.com",
  projectId: "wojdash-5f4c9",
  storageBucket: "wojdash-5f4c9.firebasestorage.app",
  messagingSenderId: "975323899690",
  appId: "1:975323899690:web:2aeb9c0a091f4292d06053"
};

// 🔧 XPOST MANAGER — osobna baza
export const xpostConfig = {
  apiKey: "AIzaSyCZWF2AVCYuv-_XYNK7dU0yd1uEn5Rs9IU",
  authDomain: "xpost-manager-e481d.firebaseapp.com",
  projectId: "xpost-manager-e481d",
  storageBucket: "xpost-manager-e481d.firebasestorage.app",
  messagingSenderId: "686782658357",
  appId: "1:686782658357:web:18d93f706ff37201fb3e7c"
};

// 🔧 TIKTOK MONITOR — osobna baza (klucze już wpisane)
export const tiktokConfig = {
  apiKey:            "AIzaSyDZ6veHZ3hAqcSQW6tBbtjhIoaifvMtCWk",
  authDomain:        "tiktokai-c7013.firebaseapp.com",
  projectId:         "tiktokai-c7013",
  storageBucket:     "tiktokai-c7013.appspot.com",
  messagingSenderId: "TIKTOK_SENDER_ID",
  appId:             "TIKTOK_APP_ID"
};

// 🔧 SIGNAL MONITOR — osobna baza
export const signalConfig = {
  apiKey: "AIzaSyB506AtgOj4n27QfiHlz-r1rne9a1YLcmI",
  authDomain: "signal-monitor-53412.firebaseapp.com",
  projectId: "signal-monitor-53412",
  storageBucket: "signal-monitor-53412.firebasestorage.app",
  messagingSenderId: "119166808656",
  appId: "1:119166808656:web:cca7e913e131ac56e1d755"
};

// 🔧 CRYPTOTODO — osobna baza (klucze już wpisane)
export const cryptotodoConfig = {
  apiKey:            "AIzaSyClnrWiuGIxHZwHuRxNbhOKw8ARaZYutE8",
  authDomain:        "cryptotodo.firebaseapp.com",
  projectId:         "cryptotodo",
  storageBucket:     "cryptotodo.firebasestorage.app",
  messagingSenderId: "984642953468",
  appId:             "1:984642953468:web:967b6bc964ec2e6ba43779"
};

// 🔧 VPS MONITOR PRO — osobna baza (klucze już wpisane)
export const vpsConfig = {
  apiKey:            "AIzaSyC8wEtcdDWnWIe_tISbTag751gh1Ux1vB0",
  authDomain:        "vps-monitor-pro.firebaseapp.com",
  projectId:         "vps-monitor-pro",
  storageBucket:     "vps-monitor-pro.firebasestorage.app",
  messagingSenderId: "74386008046",
  appId:             "1:74386008046:web:3fcf768fea56427bc290ff"
};

// 🔧 APLIKACJA KURATORA — osobna baza
export const kuratorConfig = {
  apiKey: "AIzaSyDmufYgfPL-6wy4fTFICcg_y7RiCt7hKj8",
  authDomain: "kurator-app-8bd54.firebaseapp.com",
  projectId: "kurator-app-8bd54",
  storageBucket: "kurator-app-8bd54.firebasestorage.app",
  messagingSenderId: "1006782589523",
  appId: "1:1006782589523:web:0c834783a89cb05160f4a6"
};

 
// ════════════════════════════════════════════════════════════
//  UID użytkowników per aplikacja
//  (każda aplikacja może mieć inne konto Google)
// ════════════════════════════════════════════════════════════
export const KURATOR_UID    = 'IBg9euqw0ZMNFwBKDVLrD3Qs4sH2';
export const CRYPTOTODO_UID = '8mVxUaygq3e2B0gbVmQah2BGEDD3';
export const VPS_UID        = '0SNtjmHctNOs3Z6io3xoBP2w7sV2';
