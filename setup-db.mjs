import { exec } from 'child_process';

// SQLite veritabanını oluşturmak için "tsx" komutu ile migrate.ts dosyasını çalıştır
console.log('SQLite veritabanı oluşturuluyor...');
exec('npx tsx server/migrate.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Hata: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  console.log(`Stdout: ${stdout}`);
  console.log('SQLite veritabanı başarıyla oluşturuldu!');
});