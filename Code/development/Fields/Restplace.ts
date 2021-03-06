import {Field} from "./Field";
import {Player} from "../Player"

export class Restplace implements Field{
    name: string;
    pot:number;
    owner:Player;
    initialPrice:number = 0;

    constructor() {
        this.name = "Restplace";
        this.pot = 0;
    }

    Event(player: Player,playerList:Player[]): void {
        player.recieveMoney(this.pot);
        this.pot = 0;
    }

    addToPot(amount:number):void{
        if(amount > 0){
           this.pot += amount;
        }
    }
    CanBuy(player: Player): boolean {
        return false;
    }

}