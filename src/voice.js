export default class Voice {
    constructor (audioCtx, mainGain, options={}) {
        console.log('new!');
        /* create */
        this._biquadFilter = audioCtx.createBiquadFilter();
    
        this._ADSRGain = audioCtx.createGain();
        this._lfoGain = audioCtx.createGain();
    
        this._gainLfo = audioCtx.createOscillator();
        this._filterLfo = audioCtx.createOscillator();
    
        //加圆括号则可以不声明而使用解构赋值
        ({osc: this._osc1, mixGain: this._mixGain1} = this._createOscs(audioCtx, this._biquadFilter));
        ({osc: this._osc2, mixGain: this._mixGain2} = this._createOscs(audioCtx, this._biquadFilter));
    
        /* connect */
        this._biquadFilter.connect(this._ADSRGain);
        this._ADSRGain.connect(this._lfoGain);
        this._lfoGain.connect(mainGain);
        this._gainLfo.connect(this._lfoGain.gain);
            
        /* set */
        this._biquadFilter.type = "lowpass";
        this._biquadFilter.frequency.value = 1000;
        this._biquadFilter.gain.value = 25;
        this._ADSRGain.gain.value = 10;
        // osc1.frequency.value = 600;
        this._osc2.frequency.value = 440;
        this._osc1.type = 'triangle';
        this._gainLfo.frequency.value = 6;
    
        let attack = 0.1,
            decay = 1,
            sustain = 0.05,
            release = 10;
        this._ADSRGain.gain.linearRampToValueAtTime(0, 0);
        this._ADSRGain.gain.linearRampToValueAtTime(2, attack);
        this._ADSRGain.gain.linearRampToValueAtTime(sustain, attack + decay);
        // ADSRGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime+release);
    
    }


    /**
         * 1.Create oscs,
         * 2.connect them to mixGain,
         * 3.connect them to filter
         * @param {*} audioCtx 
         * @param {*} biquadFilter 
    */
    _createOscs (audioCtx, biquadFilter) {
        /* create */
        let osc = audioCtx.createOscillator();
        let mixGain = audioCtx.createGain();

        /* connect */
        osc.connect(mixGain);
        mixGain.connect(biquadFilter);

        return {osc, mixGain};
    }

    _startAllOscs () {
        this._gainLfo.start();
        this._osc1.start();
        this._osc2.start();
    }
    _stopAllOscs () {
        this._gainLfo.stop();
        this._osc1.stop();
        this._osc2.stop();
    }

    noteOn (num) {
        /* set */
        //freq
        let f = 440*Math.pow(2, (num+3)/12);
        this._osc1.frequency.value = f;
        this._osc2.frequency.value = f;
        //ADSR
    
        /* log */
        console.log(f);
        /* start */
        this._startAllOscs();
    }
    noteOff () {
        this._stopAllOscs();
    }
}