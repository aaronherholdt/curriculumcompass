import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sender = {
  email: process.env.SENDGRID_FROM_EMAIL || 'aaron@curriculumcompass.online',
  name: process.env.SENDGRID_FROM_NAME || 'CurriculumCompass',
}; 