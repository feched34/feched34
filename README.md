# VoiceCommunity 🎵🎤

Modern sesli sohbet ve senkronize müzik çalar uygulaması. Arkadaşlarınızla birlikte müzik dinleyin, sesli sohbet edin ve gerçek zamanlı iletişim kurun.

## ✨ Özellikler

- 🎤 **Sesli Sohbet**: LiveKit ile yüksek kaliteli sesli iletişim
- 🎵 **Senkronize Müzik**: YouTube'dan müzik arayın ve birlikte dinleyin
- 💬 **Gerçek Zamanlı Chat**: WebSocket ile anlık mesajlaşma
- 🎨 **Modern UI**: Tailwind CSS ve Radix UI ile güzel arayüz
- 🌟 **Particles Animasyonları**: Etkileyici görsel efektler
- 📱 **Responsive**: Mobil ve masaüstü uyumlu
- 🔔 **Ses Efektleri**: Emoji reaksiyonları ve ses board

## 🚀 Canlı Demo

Uygulama şu anda canlı olarak çalışıyor! Arkadaşlarınızla birlikte kullanmak için:

1. **Render.com** üzerinde deploy edildi
2. **PostgreSQL** database kullanılıyor
3. **LiveKit** ile sesli sohbet
4. **YouTube API** ile müzik arama

## 🛠️ Teknolojiler

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket
- **Database**: PostgreSQL, Drizzle ORM
- **Voice Chat**: LiveKit
- **Music**: YouTube API
- **Deployment**: Render.com

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- LiveKit hesabı
- YouTube API key

### Lokal Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/yourusername/voicecommunity.git
cd voicecommunity

# Bağımlılıkları yükleyin
npm install

# Environment variables'ları ayarlayın
# .env dosyası oluşturun ve gerekli değişkenleri ekleyin

# Database'i hazırlayın
npm run db:push

# Geliştirme sunucusunu başlatın
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_WS_URL=wss://your-livekit-instance.livekit.cloud
YOUTUBE_API_KEY=your_youtube_api_key
```

## 🌐 Deployment

Uygulamanızı canlıya almak için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasını inceleyin.

### Hızlı Deployment (Render.com)

1. [Render.com](https://render.com)'a gidin
2. GitHub reponuzu bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin!

## 🎯 Kullanım

1. **Giriş**: Nickname'inizi girin ve odaya katılın
2. **Sesli Sohbet**: Mikrofon butonuna tıklayarak konuşmaya başlayın
3. **Müzik**: YouTube'dan müzik arayın ve kuyruğa ekleyin
4. **Chat**: Mesaj yazın ve emoji reaksiyonları gönderin
5. **Ses Efektleri**: Ses board'dan efektler çalın

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [LiveKit](https://livekit.io/) - Sesli sohbet altyapısı
- [Radix UI](https://www.radix-ui.com/) - UI bileşenleri
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [YouTube API](https://developers.google.com/youtube) - Müzik arama

## 📞 İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz.

---

**VoiceCommunity** ile arkadaşlarınızla mükemmel bir deneyim yaşayın! 🎉 