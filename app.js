let audioContext;
let biquadFilter;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        // Latency తగ్గించడానికి 'interactive' మోడ్
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            latencyHint: 'interactive'
        });

        // Reverb మరియు Echo ని ఆపడానికి ఇక్కడ మార్పులు చేశాను
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: true, // Reverb ని ఆపడానికి ఇది 'true' ఉండాలి
                noiseSuppression: true,  // బ్రౌజర్ ఇన్-బిల్ట్ నాయిస్ రిడక్షన్
                autoGainControl: true 
            } 
        });
        
        if (audioContext.state === 'suspended') await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);

        // Low-pass filter ని కొంచెం షార్ప్ గా సెట్ చేస్తున్నాను
        biquadFilter = audioContext.createBiquadFilter();
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 8000; // అనవసరమైన హై-పిచ్ నాయిస్ ని కట్ చేస్తుంది

        // Mic -> Filter -> Speaker
        source.connect(biquadFilter).connect(audioContext.destination);
        
        statusText.innerText = "మైక్రోఫోన్ ఆన్ అయ్యింది. ఇప్పుడు చెక్ చేయండి.";
        learnNoiseBtn.disabled = false;
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
    }
};

learnNoiseBtn.onclick = () => {
    if (biquadFilter) {
        // ఫ్రీక్వెన్సీని ఇంకా తగ్గించి 3500Hz కి పెడుతున్నాం (నాయిస్ పోవడానికి)
        biquadFilter.frequency.setTargetAtTime(3500, audioContext.currentTime, 0.1);
        statusText.innerText = "ఎక్స్‌ట్రా నాయిస్ ఫిల్టర్ అప్లై చేయబడింది.";
    }
};
