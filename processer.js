class StudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.noiseProfile = new Float32Array(128).fill(0);
        this.isLearning = false;
        this.learnCount = 0;

        this.port.onmessage = (e) => {
            if (e.data === 'learn') {
                this.isLearning = true;
                this.learnCount = 0;
            }
        };
    }

    process(inputs, outputs) {
        const input = inputs[0][0];
        const output = outputs[0][0];

        if (!input || !output) return true;

        for (let i = 0; i < input.length; i++) {
            let sample = input[i];

            // 1. Learning Phase: నాయిస్ లెవల్స్ ని సేవ్ చేయడం
            if (this.isLearning) {
                this.noiseProfile[i] = Math.max(this.noiseProfile[i], Math.abs(sample));
                this.learnCount++;
                if (this.learnCount > 20000) this.isLearning = false; // 5 సెకన్ల తర్వాత ఆగిపోతుంది
            }

            // 2. Simple Noise Gate: నాయిస్ ప్రొఫైల్ కంటే తక్కువ ఉన్న శబ్దాన్ని కట్ చేయడం
            let cleanSample = sample;
            let threshold = this.noiseProfile[i] * 1.5; 
            
            if (Math.abs(sample) < threshold) {
                cleanSample *= 0.1; // నాయిస్ ని బాగా తగ్గించడం
            }

            output[i] = cleanSample; 
        }

        return true;
    }
}

registerProcessor('studio-processor', StudioProcessor);
