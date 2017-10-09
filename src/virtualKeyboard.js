// const IDLE_VOICE = -1000;
export default class VirtualKeyboard {
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