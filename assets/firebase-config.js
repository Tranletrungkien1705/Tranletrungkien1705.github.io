// ============================================================================
//  Firebase config — DÁN từ Firebase Console vào đây.
//  Console → Project settings (bánh răng) → General → Your apps → Web app → SDK setup
//  Các key này PUBLIC & AN TOÀN nhúng client (bảo mật do Firestore rules lo, không phải do giấu key).
//  Analytics CHỈ bật khi apiKey khác placeholder → chưa dán thì site chạy bình thường, không track.
// ============================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyB-Ors0r74_3ZQ-Wy1GIidtk8QxCCUEbPg",
  authDomain: "kien-portfolio-3f3e5.firebaseapp.com",
  projectId: "kien-portfolio-3f3e5",
  storageBucket: "kien-portfolio-3f3e5.firebasestorage.app",
  messagingSenderId: "322884633710",
  appId: "1:322884633710:web:7ac99d840be649fe01127f",
  measurementId: "G-8687KNSK23"
};

// Email Google của bạn — CHỈ email này được xem trang /analytics
export const OWNER_EMAIL = "kientlt59@gmail.com";

// tự bật khi đã dán config thật
export const ENABLED = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE");
