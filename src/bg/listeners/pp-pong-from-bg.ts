import {PingPongBG} from "@/common/message-center";

export function initPP_PongFromBG(): void {
    PingPongBG.addListener(function pong(): true {
        return true;
    });
}
