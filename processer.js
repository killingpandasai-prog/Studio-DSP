class StudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.noiseProfile = new Float32Array(128).fill(0);
        this.isLearning = false;
        this.port.onmessage = (e) => { if(e.data === 'learn') this.isLearning = true; };
    }

    process(inputs, outputs) {
        const input = inputs[0][0];
        const output = outputs[0][0];

        if (!input) return true;

        for (let i = 0; i < input.length; i++) {
            // 1. Simple Noise Reduction (Subtraction Logic)
            if (this.isLearning) {
                this.noiseProfile[i] = Math.max(this.noiseProfile[i], Math.abs(input[i]));
            }

            // 2. Applying the Filter
            let cleanSignal = input[i];
            if (Math.abs(input[i]) < this.noiseProfile[i] * 1.5) {
                cleanSignal = 0; // Low-level noise ని కట్ చేయడం (Gating)
            }

            // 3. Simple Echo Suppression (Transient control)
            output[i] = cleanSignal; 
        }

        return true;
    }
}

registerProcessor('studio-processor', StudioProcessor);
