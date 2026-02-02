const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

// Данные берем из панели Supabase (Settings -> API)
// const supabase = createClient(
//   "https://hvxvgkkrklrkjvspouig.supabase.co",
//   "sb_secret_pEdzRrroE0ibnioHrwWuCg_UUWjptf2",
// );
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// const multer = require("multer");

// Создаем папку 'uploads', если её нет
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Настройка хранилища Multer
const storage = multer.memoryStorage(); // Файл будет в памяти (buffer), а не на диске

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Папка, куда упадет файл
//     },
//     filename: (req, file, cb) => {
//         // Генерируем уникальное имя: дата + случайное число + расширение
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname) || '.jpg'; // Берем родное расширение или ставим .jpg
//         cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//     }
// });

const upload = multer({ storage: storage });

// Маршрут для загрузки (тот, что в вашем React Native коде)
app.post(
  "/webservice/user/uploadImage",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).send("Файл не получен");

      const file = req.file;
      const fileName = `${Date.now()}_${file.originalname}`;

      // 1. Загружаем файл в бакет 'avatars' (или как ты его назвал)
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file.buffer, {
          // Используй memoryStorage в multer для этого!
          contentType: file.mimetype,
        });

      if (error) throw error;

      // 2. Получаем публичную ссылку
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // 3. Отправляем ссылку обратно в приложение
      res.json({
        message: "Файл в облаке!",
        url: publicUrlData.publicUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// app.post('/webservice/user/uploadImage', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         console.log('Файл не получен');
//         return res.status(400).send('Файл не был загружен.');
//     }

//     console.log('✅ Файл успешно сохранен:', req.file.filename);
//     res.json({
//         success: true,
//         message: 'Файл на сервере!',
//         path: req.file.path
//     });
// });

// Запуск сервера
const PORT = 3000; // Можно поставить 80, если порт свободен
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Сервер запущен на http://192.168.1.195:${PORT}`);
  console.log("Ожидаю подключение от Expo Go...");
});
