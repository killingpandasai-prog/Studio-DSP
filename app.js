let audioContext;
let noiseProcessor;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        // 1. AudioContext ని క్రియేట్ చేయడం (Mobile Compatibility కోసం)
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
        
        // 3. Audio Context ని Resume చేయడం (Mobile లో ఇది చాలా ముఖ్యం)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        
        // 4. Processor ఫైల్ ని Full URL తో లోడ్ చేయడం
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        const processorUrl = baseUrl.endsWith('/') ? baseUrl + 'processor.js' : baseUrl + '/processor.js';
        
        statusText.innerText = "Worklet ని లోడ్ చేస్తున్నాను...";
        await audioContext.audioWorklet.addModule(processorUrl);
        
        noiseProcessor = new AudioWorkletNode(audioContext, 'studio-processor');
        
        // మైక్రోఫోన్ ని ప్రాసెసర్ కి, ప్రాసెసర్ ని స్పీకర్ కి కనెక్ట్ చేయడం
        source.connect(noiseProcessor).connect(audioContext.destination);
        
        statusText.innerText = "మైక్రోఫోన్ ఆన్ అయ్యింది! హెడ్‌ఫోన్స్ పెట్టుకుని మాట్లాడండి.";
        learnNoiseBtn.disabled = false;
        startBtn.style.background = "#444";
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
        console.error("DSP Error:", err);
    }
};

learnNoiseBtn.onclick = () => {
    if (noiseProcessor) {
        noiseProcessor.port.postMessage('learn');
        statusText.innerText = "గది నాయిస్‌ని స్టడీ చేస్తున్నాను... 5 సెకన్లు నిశ్శబ్దంగా ఉండండి.";
        setTimeout(() => { 
            statusText.innerText = "నాయిస్ ప్రొఫైల్ సేవ్ అయ్యింది! ఇప్పుడు మీ వాయిస్ క్లీన్ గా వినిపిస్తుంది."; 
        }, 5000);
    }
};
