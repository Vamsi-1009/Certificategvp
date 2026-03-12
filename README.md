# AIKARYASHALA Certificate System

A modern, high-performance web application for conducting games at college events and generating instant digital certificates with QR verification. Fully optimized for speed, reliability, and mobile responsiveness.

🚀 **Key Features**

- **Instant Generation**: Near-instantaneous certificate generation (delay removed for ultimate performance).
- **Premium Design**: Modern, centered certificate layout with high-quality typography and balanced elements.
- **Full Responsiveness**: Seamless experience across mobile, tablet, and desktop viewports.
- **Fluid Scaling**: Certificates automatically scale to fit any mobile screen without horizontal scrolling.
- **Robust Storage**: Integrated image compression and smart storage management to prevent "Quota Exceeded" errors.
- **Winners Wall**: Live-updating grid to showcase winners during events.
- **QR Verification**: Built-in verification system accessible via scan.

---

## 📁 Project Structure

```text
aikaryashala-certificates
│
├── index.html               # Main application entry point (Modular)
├── styles.css               # Global responsive design system
├── app.js                   # Application logic, storage, and QR handling
├── certificate-template.js  # Modular HTML templates for certificates
└── README.md
```

---

## 🎮 Available Games

| Game | Category | Description |
| :--- | :--- | :--- |
| **AI Puzzle** | Problem Solving | Solve intricate AI-based puzzles and logic chains. |
| **Memory Challenge** | Cognitive | Test pattern memory and cognitive recall. |
| **Tech Quiz** | Knowledge | Cutting-edge questions across AI, CS, and Tech. |
| **Prompt Battle** | Creativity | Craft creative and effective AI prompts. |
| **Logic Builder** | Engineering | Construct logical systems and pipelines. |
| **Code Sprint** | Coding | Write elegant, efficient code under pressure. |

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript.
- **Libraries**: 
    - `html2canvas.js`: HTML to Image conversion.
    - `jsPDF`: Professional PDF generation.
    - `QRCode.js`: dynamic QR code rendering.
- **Storage**: Browser `localStorage` with integrated **JPEG compression** and auto-cleanup logic.

---

## 📦 Installation & Deployment

1. **Clone & Open**:
   ```bash
   git clone <repository-url>
   open index.html
   ```

2. **Deployment**:
   The app is static and requires no build step. Simply upload to **GitHub Pages**, **Vercel**, or **Netlify** for instant live access.

---

## 📸 Photo & Storage Optimization

To ensure long-term stability:
- All participant photos are automatically **compressed to JPEG** (70% quality) upon upload.
- Typical photo size is reduced from ~3MB to ~50KB.
- If storage limit (5MB) is reached, the system automatically clears the **oldest 10 records** to allow new ones.

---

## 🎯 Performance Benchmarks

| Action | Performance |
| :--- | :--- |
| **Certificate View** | Instant (< 50ms) |
| **QR Code Load** | Instant (< 100ms) |
| **PDF Generation** | Fast (< 1.5s) |

---

## 📄 License

Developed for **AIKARYASHALA** – Innovation & AI Learning Platform.
Made with ❤️ by AIKARYASHALA Team.
