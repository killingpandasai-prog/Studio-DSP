let audioContext;

const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        statusText.innerText = "మైక్రోఫోన్ కనెక్ట్ చేస్తున్నాను...";
        
        // 1. Audio Context స్టార్ట్ చేయడం
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 2. మైక్రోఫోన్ పర్మిషన్ అడగడం
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // 3. డైరెక్ట్ కనెక్షన్ (Mic -> Speaker)
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(audioContext.destination);
        
        statusText.innerText = "సక్సెస్! ఇప్పుడు మాట్లాడితే మీ వాయిస్ మీకే వినబడాలి.";
        statusText.style.color = "#00ff88";
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
        console.error(err);
    }
};
