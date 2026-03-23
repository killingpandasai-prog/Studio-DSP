let audioContext;
let noiseProcessor;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
        });
        
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);

        // --- ముఖ్యమైన మార్పు: Processor కోడ్ ని ఇక్కడే String లాగా రాస్తున్నాం ---
        const processorCode = `
            class StudioProcessor extends AudioWorkletProcessor {
                constructor() {
                    super();
                    this.noiseFloor = 0.005;
                    this.isLearning = false;
                    this.port.onmessage = (e) => { if(e.data === 'learn') this.isLearning = true; };
                }
                process(inputs, outputs) {
                    const input = inputs[0][0];
                    const output = outputs[0][0];
                    if (!input || !output) return true;
                    for (let i = 0; i < input.length; i++) {
                        let sample = input[i];
                        if (this.isLearning) {
                            this.noiseFloor = Math.max(this.noiseFloor, Math.abs(sample) * 1.5);
                            setTimeout(() => { this.isLearning = false; }, 5000);
                        }
                        output[i] = Math.abs(sample) < this.noiseFloor ? sample * 0.1 : sample;
                    }
                    return true;
                }
            }
            registerProcessor('studio-processor', StudioProcessor);
        `;

        // కోడ్ ని Blob కింద మార్చి బ్రౌజర్ కి ఇవ్వడం
        const blob = new Blob([processorCode], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(blob);
        
        statusText.innerText = "DSP బ్రెయిన్ లోడ్ అవుతోంది...";
        await audioContext.audioWorklet.addModule(moduleUrl);
        
        noiseProcessor = new AudioWorkletNode(audioContext, 'studio-processor');
        source.connect(noiseProcessor).connect(audioContext.destination);
        
        statusText.innerText = "సక్సెస్! ఇప్పుడు మాట్లాడండి.";
        learnNoiseBtn.disabled = false;
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
    }
};

learnNoiseBtn.onclick = () => {
    if (noiseProcessor) {
        noiseProcessor.port.postMessage('learn');
        statusText.innerText = "5 సెకన్లు నిశ్శబ్దంగా ఉండండి (నాయిస్ స్టడీ చేస్తున్నాను)...";
    }
};
