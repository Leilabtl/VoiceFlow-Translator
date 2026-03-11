const micBtn = document.getElementById('mic-btn');
const langToggle = document.getElementById('lang-toggle');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const actionHint = document.getElementById('action-hint');
const inputStatus = document.getElementById('input-status');
const langSrcLabel = document.getElementById('lang-src');
const langTargetLabel = document.getElementById('lang-target');

let isListening = false;
let recognition = null;

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
                translateText(finalTranscript);
            } else {
                interimTranscript += event.results[i][0].transcript;
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

// Toggle logic
langToggle.addEventListener('change', () => {
    if (langToggle.checked) {
        // FI -> EN
        langSrcLabel.innerText = 'Finnish';
        langTargetLabel.innerText = 'English';
        if (recognition) recognition.lang = 'fi-FI';
    } else {
        // EN -> FI
        langSrcLabel.innerText = 'English';
        langTargetLabel.innerText = 'Finnish';
        if (recognition) recognition.lang = 'en-US';
    }
    resetTexts();
});

// Set initial language
if (recognition) recognition.lang = 'en-US';

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
}

// Translation using MyMemory API (Free, Anonymous usage)
async function translateText(text) {
    if (!text || text.trim() === '') return;

    const from = langToggle.checked ? 'fi' : 'en';
    const to = langToggle.checked ? 'en' : 'fi';
    
    // Smooth loading state for translation
    if (outputText.innerText === '...') {
        outputText.innerText = 'Translating...';
    }

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
        const data = await response.json();

        if (data.responseData) {
            outputText.innerText = data.responseData.translatedText;
        } else {
            outputText.innerText = 'Error in translation.';
        }
    } catch (error) {
        console.error('Translation error:', error);
        outputText.innerText = 'Could not reach translation service.';
    }
}
