
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

// Создаем папку 'uploads', если её нет
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Настройка хранилища Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Папка, куда упадет файл
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя: дата + случайное число + расширение
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg'; // Берем родное расширение или ставим .jpg
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Маршрут для загрузки (тот, что в вашем React Native коде)
app.post('/webservice/user/uploadImage', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log('Файл не получен');
        return res.status(400).send('Файл не был загружен.');
    }

    console.log('✅ Файл успешно сохранен:', req.file.filename);
    res.json({
        success: true,
        message: 'Файл на сервере!',
        path: req.file.path
    });
});

// Запуск сервера
const PORT = 3000; // Можно поставить 80, если порт свободен
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на http://192.168.1.195:${PORT}`);
    console.log('Ожидаю подключение от Expo Go...');
});