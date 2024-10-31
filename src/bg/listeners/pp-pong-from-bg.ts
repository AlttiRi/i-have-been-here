import {PingPonging} from "@/common/message-center";

export function initPP_PongFromBG(): void {
    PingPonging.addListener(function pong(): true {
        return true;
    });
}
