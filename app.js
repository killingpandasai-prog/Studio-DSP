let audioContext;
let noiseProcessor;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        // 1. AudioContext ని క్రియేట్ చేయడం (Mobile user gesture కోసం)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // 2. Microphone పర్మిషన్ అడగడం
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: false, 
                noiseSuppression: false, 
                autoGainControl: false 
            } 
        });
        
        statusText.innerText = "మైక్రోఫోన్ అనుమతి దొరికింది. లోడ్ అవుతోంది...";

        // 3. Audio Context ని Resume చేయడం (Mobile లో ఇది చాలా ముఖ్యం)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        
        // 4. Processor ఫైల్ ని లోడ్ చేయడం
        // Note: '/' బదులు పూర్తి URL ని వాడుతున్నాం
        await audioContext.audioWorklet.addModule('processor.js');
        
        noiseProcessor = new AudioWorkletNode(audioContext, 'studio-processor');
        
        source.connect(noiseProcessor).connect(audioContext.destination);
        
        statusText.innerText = "మైక్రోఫోన్ ఆన్ అయ్యింది! ఇప్పుడు హెడ్‌ఫోన్స్ పెట్టుకుని వినండి.";
        learnNoiseBtn.disabled = false;
        startBtn.style.background = "#444";
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
        console.error(err);
    }
};

learnNoiseBtn.onclick = () => {
    if (noiseProcessor) {
        noiseProcessor.port.postMessage('learn');
        statusText.innerText = "గది నాయిస్‌ని స్టడీ చేస్తున్నాను... 5 సెకన్లు నిశ్శబ్దంగా ఉండండి.";
        setTimeout(() => { 
            statusText.innerText = "నాయిస్ ప్రొఫైల్ సేవ్ అయ్యింది! ఇప్పుడు మాట్లాడండి."; 
        }, 5000);
    }
};
