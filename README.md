Luxe Parfum — Toko Parfum Premium

Deskripsi:
Proyek frontend sederhana untuk toko parfum (HTML/CSS/JS). Tema hitam + biru, responsif, checkout simulasi, riwayat disimpan ke Firestore.

Persiapan sebelum push ke GitHub:

- Pastikan Anda sudah login GitHub di mesin ini (HTTPS credential atau `gh` CLI).
- Jika ingin hosting di Firebase, jalankan `firebase init` dan atur Hosting.

Cara mengirim (contoh):

```powershell
cd "c:\Users\ASUS\OneDrive\Desktop\parfum"
# Inisialisasi git (sudah dilakukan oleh skrip jika Anda izinkan)
git add .
git commit -m "Initial commit"
# Jika repo remote belum ada di GitHub, buat dulu atau gunakan GitHub CLI
# Contoh push:
git remote add origin https://github.com/hanifprasetya154-arch/parfum.git
git push -u origin main
```

Catatan keamanan:

- `firebase-config.js` ditambahkan ke `.gitignore` agar kredensial tidak ter-commit.
- Jika `firebase-config.js` sudah ter-commit sebelumnya, hapus dengan `git rm --cached firebase-config.js` lalu commit.

Kontak:

- Pemilik: hanifprasetya154-arch
