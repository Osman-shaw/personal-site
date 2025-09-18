import express from "express";
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import cors from 'cors';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for React frontend

// Nodemailer transporter configuration
// IMPORTANT: Use Vercel Environment Variables for these values
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app-specific password
  },
});

// Route to handle form submission
app.post('/api/contact',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully!' });

    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email.' });
    }
  }
);

// This is the crucial change for Vercel
export default app;