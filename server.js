import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kainat-form-server' });
});

app.post('/api/forms', upload.single('artwork'), async (req, res) => {
  try {
    const payload = { ...req.body };
    const formType = payload.formType || 'contact';
    const createdAt = payload.createdAt || new Date().toISOString();

    const rows = Object.entries(payload)
      .filter(([key]) => key !== 'artwork' && key !== 'formType' && key !== 'createdAt')
      .map(([key, value]) => `<tr><th style="text-align:left; padding:8px 10px; border-bottom:1px solid #eee;">${key}</th><td style="padding:8px 10px; border-bottom:1px solid #eee;">${String(value || '-')}</td></tr>`)
      .join('');

    const attachment = req.file
      ? [{ filename: req.file.originalname, path: req.file.path }]
      : [];

    const subject = formType === 'quotes'
      ? 'New packaging quote request'
      : formType === 'contacts'
        ? 'New website enquiry'
        : formType === 'orders'
          ? 'New order from website'
          : 'Website form submission';

    const html = `
      <div style="font-family:Arial,sans-serif; color:#1f1f1f; line-height:1.6;">
        <h2 style="margin-bottom:12px;">${subject}</h2>
        <p><strong>Form type:</strong> ${formType}</p>
        <p><strong>Received:</strong> ${createdAt}</p>
        <table style="width:100%; border-collapse:collapse; margin-top:12px; background:#faf8f5;">
          ${rows}
        </table>
      </div>
    `;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_TO) {
      await mailTransport.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.MAIL_TO,
        replyTo: payload.email || process.env.SMTP_USER,
        subject,
        html,
        attachments: attachment,
      });
    } else {
      console.log('\n--- FORM SUBMISSION ---');
      console.log(JSON.stringify(payload, null, 2));
      console.log('--- END FORM SUBMISSION ---\n');
    }

    res.status(200).json({ ok: true, message: 'Submission received' });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ ok: false, error: 'Form submission failed' });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

app.listen(PORT, () => {
  console.log(`Form server running on http://localhost:${PORT}`);
});
