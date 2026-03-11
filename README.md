AIKARYASHALA Certificate System

A modern, mobile-friendly web application for conducting games at college events and generating instant digital certificates with QR verification.

This version uses HTML, CSS, and JavaScript for the frontend, making it simple to run, modify, and deploy without any framework.

🚀 Features

Beautiful Landing Page – Gradient UI with smooth animations

Game Selection – Interactive cards for selecting games

Participant Registration – Camera capture or image upload

Instant Certificate Generation – Professional PDF certificates in seconds

QR Code Verification – Every certificate has a unique QR code

Winners Wall – Displays winners live on a screen

Fully Mobile Responsive – Works on phones, tablets, and laptops

No Framework Required – Pure HTML, CSS, and JavaScript

🎮 Available Games

AI Puzzle – Solve AI based puzzles

Memory Challenge – Test pattern memory

Tech Quiz – Answer technology questions

Prompt Battle – Create the best AI prompts

Logic Builder – Build logical systems

🛠️ Tech Stack
Frontend

HTML5 – Structure of the application

CSS3 – Styling and responsive layout

JavaScript (Vanilla JS) – Application logic and interactions

Libraries

html2canvas – Convert certificate HTML to image

jsPDF – Generate downloadable PDF certificates

QRCode.js – Generate QR codes

Storage

LocalStorage – Stores certificate data in browser

Deployment

Vercel / Netlify / GitHub Pages

📁 Project Structure
aikaryashala-certificates
│
├── index.html
├── styles.css
├── script.js
│
├── /assets
│   ├── images
│   ├── icons
│
├── /components
│   └── certificate-template.html
│
└── README.md
📦 Installation

Clone the repository:

git clone <repository-url>
cd aikaryashala-certificates

Open the project:

Open index.html in your browser

Or run using a simple local server:

npx serve

Then open:

http://localhost:3000
🚀 Deployment
GitHub Pages

Push your code to GitHub

Go to Repository Settings

Open Pages

Select main branch

Click Save

Your site will be available at:

https://username.github.io/repository-name
Vercel

Push repository to GitHub

Go to vercel.com

Import repository

Click Deploy

Netlify

Upload project folder

Deploy instantly

📱 Usage Flow
For Event Volunteers

Open the website

Click Start Experience

Select the game the participant won

Enter participant details

Capture photo or upload image

Click Generate Certificate

Download or share certificate

For Participants

Participants receive:

QR code

Certificate link

PDF certificate

They can:

Scan QR code

View certificate

Download and share

🎨 Certificate Design

Each certificate contains:

AIKARYASHALA Header

Participant Photo

Certificate ID

Participant Details

Game Name

Date

QR Code

Signature

🔐 Certificate ID Format
AIK-GVPC-25001

Explanation:

AIK  → Aikaryashala event
GVPC → College code
25   → Year
001  → Participant number

Example:

AIK-GVPC-25001
AIK-GVPC-25002
AIK-GVPC-25003
📊 Local Storage Structure

Certificates are stored in the browser using LocalStorage.

Example:

{
  id: "unique-id",
  participantName: "Student Name",
  rollNumber: "21CS001",
  phoneNumber: "9876543210",
  gameName: "AI Puzzle",
  photo: "base64-image",
  certificateId: "AIK-GVPC-25001",
  date: "11 March 2026",
  qrCode: "base64-qr"
}
🔄 Upgrade to Database (Optional)

Instead of LocalStorage you can use:

Supabase

Firebase

MongoDB

Benefits:

permanent storage

real certificate verification

multi-device access

🎯 Performance

Certificate generation speed:

Certificate generation  < 2 seconds
QR code generation      < 500 ms
PDF download            < 1 second
📱 Mobile Optimization

Responsive layout

Touch-friendly buttons

Camera capture support

Optimized images

Fast loading

🎨 Customization
Change Colors

Edit styles.css:

:root {
  --primary: #00D4FF;
  --secondary: #A855F7;
  --background: #0A0E1A;
}
Add New Games

Edit script.js:

const games = [
{
name: "AI Puzzle",
icon: "🧠",
description: "Solve AI puzzles"
},
{
name: "Tech Quiz",
icon: "💡",
description: "Answer tech questions"
}
];
Modify Certificate Template

Edit:

components/certificate-template.html

Change:

design

fonts

layout

branding

🐛 Troubleshooting
Camera not working

Use HTTPS

Allow camera permissions

Upload photo manually

Certificate not generating

Check browser console

Ensure all fields are filled

Refresh page

QR code not scanning

Increase screen brightness

Try another scanner app

Ensure correct URL

📄 License

MIT License

Free to use for college events and workshops.

🤝 Support

For issues:

Open an issue on GitHub.

Contact:

aikaryashala@gvpc.edu.in
🎉 Credits

Developed for AIKARYASHALA – Innovation & AI Learning Platform

Sumedha GVPC Engineering College

Made with ❤️ to make college events more exciting.
