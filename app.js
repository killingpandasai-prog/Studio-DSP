let audioContext;
let biquadFilter; // ఇది నాయిస్ ని కట్ చేస్తుంది

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
        });
        
        if (audioContext.state === 'suspended') await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);

        // 1. Low-Pass Filter క్రియేట్ చేయడం (గాలి శబ్దం లాంటి హై-ఫ్రీక్వెన్సీ నాయిస్ ని తగ్గించడానికి)
        biquadFilter = audioContext.createBiquadFilter();
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 20000; // మొదట అన్ని శబ్దాలను రానిద్దాం

        // Mic -> Filter -> Speaker
        source.connect(biquadFilter).connect(audioContext.destination);
        
        statusText.innerText = "మైక్రోఫోన్ లైవ్ లో ఉంది! ఇప్పుడు 'Learn' బటన్ నొక్కండి.";
        learnNoiseBtn.disabled = false;
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
    }
};

learnNoiseBtn.onclick = () => {
    statusText.innerText = "నాయిస్ ఫిల్టర్ అప్లై చేస్తున్నాను...";
    
    // ఫ్రీక్వెన్సీని 3000Hz కి తగ్గిస్తున్నాం (ఇది బ్యాక్‌గ్రౌండ్ నాయిస్ ని బాగా తగ్గిస్తుంది)
    // మీ వాయిస్ కొంచెం మందంగా అనిపించవచ్చు, కానీ నాయిస్ పోతుంది.
    if (biquadFilter) {
        biquadFilter.frequency.setValueAtTime(3000, audioContext.currentTime);
        statusText.innerText = "ఫిల్టర్ ఆన్ అయ్యింది! ఇప్పుడు మీ వాయిస్ లో తేడా గమనించండి.";
        statusText.style.color = "#00ff88";
    }
};
