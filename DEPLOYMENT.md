# VoiceCommunity Deployment Rehberi

## Render.com ile Deployment (Önerilen)

### 1. Render.com'da Hesap Oluşturun
- [Render.com](https://render.com)'a gidin ve ücretsiz hesap oluşturun

### 2. Yeni Web Service Oluşturun
- Dashboard'da "New +" butonuna tıklayın
- "Web Service" seçin
- GitHub reponuzu bağlayın

### 3. Konfigürasyon
- **Name**: `voicecommunity` (veya istediğiniz bir isim)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Environment Variables Ekleme
Render dashboard'da şu environment variables'ları ekleyin:

```
DATABASE_URL=postgresql://postgres:145314@localhost:5434/voicechat
LIVEKIT_API_KEY=API9EdwkfHSexdU
LIVEKIT_API_SECRET=WmyPf5Da7ZW0in2KpaXLJwhsRq2BNKQTjtwAVdslBFA
LIVEKIT_WS_URL=wss://goccord-tokzkho6.livekit.cloud
YOUTUBE_API_KEY=AIzaSyA668-F6RXvOAYtlS1xbhOgXe37BJnS07c
NODE_ENV=production
```

### 5. Database Kurulumu
Render'da PostgreSQL database oluşturun:
- "New +" → "PostgreSQL"
- Database URL'yi kopyalayın ve DATABASE_URL olarak ayarlayın

### 6. Deploy
- "Create Web Service" butonuna tıklayın
- Build işlemi tamamlanana kadar bekleyin

## Alternatif Platformlar

### Railway.app
- Railway.app'e gidin
- GitHub reponuzu bağlayın
- Environment variables'ları ekleyin
- Otomatik deploy

### Heroku
- Heroku CLI kurun
- `heroku create voicecommunity-app`
- Environment variables'ları ekleyin
- `git push heroku main`

### Vercel
- Vercel'e gidin
- GitHub reponuzu bağlayın
- Build settings'i ayarlayın

## Önemli Notlar

1. **Database**: Production'da gerçek bir PostgreSQL database kullanın
2. **LiveKit**: LiveKit cloud servisini kullanın
3. **YouTube API**: YouTube API key'inizi güvenli tutun
4. **HTTPS**: Tüm production deployment'ları HTTPS kullanmalı
5. **Environment Variables**: Hassas bilgileri environment variables olarak saklayın

## Test Etme

Deployment tamamlandıktan sonra:
1. WebSocket bağlantılarını test edin
2. Voice chat'i test edin
3. Müzik çaları test edin
4. Chat özelliğini test edin

## Sorun Giderme

- **Build Hatası**: `npm run build` komutunu local'de test edin
- **Database Bağlantısı**: DATABASE_URL'nin doğru olduğundan emin olun
- **LiveKit**: LiveKit credentials'larını kontrol edin
- **Port**: Render otomatik olarak PORT environment variable'ını ayarlar 