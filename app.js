let audioCtx;
let source;
let filter;

const startBtn = document.getElementById('startBtn');
const filterBtn = document.getElementById('filterBtn');
const status = document.getElementById('status');

startBtn.onclick = async () => {
    try {
        // 1. Audio Context ని సెట్ చేయడం
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // 2. మైక్రోఫోన్ యాక్సెస్ - కచ్చితంగా హెడ్‌ఫోన్స్ వాడండి
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true } 
        });

        source = audioCtx.createMediaStreamSource(stream);
        
        // 3. నాయిస్ ఫిల్టర్ (Low Pass) - ఇది గాలి శబ్దాన్ని ఆపుతుంది
        filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 15000; // మొదట ఫుల్ సౌండ్ రానిద్దాం

        // Connection: Mic -> Filter -> Speaker
        source.connect(filter).connect(audioCtx.destination);

        status.innerText = "మైక్రోఫోన్ పని చేస్తోంది! (హెడ్‌ఫోన్స్ వాడండి)";
        startBtn.disabled = true;
        filterBtn.disabled = false;
        
    } catch (err) {
        status.innerText = "Error: " + err.message;
    }
};

filterBtn.onclick = () => {
    // బటన్ నొక్కగానే 3000Hz కంటే ఎక్కువ ఉన్న నాయిస్ ని కట్ చేస్తుంది
    filter.frequency.setTargetAtTime(3000, audioCtx.currentTime, 0.1);
    status.innerText = "ఫిల్టర్ ఆన్ అయ్యింది - నాయిస్ తగ్గిందా?";
    status.style.color = "#00ff88";
};
