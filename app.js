let audioContext;
let biquadFilter;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        // Latency తగ్గించడానికి 'interactive' మోడ్ వాడుతున్నాం
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            latencyHint: 'interactive',
            sampleRate: 44100,
        });

        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: true, 
                noiseSuppression: false, 
                autoGainControl: true 
            } 
        });
        
        if (audioContext.state === 'suspended') await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);

        // స్టట్టరింగ్ తగ్గించడానికి కంప్రెసర్ యాడ్ చేస్తున్నాం
        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
        compressor.knee.setValueAtTime(40, audioContext.currentTime);
        compressor.ratio.setValueAtTime(12, audioContext.currentTime);
        compressor.attack.setValueAtTime(0, audioContext.currentTime);
        compressor.release.setValueAtTime(0.25, audioContext.currentTime);

        biquadFilter = audioContext.createBiquadFilter();
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 15000; 

        // Mic -> Compressor -> Filter -> Speaker
        source.connect(compressor).connect(biquadFilter).connect(audioContext.destination);
        
        statusText.innerText = "మైక్రోఫోన్ క్లియర్ గా ఉంది! స్టట్టరింగ్ తగ్గుతుందో లేదో చూడండి.";
        learnNoiseBtn.disabled = false;
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
    }
};

learnNoiseBtn.onclick = () => {
    if (biquadFilter) {
        // ఫ్రీక్వెన్సీని మరీ తక్కువ చేయకుండా 4000Hz కి పెడుతున్నాం (క్లారిటీ కోసం)
        biquadFilter.frequency.setTargetAtTime(4000, audioContext.currentTime, 0.1);
        statusText.innerText = "నాయిస్ తగ్గించబడింది. ఇప్పుడు వాయిస్ స్మూత్ గా రావాలి.";
    }
};
