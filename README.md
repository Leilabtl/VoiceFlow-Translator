# Leila TRN - Premium Multi-Modal Translator

Leila TRN is a modern, high-performance web application designed for seamless real-time speech and document translation. Featuring a premium dark blue and red glassmorphism UI, it provides an intuitive and responsive experience for users to translate live speech, images, and documents instantly.

## 🚀 Features

- **Multi-Language Support**: Instantly translate between English, Finnish, French, and Farsi.
- **Real-time Speech Recognition**: Captures and transcribes live voice input using the native Web Speech API.
- **Document & Image Translation (OCR)**: Upload `.txt` files or images. The app uses Tesseract.js to extract text from images and translates it automatically.
- **Interactive Translation Chat**: A built-in chat interface that logs your spoken and uploaded translations, allowing you to also type directly for quick text translation.
- **Download Translations**: Export your entire translation session into a clean `translations.txt` file with a single click.
- **Premium UI/UX**: 
    - **Glassmorphism Design**: Sleek, modern aesthetic with frosted glass effects.
    - **Dynamic Theme**: Stunning dark blue and red animated gradient background.
    - **Responsive Layout**: Works beautifully across various screen sizes.

## 🛠️ Technology Stack

- **HTML5 & CSS3**: For semantic structure, premium styling, animations, and glassmorphism.
- **JavaScript (ES6+)**: For application logic and API integration.
- **Web Speech API**: For browser-native speech-to-text recognition.
- **MyMemory Translation API**: For fast, reliable translation services.
- **Tesseract.js**: For optical character recognition (OCR) on uploaded images.
- **Google Fonts**: Utilizing the 'Outfit' typeface for modern typography.

## 📦 Setup & Usage

To run this project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Leila.../VoiceFlow-Translator.git
   ```
2. **Open the Application**:
   It is recommended to run the app on a local server to ensure microphone and file access works perfectly. Note: Google Chrome or Microsoft Edge are recommended for Web Speech API support.
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000/index.html`.
3. **Use the Translator**:
   - Select your Source and Target languages from the dropdowns.
   - Click the microphone button to start translating your voice.
   - Click "Upload Document" to translate an image or text file.
   - View your full history in the Translation Chat and click "Download Translations" to save it!

## 📄 License

This project is open-source and available for any personal or educational use.

---
*Created by Antigravity for Leila.*
