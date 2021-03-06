import globals from "../../globalVariable.json";
declare var rolldices;

export class Dice {
    first:number;
    second:number;

    roll(playerNr, playerName){
        this.first = 1+this.getRandomInt(globals.DiceNumber);
        this.second = 1+this.getRandomInt(globals.DiceNumber);
        rolldices(this.first, this.second,playerNr,playerName);
    }
    total():number{
        return this.first + this.second;
    }
    isdouble():boolean{
        return this.first == this.second;
    }
    getRandomInt(max:number):number {
        return Math.floor(Math.random() * Math.floor(max));
    }
}