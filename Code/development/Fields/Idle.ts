import {Field} from "./Field";
import {Player} from "../Player";


export class Idle implements Field{
    initialPrice: number;
    name: string;
    owner: Player | undefined;

    CanBuy(player: Player): boolean {
        return false;
    }

    Event(player: Player, playerList: Player[]): void {
    }

}