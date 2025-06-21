# VoiceCommunity - v.1.1.0 🎵

## 🎯 Proje Özeti
React (Vite), Express/Node.js, LiveKit ve WebSocket tabanlı modern sesli sohbet ve **senkronize müzik çalar** uygulaması.

## ✨ v.1.1.0 Senkronize Özellikleri

### 🎵 Senkronize Müzik Sistemi
- ✅ **WebSocket tabanlı gerçek zamanlı müzik senkronizasyonu**
- ✅ **Tüm kullanıcılar için ortak müzik kontrolü**
- ✅ **Play/Pause, Next/Previous, Shuffle, Repeat senkronizasyonu**
- ✅ **Kuyruk ekleme/çıkarma senkronizasyonu**
- ✅ **Otomatik yeniden bağlanma özelliği**
- ✅ **Kişisel ses seviyesi kontrolü (senkronize değil)**

### 🎤 Sesli Sohbet
- ✅ LiveKit entegrasyonu ile gerçek zamanlı sesli iletişim
- ✅ Mikrofon açma/kapama ve sağırlaştırma özellikleri
- ✅ Katılımcı listesi ve ses seviyesi kontrolü
- ✅ Konuşma durumu göstergeleri (yeşil halka animasyonu)
- ✅ Mikrofon ve deafen durumu belirteçleri

### 💬 Yazılı Sohbet
- ✅ Modern, emoji destekli sohbet arayüzü
- ✅ Emoji reaksiyon sistemi (bırakma/kaldırma)
- ✅ Medya paylaşımı (resim/video)
- ✅ Mesaj gruplandırma (aynı kullanıcı)
- ✅ **Uzun mesajlar için word-wrap optimizasyonu**
- ✅ **Responsive tasarım iyileştirmeleri**
- ✅ Akıllı saat gösterimi (aynı dakikada sadece son mesajda)
- ✅ Kompakt tasarım (minimal boşluklar)

### 🎵 Müzik Çalar
- ✅ YouTube API entegrasyonu
- ✅ Şarkı arama ve otomatik oynatma
- ✅ Kuyruk yönetimi
- ✅ Ses kontrolü ve ilerleme çubuğu
- ✅ Modern müzik çalar arayüzü
- ✅ **Senkronize müzik kontrolleri**

### 🎨 Kullanıcı Arayüzü
- ✅ Koyu tema (uzay/galaktik renkler)
- ✅ Cam efektli (glassmorphism) tasarım
- ✅ Particles animasyonu (tsparticles)
- ✅ Responsive tasarım
- ✅ Smooth animasyonlar ve geçişler
- ✅ Modern UI komponentleri

### 🔧 Teknik Özellikler
- ✅ TypeScript desteği
- ✅ WebSocket bağlantısı
- ✅ Environment variables (.env)
- ✅ Error handling ve loading states
- ✅ Performance optimizasyonları
- ✅ Modern React hooks (useCallback, useMemo, useRef)
- ✅ **useMusicSync Hook**
- ✅ **WebSocket Müzik Kontrolü**

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- LiveKit hesabı ve API anahtarları
- YouTube Data API anahtarı

### Adımlar
1. **Repository'yi klonlayın**
   ```bash
   git clone [repository-url]
   cd VoiceCommunity
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment dosyalarını oluşturun**
   ```bash
   # .env dosyası
   VITE_LIVEKIT_URL=your_livekit_url
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. **Server'ı başlatın**
   ```bash
   npm run dev
   ```

5. **Client'ı başlatın**
   ```bash
   cd client
   npm run dev
   ```

## 🎯 Kullanım

1. **Odaya Katılma**: Nickname girerek odaya katılın
2. **Sesli Sohbet**: Mikrofon ve ses kontrollerini kullanın
3. **Yazılı Sohbet**: Mesaj yazın, emoji bırakın, medya paylaşın
4. **Senkronize Müzik**: Şarkı arayın, çalın ve tüm odadaki kullanıcılarla senkronize olun

## 🔮 Gelecek Versiyonlar

### v.1.2 Planları
- [ ] Oda yönetimi (oda oluşturma/katılma)
- [ ] Kullanıcı rolleri (admin, moderator)
- [ ] Gelişmiş ses efektleri ve soundboard
- [ ] Ekran paylaşımı
- [ ] Dosya paylaşımı

### v.2.0 Planları
- [ ] Video görüşme
- [ ] Grup sohbetleri
- [ ] Bildirim sistemi
- [ ] Mobil uygulama
- [ ] Gelişmiş güvenlik özellikleri

## 🛠️ Teknolojiler

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express
- **Sesli İletişim**: LiveKit
- **UI**: Tailwind CSS, shadcn/ui
- **Animasyonlar**: tsparticles, Framer Motion
- **API**: YouTube Data API
- **WebSocket**: Socket.io
- **Müzik Senkronizasyonu**: Custom WebSocket Protocol

## 📝 Lisans

MIT License

---

**v.1.1.0 Senkronize Kilometre Taşı Tamamlandı! 🎵**

Bu versiyonda müzik senkronizasyonu sistemi başarıyla tamamlandı. Artık tüm kullanıcılar müzik üzerinde ortak kontrol sahibi ve gerçek zamanlı senkronizasyon ile mükemmel bir deneyim yaşıyorlar! 