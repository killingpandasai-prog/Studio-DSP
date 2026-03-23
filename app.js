let audioContext;
let noiseProcessor;

const startBtn = document.getElementById('startBtn');
const learnNoiseBtn = document.getElementById('learnNoiseBtn');
const statusText = document.getElementById('statusText');

startBtn.onclick = async () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
        });
        
        if (audioContext.state === 'suspended') await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);

        // --- Inline Processor with feedback ---
        const processorCode = `
            class StudioProcessor extends AudioWorkletProcessor {
                constructor() {
                    super();
                    this.noiseFloor = 0.002;
                    this.isLearning = false;
                    this.samplesSeen = 0;
                    this.port.onmessage = (e) => { 
                        if(e.data === 'learn') {
                            this.isLearning = true;
                            this.samplesSeen = 0;
                            this.noiseFloor = 0;
                        }
                    };
                }
                process(inputs, outputs) {
                    const input = inputs[0][0];
                    const output = outputs[0][0];
                    if (!input || !output) return true;

                    for (let i = 0; i < input.length; i++) {
                        let sample = input[i];
                        if (this.isLearning) {
                            this.noiseFloor = Math.max(this.noiseFloor, Math.abs(sample) * 1.8);
                            this.samplesSeen++;
                            // సుమారు 5 సెకన్ల తర్వాత (44100 sample rate వద్ద)
                            if (this.samplesSeen > 220000) {
                                this.isLearning = false;
                                this.port.postMessage('learned');
                            }
                        }
                        // Noise Gating Logic
                        output[i] = Math.abs(sample) < this.noiseFloor ? sample * 0.05 : sample;
                    }
                    return true;
                }
            }
            registerProcessor('studio-processor', StudioProcessor);
        `;

        const blob = new Blob([processorCode], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(blob);
        await audioContext.audioWorklet.addModule(moduleUrl);
        
        noiseProcessor = new AudioWorkletNode(audioContext, 'studio-processor');
        
        // ప్రాసెసర్ నుండి మెసేజ్ వస్తే స్టేటస్ అప్‌డేట్ చేయడం
        noiseProcessor.port.onmessage = (e) => {
            if(e.data === 'learned') {
                statusText.innerText = "నాయిస్ ప్రొఫైల్ సెట్ అయ్యింది! ఇప్పుడు మాట్లాడండి.";
                statusText.style.color = "#00ff88";
            }
        };

        source.connect(noiseProcessor).connect(audioContext.destination);
        
        statusText.innerText = "మైక్రోఫోన్ లైవ్ లో ఉంది! వాయిస్ వినిపిస్తుందా?";
        learnNoiseBtn.disabled = false;
        startBtn.disabled = true;

    } catch (err) {
        statusText.innerText = "Error: " + err.message;
    }
};

learnNoiseBtn.onclick = () => {
    if (noiseProcessor) {
        noiseProcessor.port.postMessage('learn');
        statusText.innerText = "నిశ్శబ్దంగా ఉండండి... గది నాయిస్‌ని గుర్తిస్తున్నాను...";
        statusText.style.color = "#ffcc00";
    }
};
