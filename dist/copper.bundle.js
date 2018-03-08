var Copper = (function () {
'use strict';

/**
 * voice向外暴露的变量，在voice内部，结构是不同的。
 * 
 */
class Voice {

    constructor (audioCtx, mainGain, options={}) {
        console.log('new!');
        this.audioCtx = audioCtx;
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
        // this._osc1.type = 'triangle';
        this._osc1.type = 'sawtooth';
        //6
        this._gainLfo.frequency.value = 1;
    
        // let attack = 0.1,
        //     decay = 1,
        //     sustain = 0.05,
        //     release = 10;
        this._ADSR = {
            attack : 0.02,
            decay : 1,
            sustain : 0.001,
            release : 10
        };

        this._ADSRGain.gain.setValueAtTime(0, audioCtx.currentTime + 0);
        // this._ADSRGain.gain.linearRampToValueAtTime(0, 0);
        this._ADSRGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + this._ADSR.attack);
        this._ADSRGain.gain.exponentialRampToValueAtTime(this._ADSR.sustain, audioCtx.currentTime + this._ADSR.attack + this._ADSR.decay);
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
    _stopAllOscs (releaseDuration) {
        this._gainLfo.stop(releaseDuration);
        this._osc1.stop(releaseDuration);
        this._osc2.stop(releaseDuration);
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
        this._ADSRGain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + this._ADSR.release);
        this._stopAllOscs(this._ADSR.release);
        console.log(`release: ${this._ADSR.release}`);
    }
}

// const IDLE_VOICE = -1000;
class VirtualKeyboard {
    constructor (maxAmount) {

        this.maxAmount = maxAmount;
        //按下且有效发出声音的键的数量
        this.downAmount = 0;
        //这个数组用布尔类型代表这max个voice谁正在被谁占用，位置代表voice，值代表num，IDLE_VOICE代表空闲
        // this._voiceNumMap = new Array(maxAmount).fill(IDLE_VOICE);
    }

    /**
     * 判断是否已超出最大，超出则返回false
     * 
    */
    keyDown (num) {
        //如果这个num正在占用着voice(已经按下了)
        //如果按下且有效的数量已经跟max持平了，就什么都不做
        if(this.downAmount == this.maxAmount ) {
            return false;
        }
        //没有超出max
        this.downAmount += 1;
        return true;
        //在数组中找到不忙的，返回第一个的下标（findIndex)
        // let idleIndex = this._voiceNumMap.findIndex((value)=>{return value==IDLE_VOICE;});
        //现在它就忙了
        // this._voiceNumMap[idleIndex] = num;
        //返回它
        // return idleIndex;
    }

    keyUp (num) {
        this.downAmount -= 1;
        //找到抬起num对应的voice下标
        // let voiceIndex = this._voiceNumMap.indexOf(num);
        //标记为闲
        // this._voiceNumMap[voiceIndex] = IDLE_VOICE;
        // return voiceIndex;
    }
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const key2num = {
    'q': 0,
    'w': 2,
    'e': 4,
    'r': 5,
    't': 7,
    'y': 9,
    'u': 11,
    'i': 12,
    'o': 14,
    'p': 16,
    '[': 17,
    ']': 19,
    '2': 1,
    '3': 3,
    '5': 6,
    '6': 8,
    '7': 10,
    '9': 13,
    '0': 15,
    '=': 18,
    // 'Q': 0,
    // 'W': 2,
    // 'E': 4,
    // 'R': 5,
    // 'T': 7,
    // 'Y': 9,
    // 'U': 11,
    // 'I': 12,
    // 'O': 14,
    // 'P': 16,
    'a': -19,
    's': -17,
    'd': -15,
    'f': -13,
    'g': -12,
    'h': -10,
    'j': -8,
    'k': -7,
    'l': -5,
    ';': -3,
    '\'': -1

};

// function bindKeys(voices) {
//     document.onkeydown = function(keyboardEvent) {
//         let num = key2num[keyboardEvent.key];
//         if(num == undefined) {
//             return;
//         }
//         console.log(keyboardEvent.keyCode);

//         //找闲的voice的下标
//         let idleVoiceIndex = virtualKeyboard.keyDown(num);
//         if(idleVoiceIndex == -1) {
//             return;
//         }
//         //闲的voice发声
//         voices[idleVoiceIndex].noteOn(num);
//     };
//     document.onkeyup = function(keyboardEvent) {
//         let num = key2num[keyboardEvent.key];
//         let voiceIndex = virtualKeyboard.keyUp(num);
//         voices[voiceIndex].noteOff();
//         console.log(`off {voiceIndex}`);
//     };
// }

/**
 * Copper的合成器参数
 * osc
 */
class Copper {
    constructor () {
        //为了防止外部掉用函数导致函数内this不是copper
        const copper = this;
        /* 合成器向外暴露的参数 */
        this.synth = {
            osc1: {
                set type (val) {
                    //1.新创建的voice的数据
                    //2.当前voice要挨个更改
                    for(let i in copper._numVoiceMap) {
                        copper._numVoiceMap[i].type = val;
                    }
                }
            }
            , osc2: {
                type: 'sine',
            }
            , set mix (val) {
                // for(let i in copper._numVoiceMap) {
                //     copper._numVoiceMap[i].type = value;
                // }
            }
            , set lfo (val) {
                for(let i in copper._numVoiceMap) {
                    copper._numVoiceMap[i]._gainLfo.value = val;
                    console.log(copper._numVoiceMap[i]._gainLfo.value);
                }
            }
            , filter: {
                set cutOff (val) {
                    for(let i in copper._numVoiceMap) {
                        copper._numVoiceMap[i]._biquadFilter.frequency.value = val;
                    }
                },
                lfo: 0.1
            }
            , adsr: {
                attack: 0.3,
                decay: 0.5,
                sustain: 0.6,
                retain: 1
            }
            , mainGain: 1
            , reverb: 10
            // , set [synthProp](val) {
            // }

        };

        
        //voice 的数量
        this.voiceAmount = 5;

        //TODO 怎样保护以下这些不想暴露给用户的变量呢
        this._mainGain = audioCtx.createGain();
        this._mainGain.connect(audioCtx.destination);

        //一开始创建默认数量个voice
        // this._voices = new Array(this.voices).fill(null).map((value)=>{
        //     return new Voice(audioCtx, this._mainGain)
        // });
        //虚拟键盘
        this.virtualKeyboard = new VirtualKeyboard(this.voiceAmount);
        //暂存在场voices
        this._numVoiceMap = {};


        //TODO 要给this.osc1.type搞个set。难道要给所有的属性都搞个set？
        //set的时候，写入this.options，new voice的时候传入。
    }

    /*
        将键盘事件与此copper绑定
    */
    bindKeyboard () {
        
        //因为如果不用变量保存copper的话，之后在回调函数里this就不是copper了，就拿不到copper了
        let copper = this;
        
        document.onkeydown = function(keyboardEvent) {
            let num = key2num[keyboardEvent.key];
            //是否已经被按下 是否已满max 是否是有声键，这三个都要判断且不通过的频率由高到低
            //效率重要，但是保持正确是原则。所以还是应该注意顺序的正确性
            if(Object.keys(copper._numVoiceMap).includes(`${num}`) || num == undefined) {
                return;
            }
            let notFull = copper.virtualKeyboard.keyDown(num);
            if(!notFull) {
                return;
            }
            //通过则new voice
            //TODO copper.options 里是要传入新改变的参数
            let voice = new Voice(audioCtx, copper._mainGain, copper.options);
            //记录map
            copper._numVoiceMap[num] = voice;
            //发声
            voice.noteOn(num);
        };
        document.onkeyup = function(keyboardEvent) {
            let num = key2num[keyboardEvent.key];
            if(num == undefined) {
                return;
            }
            copper.virtualKeyboard.keyUp();
            // let voiceIndex = ;
            copper._numVoiceMap[num].noteOff();
            //踢出去
            delete copper._numVoiceMap[num];
        };
    }

    set (prop, value) {
        for(let i in this._numVoiceMap) {
            this._numVoiceMap[i][prop] = value;
        }
    }
}

//add a dev version text here.

return Copper;

}());
