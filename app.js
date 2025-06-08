// app.js — сервер с базой данных SQLite

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Настройка Express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация БД
const db = new sqlite3.Database('database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('✅ Подключено к SQLite');
});

// Создание таблицы заявок при первом запуске
db.run(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  comment TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Роут главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка формы
app.post('/send', (req, res) => {
  const { name, phone, service, comment } = req.body;

  // Сохраняем в БД
  const sql = 'INSERT INTO orders (name, phone, service, comment) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, phone, service, comment], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Ошибка сохранения в базу данных.');
    }
    console.log(`📝 Заявка сохранена (ID ${this.lastID})`);

    // (опционально) Отправка почты
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_app_password'
      }
    });

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'admin@example.com',
      subject: 'Новая заявка с сайта ЭКОЛАЙФ',
      html: `<p>Новая заявка:</p><ul>
        <li>Имя: ${name}</li>
        <li>Телефон: ${phone}</li>
        <li>Услуга: ${service}</li>
        <li>Комментарий: ${comment}</li></ul>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Ошибка почты:', error);
      } else {
        console.log('✉ Заявка отправлена на email:', info.response);
      }
    });

    res.send('<h1>Спасибо за заявку!</h1><p>Мы свяжемся с вами в ближайшее время.</p>');
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
