let audioContext;
let noiseProcessor;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    audioContext = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
    });
    
    const source = audioContext.createMediaStreamSource(stream);
    
    // AudioWorklet ని లోడ్ చేయడం
    await audioContext.audioWorklet.addModule('./processor.js');

   noiseProcessor = new AudioWorkletNode(audioContext, 'studio-processor');
    
    source.connect(noiseProcessor).connect(audioContext.destination);
    
    statusText.innerText = "మైక్రోఫోన్ కనెక్ట్ అయింది! వాయిస్ వినబడుతుందా?";
    learnNoiseBtn.disabled = false;
    startBtn.disabled = true;
};

learnNoiseBtn.onclick = () => {
    noiseProcessor.port.postMessage('learn');
    statusText.innerText = "గది నాయిస్‌ని స్టడీ చేస్తున్నాను... 5 సెకన్లు నిశ్శబ్దంగా ఉండండి.";
    setTimeout(() => { 
        noiseProcessor.port.postMessage('stop-learn');
        statusText.innerText = "నాయిస్ ప్రొఫైల్ సేవ్ అయ్యింది! ఇప్పుడు మాట్లాడండి."; 
    }, 5000);
};
