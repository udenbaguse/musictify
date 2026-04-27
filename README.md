# Musictify

Musictify adalah web music player modern dengan autentikasi lengkap bergaya streaming app, dibuat dengan HTML, CSS, dan JavaScript murni.

## Fitur

- **Autentikasi Lengkap**: Login & Register dengan Clerk (OAuth) + fallback local auth
- **UI modern dan responsif** untuk desktop, tablet, dan mobile
- **Sidebar navigation** dengan toggle menu di mobile
- **Daftar lagu dinamis** dari data JavaScript
- **Kontrol player lengkap**: play/pause, next/prev, shuffle, repeat
- **Progress bar** (seek), durasi lagu, dan kontrol volume
- **Auto-play** ke lagu berikutnya saat lagu selesai
- **State management** session dengan localStorage

## Autentikasi

- **Clerk JS SDK** (via CDN) - OAuth-based authentication
- **Fallback Local Auth** - Email/password berbasis localStorage
- **Session persistence** - Auto-login pada refresh halaman
- **Role-based UI** - Navbar user profile & logout

## Struktur Project

- `index.html` - Struktur halaman utama
- `assets/css/style.css` - Styling utama dan responsive layout
- `assets/js/main.js` - Logika auth, audio player, dan interaksi UI
- `assets/images/` - Aset gambar (logo, cover, dll.)
- `assets/songs/` - File audio

## Menjalankan Project

1. Clone atau download project ini.
2. Buka folder project.
3. Jalankan `index.html` langsung di browser.

## Environment Variables

Clerk publishable key sudah terintegrasi di `index.html`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aW1wcm92ZWQtZG92ZS05MC5jbGVyay5hY2NvdW50cy5kZXYk
```

## Creator

Project ini dibuat oleh:

- Udenbaguse (Syam)
- Narusaku13 (Naufal)

## License

Project ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail.
