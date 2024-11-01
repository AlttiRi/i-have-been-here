import {PingPonging} from "@/common/message-center";

export function initPingPonging(): void {
    PingPonging.addListener(function pong(): true {
        return true;
    });
}
