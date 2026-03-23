let audioContext;
let biquadFilter;
let gateNode; // ఇది నాయిస్ ని కట్ చేస్తుంది

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
        
        if (audioContext.state === 'suspended') await audioContext.resume();
        const source = audioContext.createMediaStreamSource(stream);

        // 1. High-cut Filter (అనవసరమైన గాలి శబ్దాన్ని ఆపడానికి)
        biquadFilter = audioContext.createBiquadFilter();
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 4000; // మీ వాయిస్ క్లారిటీ కోసం ఇది చాలు

        // 2. Dynamics Compressor (నాయిస్ గేట్ లాగా వాడుతున్నాం)
        gateNode = audioContext.createDynamicsCompressor();
        gateNode.threshold.setValueAtTime(-50, audioContext.currentTime); // దీనికంటే తక్కువ ఉన్న సౌండ్ రాదు
        gateNode.knee.setValueAtTime(0, audioContext.currentTime);
        gateNode.ratio.setValueAtTime(20, audioContext.currentTime); // గట్టిగా నొక్కేస్తుంది
        gateNode.attack.setValueAtTime(0.01, audioContext.currentTime);
        gateNode.release.setValueAtTime(0.1, audioContext.currentTime);

        // Connect: Source -> Filter -> Gate -> Speaker
        source.connect(biquadFilter).connect(gateNode).connect(audioContext.destination);
        
        statusText.innerText = "నాయిస్ గేట్ ఆన్ అయ్యింది. ఇప్పుడు చెక్ చేయండి.";
        learnNoiseBtn.disabled = false;
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
    }
};

learnNoiseBtn.onclick = () => {
    if (gateNode) {
        // నాయిస్ ఇంకా వస్తుంటే థ్రెషోల్డ్ పెంచుతున్నాం
        gateNode.threshold.setTargetAtTime(-35, audioContext.currentTime, 0.1);
        statusText.innerText = "నాయిస్ గేట్ ని మరింత టైట్ చేశాను.";
        statusText.style.color = "#00ff88";
    }
};
