const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder if missing
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// File upload storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.pdf', '.doc', '.docx', '.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// API route → forward to n8n
app.post('/api/webhook', upload.single('file'), async (req, res) => {
  try {
    const taskData = {
      id: `task_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...req.body,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null,
      status: 'received'
    };

    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) throw new Error(`n8n error: ${response.status}`);

    res.json({ success: true, message: 'Task submitted successfully', taskId: taskData.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
