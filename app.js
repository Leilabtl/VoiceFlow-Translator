const micBtn = document.getElementById('mic-btn');
const langSrcSelect = document.getElementById('lang-src');
const langTargetSelect = document.getElementById('lang-target');
const swapLangBtn = document.getElementById('swap-lang-btn');

const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const actionHint = document.getElementById('action-hint');
const inputStatus = document.getElementById('input-status');

const uploadDoc = document.getElementById('upload-doc');
const downloadBtn = document.getElementById('download-btn');
const visionStatus = document.getElementById('vision-status');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');

let isListening = false;
let recognition = null;

const subtitleOverlay = document.getElementById('subtitle-overlay');
const videoFeed = document.getElementById('video-feed');

let stream = null;

// Initialize Webcam
async function initWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoFeed.srcObject = stream;
    } catch (err) {
        console.error("Error accessing webcam:", err);
        actionHint.innerText = "Camera access denied. Showing text only.";
    }
}

// Start webcam on load
initWebcam();

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('active');
        inputStatus.classList.add('listening');
        actionHint.innerText = 'Listening... Speak now';
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('active');
        inputStatus.classList.remove('listening');
        actionHint.innerText = 'Click to start listening';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
                addChatMessage(finalTranscript, 'user');
                translateText(finalTranscript);
            } else {
                interimTranscript += event.results[i][0].transcript;
                // Real-time interim feedback on subtitle
                subtitleOverlay.innerText = interimTranscript;
            }
        }

        inputText.innerText = finalTranscript || interimTranscript || '...';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone permissions.');
        }
    };
} else {
    alert('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
}

// Language Mapping and Logic
const speechMap = {
    'en': 'en-US',
    'fi': 'fi-FI',
    'fr': 'fr-FR',
    'fa': 'fa-IR'
};

const tesseractMap = {
    'en': 'eng',
    'fi': 'fin',
    'fr': 'fra',
    'fa': 'fas'
};

function updateSpeechLang() {
    if (recognition) {
        recognition.lang = speechMap[langSrcSelect.value] || 'en-US';
    }
    resetTexts();
}

langSrcSelect.addEventListener('change', updateSpeechLang);
langTargetSelect.addEventListener('change', resetTexts);

swapLangBtn.addEventListener('click', () => {
    const temp = langSrcSelect.value;
    langSrcSelect.value = langTargetSelect.value;
    langTargetSelect.value = temp;
    updateSpeechLang();
});

// Set initial language
if (recognition) recognition.lang = speechMap[langSrcSelect.value] || 'en-US';

micBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        resetTexts();
        recognition.start();
    }
});

function resetTexts() {
    inputText.innerText = '...';
    outputText.innerText = '...';
    subtitleOverlay.innerText = '...';
}

// Translation using MyMemory API (Free, Anonymous usage)
async function translateText(text, addToChat = true) {
    if (!text || text.trim() === '') return;

    const from = langSrcSelect.value;
    const to = langTargetSelect.value;
    
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
        const data = await response.json();

        if (data.responseData) {
            const translated = data.responseData.translatedText;
            outputText.innerText = translated;
            subtitleOverlay.innerText = translated;
            if (addToChat) {
                addChatMessage(translated, 'bot');
            }
        } else {
            outputText.innerText = 'Error in translation.';
        }
    } catch (error) {
        console.error('Translation error:', error);
        outputText.innerText = 'Could not reach translation service.';
    }
}

// Chat Feature Logic
function addChatMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatInput() {
    const text = chatInput.value.trim();
    if (text) {
        addChatMessage(text, 'user');
        chatInput.value = '';
        translateText(text);
    }
}

chatSendBtn.addEventListener('click', handleChatInput);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatInput();
});

// Document Upload & Vision OCR
uploadDoc.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    visionStatus.innerText = 'Processing document... please wait.';
    let extractedText = '';

    if (file.type.startsWith('image/')) {
        try {
            const lang = tesseractMap[langSrcSelect.value] || 'eng';
            const result = await Tesseract.recognize(file, lang, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        visionStatus.innerText = `Recognizing text: ${Math.round(m.progress * 100)}%`;
                    }
                }
            });
            extractedText = result.data.text;
        } catch (err) {
            console.error('Vision error:', err);
            visionStatus.innerText = 'Error processing image.';
            return;
        }
    } else if (file.type === 'text/plain') {
        extractedText = await file.text();
    } else {
        visionStatus.innerText = 'Unsupported file type. Please upload an image or .txt file.';
        return;
    }

    visionStatus.innerText = 'Document processed successfully.';
    if (extractedText.trim()) {
        addChatMessage(`[Document Uploaded]:\n${extractedText}`, 'user');
        translateText(extractedText);
    } else {
        visionStatus.innerText = 'No text found in document.';
    }
    
    // Clear input so same file can be uploaded again if needed
    uploadDoc.value = '';
});

// Download Translations Feature
downloadBtn.addEventListener('click', () => {
    const botMessages = document.querySelectorAll('.chat-message.bot');
    let content = "Leila TRN - Translations\n\n";
    let hasTranslations = false;
    
    botMessages.forEach((msg, index) => {
        if (index > 0) { // skip the first default welcome message
            content += `- ${msg.innerText}\n`;
            hasTranslations = true;
        }
    });
    
    if (!hasTranslations) {
        alert("No translations to download yet!");
        return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

