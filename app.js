let audioContext;
let biquadFilter;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        // 1. Latency ని తగ్గించడానికి 'balanced' బదులు 'interactive' వాడదాం
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            latencyHint: 0, // ఇది అతి తక్కువ డిలే కోసం
        });

        // 2. Delay కి కారణమయ్యే అదనపు ప్రాసెసింగ్‌ని తీసేద్దాం
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: false, // Delay తగ్గించడానికి ఇది ముఖ్యం
                noiseSuppression: false, 
                autoGainControl: false,
                latency: 0
            } 
        });
        
        if (audioContext.state === 'suspended') await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);

        // Filter ని చాలా సింపుల్ గా ఉంచుదాం
        biquadFilter = audioContext.createBiquadFilter();
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 15000; 

        // Direct Connection (Mic -> Filter -> Destination)
        source.connect(biquadFilter).connect(audioContext.destination);
        
        statusText.innerText = "లైవ్! డిలే తగ్గిందో లేదో చూడండి.";
        learnNoiseBtn.disabled = false;
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
    }
};

learnNoiseBtn.onclick = () => {
    if (biquadFilter) {
        // వాయిస్ క్లారిటీ పోకుండా 5000Hz కి సెట్ చేస్తున్నాను
        biquadFilter.frequency.setTargetAtTime(5000, audioContext.currentTime, 0.05);
        statusText.innerText = "నాయిస్ ఫిల్టర్ ఆన్ అయ్యింది.";
    }
};
