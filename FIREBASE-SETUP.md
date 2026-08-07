# Bật analytics (Firebase) — các bước còn lại trên Console

Config đã dán sẵn (`assets/firebase-config.js`). Làm 4 bước dưới trên
[Firebase Console](https://console.firebase.google.com/project/kien-portfolio-3f3e5) là chạy.

## 1. Bật Firestore Database
Console → **Build → Firestore Database → Create database** → **Production mode** → chọn location
`asia-southeast1` (Singapore) → Enable.

## 2. Dán Security Rules
Firestore → tab **Rules** → xoá hết, dán nội dung file [`firestore.rules`](firestore.rules) → **Publish**.
> Rules này: khách CHỈ được ghi event (không đọc được của người khác); counter "lượt xem" ai cũng đọc
> nhưng chỉ tăng được +1; chỉ email `kientlt59@gmail.com` đọc được toàn bộ event (cho dashboard).

## 3. Bật Authentication (cho trang /analytics)
Console → **Build → Authentication → Get started** → tab **Sign-in method** → **Google** → Enable →
chọn support email → Save.

## 4. Thêm Authorized domain (QUAN TRỌNG — nếu thiếu, login popup lỗi)
Authentication → **Settings → Authorized domains → Add domain** →
nhập **`tranletrungkien1705.github.io`** → Add.

---

## Xong! Kiểm tra
- Mở https://tranletrungkien1705.github.io/ → cuộn xuống footer thấy **"… lượt xem · … tương tác"** (sau vài giây).
- Mở https://tranletrungkien1705.github.io/analytics.html → **Đăng nhập với Google** (email của bạn) → xem dashboard.
- Firestore → tab **Data** sẽ thấy collection `events` + doc `public_stats/counters` đầy dần khi có người vào.
- GA4 (đã có `measurementId`): Console → **Analytics** → xem realtime/engagement (trễ tới ~24h cho báo cáo đầy đủ).

## Riêng tư & chi phí
- Chỉ thu **ẩn danh** (loại sự kiện, section, referrer, thiết bị) — KHÔNG lấy thông tin cá nhân.
- Free tier Firestore (Spark): 50k đọc + 20k ghi/ngày — quá dư cho portfolio.
- Nên thêm 1 dòng "site dùng analytics ẩn danh" nếu muốn minh bạch tuyệt đối.
