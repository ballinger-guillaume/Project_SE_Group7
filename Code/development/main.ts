import {Player} from "./Player";
import {Auction} from "./Events/Auction";
import {PlayerSelection} from "./PlayerSelection";
import globals from "../globalVariable.json"
import {Restplace} from "./Fields/Restplace";
import {Mortage} from "./Events/mortage";
import {Properties} from "./Fields/Properties";
import {Colors} from "./Fields/colors";
import {BuyEvent} from "./Events/buying";
import {Bus} from "./Fields/Bus";
import {Parking} from "./Fields/Parking"
import {Field} from "./Fields/Field";
import {Dice} from "./Events/Dice";
import {Erasmus} from "./Fields/Erasmus";
import {Tax} from "./Fields/Tax"
import {EventField} from "./Fields/EventField";
import {QuizField} from "./Fields/QuizField";
import {Idle} from "./Fields/Idle";
import {GoToErasmus} from "./Fields/GoToErasmus";
import {RepayMortgage} from "./Events/RepayMortgage";
import {Trade} from "./Events/Trade";
import $ from "jquery";
import {Renovation} from "./Events/Renovation"
import propertiesFile from '../properties.json';
import {bigBoard} from './boardHtml';
import {mediumBoard} from './boardHtml';
import {smallBoard} from './boardHtml';
import {Quiz} from "./Events/quiz";
import {funFactButtons} from "./funfacts";
import {ModalWinning} from "./winingModal";

declare var fallingCoins;
declare var setBoardSize;

export class main {
    first: boolean = true;
    PlayerArray: Player[] = [];
    StaticPlayerArray: Player[] = [];
    dice: Dice = new Dice();
    WinCondition: number;
    RoundNumber: number;
    ReferencePlayer: Player;
    FieldArray: Field[];
    ConseqDoubles: number = 0;
    GameEnded: boolean = false;
    TurnEnded: boolean = false;
    language: string = "ENG";
    MaxNumberField: number;
    Erasmus: number;

    async main() {
        let p:Player = new Player(false,"",1,1, 40, 10);
        p.language = "ENG";
        bigBoard(this.language);
        this.buttonEvent();
        this.EndTurnButton();
        await this.InitializePlayers();
        funFactButtons(this.language);
        while (!this.GameEnded) {
            this.updateButtons(this.ReferencePlayer);
            funFactButtons(this.language);
            this.BotAction();
            await this.EndOfATurn();
            this.StaticPlayerArray.forEach(
                player => this.CheckWinCondition(player)
            )
            this.StaticPlayerArray.forEach((player) => {
                    this.CheckLooseCondition(player);

                }
            )
            console.log("Before next turn Ref player =" + this.ReferencePlayer.name);
            this.NextTurn();
            console.log("After next turn Ref player =" + this.ReferencePlayer.name);
            //check gameover for player and change value
            //checking makeplayerturn
            //puting surrender button and mechanics
            //check if the turn handling works fine
        }
    }

    async EndTurnButton() {
        let EndButton = $("#endTurnButton");
        let self = this;
        EndButton.click(function () {
            console.log("turn ended");
            self.TurnEnded = true;
        });
    }

    ShowPlayerMoney() {
        if(this.StaticPlayerArray.length == 0){
            this.StaticPlayerArray = this.PlayerArray.slice();
            this.PlayerArray.forEach(player => player.PlayerArray = this.StaticPlayerArray);
        }

        $("#player-1").text(this.StaticPlayerArray[0].name);
        $("#b-coins-1").text(this.StaticPlayerArray[0].Money);
        $("#player-1").css("background-color", this.StaticPlayerArray[0].Color);
        $("#player-2").text(this.StaticPlayerArray[1].name);
        $("#b-coins-2").text(this.StaticPlayerArray[1].Money);
        $("#player-2").css("background-color", this.StaticPlayerArray[1].Color);
        $("#player-3").text(this.StaticPlayerArray[2].name);
        $("#b-coins-3").text(this.StaticPlayerArray[2].Money);
        $("#player-3").css("background-color", this.StaticPlayerArray[2].Color);
        $("#player-4").text(this.StaticPlayerArray[3].name);
        $("#b-coins-4").text(this.StaticPlayerArray[3].Money);
        $("#player-4").css("background-color", this.StaticPlayerArray[3].Color);
    }

    //Will wait for a player to play its turn
    async EndOfATurn() {
        while (!this.TurnEnded && !this.ReferencePlayer.isGameOver) {
            await new Promise(r => setTimeout(r, 500));
            //console.log("waiting");
        }
    }

    InitializeQueue(): void {
        for (let i = 0; i < this.PlayerArray.length; i++) {
            this.dice.roll(this.PlayerArray[i].ReferenceNumber, this.PlayerArray[i].name);
            this.PlayerArray[i].queue = this.dice.total();
        }
        let n = this.PlayerArray.length;
        //Bubble Sort, if the queue number between two players is the same, it won't change on purpose
        for (let i = 0; i < n - 1; i++) {
            for (let y = 0; y < n - i - 1; y++) {
                if (this.PlayerArray[y].queue > this.PlayerArray[y + 1].queue) {
                    let temp = this.PlayerArray[y];
                    this.PlayerArray[y] = this.PlayerArray[y + 1];
                    this.PlayerArray[y + 1] = temp;
                }
            }
        }
        this.ShowPlayerMoney();
        this.ReferencePlayer = this.PlayerArray[0];
        $("#current-player").text(this.ReferencePlayer.name);
    }

    NextTurn(): void {
        let temp = this.PlayerArray[0];
        for (let i = 0; i < this.PlayerArray.length - 1; i++) {
            this.PlayerArray[i] = this.PlayerArray[i + 1];
        }
        this.PlayerArray[this.PlayerArray.length - 1] = temp;
        this.ReferencePlayer = this.PlayerArray[0];
        while(this.ReferencePlayer.isGameOver){
            temp = this.PlayerArray[0];
            for (let i = 0; i < this.PlayerArray.length - 1; i++) {
                this.PlayerArray[i] = this.PlayerArray[i + 1];
            }
            this.PlayerArray[this.PlayerArray.length - 1] = temp;
            this.ReferencePlayer = this.PlayerArray[0];
        }
        $("#current-player").text(this.ReferencePlayer.name);
        this.TurnEnded = false;
    }

    async BotActionTest() {
        let self = this;
        let erasmus = new Erasmus(this.Erasmus)
        if (this.ReferencePlayer.isBot) {
            let double: boolean = false;
            while ($("#rollButton").is(":visible")) {
                this.dice.roll(self.ReferencePlayer.ReferenceNumber, self.ReferencePlayer.name);
                double = this.dice.isdouble();
                this.ReferencePlayer.move(this.dice.total());
                await new Promise(r => setTimeout(r, this.dice.total() * 500 + 2000));
                if ($("#BuyingModal").is(":visible")) {
                    $("#Buy").click();
                    await new Promise(r => setTimeout(r, 2000));
                }
                if (double) {
                    if (this.ConseqDoubles >= 2) {
                        this.ReferencePlayer.goToErasmus()
                        this.ConseqDoubles = 0;
                    } else {
                        this.ConseqDoubles += 1;
                    }
                } else {
                    $("#rollButton").hide()
                    this.ConseqDoubles = 0;
                }

            }
            this.TurnEnded = true;
        }
    }

    async BotAction() {
        if (this.ReferencePlayer.isBot) {
            let self = this;
            let erasmus = new Erasmus(this.Erasmus)
            if (this.ReferencePlayer.TurnsInPrison > 0) {
                await new Promise(r => setTimeout(r, 1000));
                await erasmus.Event(this.ReferencePlayer, this.StaticPlayerArray);
                await new Promise(r => setTimeout(r, 2000));
                while ($("#startGameModal").is(":visible")) {
                    await new Promise(r => setTimeout(r, 100));
                }
                await new Promise(r => setTimeout(r, 1000));
            }
            while ($("#rollButton").is(":visible") || this.ReferencePlayer.stillMovingBot) {
                let double: boolean = false;
                //This is if is the normal handeling of the move/event
                //The else is the handeling of when the bot is moving because of the reward it gets in the quizz
                if (!this.ReferencePlayer.stillMovingBot) {
                    this.dice.roll(this.ReferencePlayer.ReferenceNumber, this.ReferencePlayer.name);
                    double = this.dice.isdouble();
                    if (double) {
                        if (this.ConseqDoubles >= 2) {
                            $("#rollButton").hide();
                            let movment: number;
                            if (this.ReferencePlayer.currentposition > 10) {
                                movment = (this.MaxNumberField / 4) + (this.MaxNumberField - this.ReferencePlayer.currentposition);
                                this.ReferencePlayer.move(movment);
                                await new Promise(r => setTimeout(r, movment * 500 + 2000));
                            } else if (this.ReferencePlayer.currentposition <= 10) {
                                movment = (this.MaxNumberField / 4) - this.ReferencePlayer.currentposition;
                                this.ReferencePlayer.move(movment);
                                await new Promise(r => setTimeout(r, movment * 500 + 2000));
                            }
                            this.ReferencePlayer.TurnsInPrison = 1;
                            this.ConseqDoubles = 0;
                            while ($("#startGameModal").is(":visible")) {
                                await new Promise(r => setTimeout(r, 100));
                            }
                        } else {
                            this.ReferencePlayer.move(this.dice.total());
                            this.ConseqDoubles += 1;
                            await new Promise(r => setTimeout(r, this.dice.total() * 500 + 2000));
                        }
                    } else {
                        this.ReferencePlayer.move(this.dice.total());
                        $("#rollButton").hide()
                        this.ConseqDoubles = 0;
                        await new Promise(r => setTimeout(r, this.dice.total() * 500 + 2000));
                    }
                    if (this.ReferencePlayer.currentposition == (this.MaxNumberField * 0.75)) {
                        await new Promise(r => setTimeout(r, 20 * 500 + 2000));
                    }
                } else {
                    await new Promise(r => setTimeout(r, 3000));
                    this.ReferencePlayer.move(this.ReferencePlayer.nrOfMove);
                    await new Promise(r => setTimeout(r, this.ReferencePlayer.nrOfMove * 500 + 2000));
                    this.ReferencePlayer.nrOfMove = 0;
                    this.ReferencePlayer.stillMovingBot = false;
                }
                await new Promise(r => setTimeout(r, 500));
                //Buy and Auction handeling, basic chance for a bot to buy for some money conditions, some conditions could be added
                if ($("#BuyingModal").is(":visible")) {
                    let fieldprice = this.FieldArray[this.ReferencePlayer.currentposition].initialPrice;
                    let rand = this.dice.getRandomInt(10);
                    if (this.ReferencePlayer.botDifficulty == 0) {
                        if ((this.ReferencePlayer.Money / 2) > fieldprice) {
                            if ((fieldprice * 4) < this.ReferencePlayer.Money) {
                                if (rand > 1) {
                                    $("#Buy").click();
                                } else {
                                    this.ReferencePlayer.inAuctionBot = true;
                                    this.ReferencePlayer.AuctionEntry = true;
                                    $("#Auction").click();
                                    while (this.ReferencePlayer.inAuctionBot) {
                                        await new Promise(r => setTimeout(r, 100));
                                    }
                                }
                            } else if ((fieldprice * 2) < this.ReferencePlayer.Money) {
                                if (rand > 3) {
                                    $("#Buy").click();
                                } else {
                                    this.ReferencePlayer.inAuctionBot = true;
                                    this.ReferencePlayer.AuctionEntry = true;
                                    $("#Auction").click();
                                    while (this.ReferencePlayer.inAuctionBot) {
                                        await new Promise(r => setTimeout(r, 100));
                                    }
                                }
                            }
                        } else {
                            this.ReferencePlayer.inAuctionBot = true;
                            this.ReferencePlayer.AuctionEntry = true;
                            $("#Auction").click();
                            while (this.ReferencePlayer.inAuctionBot) {
                                await new Promise(r => setTimeout(r, 100));
                            }
                        }
                    } else if (this.ReferencePlayer.botDifficulty == 1) {
                        let needtobuy = false;
                        for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                            if ((this.ReferencePlayer.fieldsOwned[i].color == this.FieldArray[this.ReferencePlayer.currentposition].color)) {
                                needtobuy = true;
                                break;
                            }
                        }
                        //Try to create a more intelligent behaviour
                        //Makes him always buy a field if he has enough money and he had a field of the same color
                        if ((this.ReferencePlayer.Money * 0.9) > fieldprice && needtobuy) {
                            $("#Buy").click();
                        } else if ((this.ReferencePlayer.currentposition > 0) && (this.ReferencePlayer.currentposition < this.MaxNumberField / 2)) {
                            if ((this.ReferencePlayer.Money / 4) > fieldprice) {
                                if (rand > 1) {
                                    $("#Buy").click();
                                } else {
                                    this.ReferencePlayer.inAuctionBot = true;
                                    this.ReferencePlayer.AuctionEntry = true;
                                    $("#Auction").click();
                                    while (this.ReferencePlayer.inAuctionBot) {
                                        await new Promise(r => setTimeout(r, 100));
                                    }
                                }
                            } else if ((this.ReferencePlayer.Money / 2) > fieldprice) {
                                if (rand > 3) {
                                    $("#Buy").click();
                                } else {
                                    this.ReferencePlayer.inAuctionBot = true;
                                    this.ReferencePlayer.AuctionEntry = true;
                                    $("#Auction").click();
                                    while (this.ReferencePlayer.inAuctionBot) {
                                        await new Promise(r => setTimeout(r, 100));
                                    }
                                }
                            }
                        } else if ((this.ReferencePlayer.Money / 4) > fieldprice) {
                            if (rand > 2) {
                                $("#Buy").click();
                            } else {
                                this.ReferencePlayer.inAuctionBot = true;
                                this.ReferencePlayer.AuctionEntry = true;
                                $("#Auction").click();
                                while (this.ReferencePlayer.inAuctionBot) {
                                    await new Promise(r => setTimeout(r, 100));
                                }
                            }
                        } else if ((this.ReferencePlayer.Money / 2) > fieldprice) {
                            if (rand > 5) {
                                $("#Buy").click();
                            } else {
                                this.ReferencePlayer.inAuctionBot = true;
                                this.ReferencePlayer.AuctionEntry = true;
                                $("#Auction").click();
                                while (this.ReferencePlayer.inAuctionBot) {
                                    await new Promise(r => setTimeout(r, 100));
                                }
                            }
                        } else {
                            this.ReferencePlayer.inAuctionBot = true;
                            this.ReferencePlayer.AuctionEntry = true;
                            $("#Auction").click();
                            while (this.ReferencePlayer.inAuctionBot) {
                                await new Promise(r => setTimeout(r, 100));
                            }
                        }
                    }

                    await new Promise(r => setTimeout(r, 2000));
                } else if ($("#QuestionModal").is(":visible")) {
                    let sizeAnswerPool = 0;
                    for (let i = 0; i < 4; i++) {
                        let str: string = "#Answer" + (i + 1).toString();
                        if ($(str).text() != "") {
                            sizeAnswerPool += 1;
                        }
                    }
                    // @ts-ignore
                    document.getElementById("Answer1").disabled = true;
                    // @ts-ignore
                    document.getElementById("Answer2").disabled = true;
                    // @ts-ignore
                    document.getElementById("Answer3").disabled = true;
                    // @ts-ignore
                    document.getElementById("Answer4").disabled = true;
                    await new Promise(r => setTimeout(r, 3000));
                    // @ts-ignore
                    document.getElementById("Answer1").disabled = false;
                    // @ts-ignore
                    document.getElementById("Answer2").disabled = false;
                    // @ts-ignore
                    document.getElementById("Answer3").disabled = false;
                    // @ts-ignore
                    document.getElementById("Answer4").disabled = false;
                    if (sizeAnswerPool == 2) {
                        let randChoice = self.dice.getRandomInt(2);
                        (randChoice == 1) ? $("#Answer2").click() : $("#Answer1").click();
                    } else if (sizeAnswerPool == 3) {
                        let randChoice = self.dice.getRandomInt(3);
                        (randChoice == 2) ? $("#Answer3").click() : (randChoice == 1) ? $("#Answer2").click() : $("#Answer1").click();
                    } else {
                        let randChoice = self.dice.getRandomInt(4);
                        (randChoice == 3) ? $("#Answer4").click() : (randChoice == 2) ? $("#Answer3").click() : (randChoice == 1) ? $("#Answer2").click() : $("#Answer1").click();
                    }
                    console.log("is waiting");
                    await new Promise(r => setTimeout(r, 2000));
                }
                //Might rework later for better optimisation
                if ($("#MorageModal").is(":visible")) {
                    let MoneyPool = 0;
                    for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                        //This part handle the first building to come until the moneypool is superior to 0
                        if (this.ReferencePlayer.botDifficulty == 0) {
                            if (!this.ReferencePlayer.fieldsOwned[i].isMortgage) {
                                MoneyPool += this.ReferencePlayer.fieldsOwned[i].initialPrice;
                                let str: string = "#Removebutton" + (i).toString();
                                $(str).click();
                            }
                        } else if (this.ReferencePlayer.botDifficulty == 1) {
                            //This part is to firstly handle fields between 20 and 39 for botdiff advanced
                            for (let y = 0; y < this.FieldArray.length; y++) {
                                if ((this.ReferencePlayer.fieldsOwned[i] == this.FieldArray[y]) && (y > this.MaxNumberField / 2) && (y <= this.MaxNumberField - 1) && (!this.ReferencePlayer.fieldsOwned[i].isMortgage)) {
                                    MoneyPool += this.ReferencePlayer.fieldsOwned[i].initialPrice;
                                    let str: string = "#Removebutton" + (i).toString();
                                    //Already handled in mortgage event, but need to set true for next for loop
                                    this.ReferencePlayer.fieldsOwned[i].isMortgage = true;
                                    $(str).click();
                                    break;
                                }
                            }
                        }
                        if ((this.ReferencePlayer.Money + MoneyPool) > 0) {
                            let total = this.ReferencePlayer.Money + MoneyPool;
                            break;
                        }
                    }
                    //For advanced bot if he can't mortgage between 20 and 39
                    if ((this.ReferencePlayer.botDifficulty == 1) && ((this.ReferencePlayer.Money + MoneyPool) < 0)) {
                        for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                            if (!this.ReferencePlayer.fieldsOwned[i].isMortgage) {
                                MoneyPool += this.ReferencePlayer.fieldsOwned[i].initialPrice;
                                let str: string = "#Removebutton" + (i).toString();
                                $(str).click();
                            }
                            if ((this.ReferencePlayer.Money + MoneyPool) > 0) {
                                break;
                            }
                        }
                    }


                    await new Promise(r => setTimeout(r, 2000));
                    $("#ApproveButtonMortgage").click();

                }
                //Trade handeling, will buy if a player has a building the same color as one of his
                if (this.ReferencePlayer.botDifficulty == 1 && this.ReferencePlayer.lastTimeTradeAsked == 0 && this.ReferencePlayer.Money >= 400) {
                    let choosedPlayer = false;
                    this.ReferencePlayer.fieldsOwned.forEach(field => {
                        let playercounter = 0;
                        this.PlayerArray.forEach(async player => {
                            if (this.ReferencePlayer != player && !player.isGameOver && !choosedPlayer) {
                                playercounter++;

                                for (let i = 0; i < player.fieldsOwned.length; i++) {
                                    let fieldtarg = player.fieldsOwned[i];
                                    if (field.color == fieldtarg.color && this.ReferencePlayer != player) {
                                        choosedPlayer = true;
                                        this.ReferencePlayer.lastTimeTradeAsked = 5;
                                        this.ReferencePlayer.botInTrade = true;
                                        $("#tradeButton").click();
                                        await new Promise(r => setTimeout(r, 1000));
                                        let newstr = "#targetButton" + playercounter;
                                        $(newstr).click();
                                        await new Promise(r => setTimeout(r, 1000));
                                        let str: string = "#4tradingButton" + i;
                                        $(str).click();
                                        let amount: string = String(fieldtarg.initialPrice);
                                        $("#inputLable1").html(amount);
                                        if (player.isBot) {
                                            $("#approveButtonTrading").click();
                                        } else {
                                            await new Promise(r => setTimeout(r, 10000));
                                            $(".close").click();
                                        }
                                        await new Promise(r => setTimeout(r, 1000));
                                    }
                                }
                            }
                        })

                    })
                }
                while (this.ReferencePlayer.botInTrade) {
                    await new Promise(r => setTimeout(r, 500));
                }
                if (this.ReferencePlayer.lastTimeTradeAsked > 0) {
                    this.ReferencePlayer.lastTimeTradeAsked--;
                }
                if ($("#repayMortgageButton").is(":visible")) {
                    let i = 0;
                    let RefMoney = this.ReferencePlayer.Money;
                    await new Promise(r => setTimeout(r, 2000));
                    while ((RefMoney > 1000) && (i < this.ReferencePlayer.fieldsOwned.length)) {
                        $("#repayMortgageButton").click();
                        if (this.ReferencePlayer.fieldsOwned[i].isMortgage) {
                            RefMoney -= this.ReferencePlayer.fieldsOwned[i].initialPrice;
                            let str = "#paybuttonRepayMortgage" + i;
                            $(str).click();
                            await new Promise(r => setTimeout(r, 2000));
                        }
                        i++;
                    }
                    $("#ApproveButtonMortgage").click();
                }
                //2 difficulties for setmortgage and renovations
                //Behaviour for advanced bot in renovations -> randomly chose what bot will pay, can pay less or more than standard bot
                //Behaviour for advanced bot in setMortgage -> bot is way more insecure about money, can be tempted to mortgage at 700 and even at 1000
                if ($("#RenovationsButton").is(":visible")) {
                    await new Promise(r => setTimeout(r, 2000));
                    if (this.ReferencePlayer.Money <= 800) {
                        if (this.ReferencePlayer.botDifficulty == 0 && this.ReferencePlayer.Money <= 500) {
                            $("#RenovationsButton").click();
                            let buildToMove;
                            let compared;
                            for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                if ((!this.ReferencePlayer.fieldsOwned[i].isMortgage) && (this.ReferencePlayer.fieldsOwned[i].hasAll)) {
                                    if (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != undefined) {
                                        this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount = 0;
                                    }
                                    compared = this.ReferencePlayer.fieldsOwned[i];
                                }
                            }
                            for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                // @ts-ignore
                                if ((!this.ReferencePlayer.fieldsOwned[i].isMortgage) && (this.ReferencePlayer.fieldsOwned[i].hasAll) && (this.ReferencePlayer.fieldsOwned[i] != compared) && (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount >= compared.renovatiosAmmount)) {
                                    buildToMove = i;
                                }
                            }
                            await new Promise(r => setTimeout(r, 2000));
                            let str: string = "#Removebutton" + buildToMove;
                            $(str).click();
                            await new Promise(r => setTimeout(r, 2000));
                            $("#ApproveButtonMortgage").click();
                        } else if (this.ReferencePlayer.botDifficulty == 1) {
                            if (this.ReferencePlayer.Money <= 400) {
                                if ((this.dice.getRandomInt(10)) > 0) {
                                    $("#RenovationsButton").click();
                                    let buildToMove;
                                    let compared;
                                    for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                        if (!this.ReferencePlayer.fieldsOwned[i].isMortgage && (this.ReferencePlayer.fieldsOwned[i].hasAll)) {
                                            if (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != undefined) {
                                                this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount = 0;
                                            }
                                            compared = this.ReferencePlayer.fieldsOwned[i];
                                        }
                                    }
                                    for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                        // @ts-ignore
                                        if ((!this.ReferencePlayer.fieldsOwned[i].isMortgage) && (this.ReferencePlayer.fieldsOwned[i].hasAll) && (this.ReferencePlayer.fieldsOwned[i] != compared) && (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount >= compared.renovatiosAmmount)) {
                                            buildToMove = i;
                                        }
                                    }
                                    await new Promise(r => setTimeout(r, 2000));
                                    let str: string = "#Removebutton" + buildToMove;
                                    $(str).click();
                                    await new Promise(r => setTimeout(r, 2000));
                                    $("#ApproveButtonMortgage").click();
                                }
                            } else if (this.ReferencePlayer.Money <= 600) {
                                if ((this.dice.getRandomInt(10)) > 4) {
                                    $("#RenovationsButton").click();
                                    let buildToMove;
                                    let compared;
                                    for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                        if (!this.ReferencePlayer.fieldsOwned[i].isMortgage && (this.ReferencePlayer.fieldsOwned[i].hasAll)) {
                                            if (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != undefined) {
                                                this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount = 0;
                                            }
                                            compared = this.ReferencePlayer.fieldsOwned[i];
                                        }
                                    }
                                    for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                        // @ts-ignore
                                        if ((!this.ReferencePlayer.fieldsOwned[i].isMortgage) && (this.ReferencePlayer.fieldsOwned[i].hasAll) && (this.ReferencePlayer.fieldsOwned[i] != compared) && (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount >= compared.renovatiosAmmount)) {
                                            buildToMove = i;
                                        }
                                    }
                                    await new Promise(r => setTimeout(r, 2000));
                                    let str: string = "#Removebutton" + buildToMove;
                                    $(str).click();
                                    await new Promise(r => setTimeout(r, 2000));
                                    $("#ApproveButtonMortgage").click();
                                }
                            } else if (this.ReferencePlayer.Money <= 800) {
                                if ((this.dice.getRandomInt(10)) > 8) {
                                    $("#RenovationsButton").click();
                                    let buildToMove;
                                    let compared;
                                    for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                        if (!this.ReferencePlayer.fieldsOwned[i].isMortgage && (this.ReferencePlayer.fieldsOwned[i].hasAll)) {
                                            if (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != undefined) {
                                                this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount = 0;
                                            }
                                            compared = this.ReferencePlayer.fieldsOwned[i];
                                        }
                                    }
                                    for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                        // @ts-ignore
                                        if ((!this.ReferencePlayer.fieldsOwned[i].isMortgage) && (this.ReferencePlayer.fieldsOwned[i].hasAll) && (this.ReferencePlayer.fieldsOwned[i] != compared) && (this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount >= compared.renovatiosAmmount)) {
                                            buildToMove = i;
                                        }
                                    }
                                    await new Promise(r => setTimeout(r, 2000));
                                    let str: string = "#Removebutton" + buildToMove;
                                    $(str).click();
                                    await new Promise(r => setTimeout(r, 2000));
                                    $("#ApproveButtonMortgage").click();
                                }
                            }
                        }
                        await new Promise(r => setTimeout(r, 2000));
                    } else if (this.ReferencePlayer.Money >= 1000) {
                        await new Promise(r => setTimeout(r, 2000));
                        let total = 0;
                        while (total <= 100 && this.ReferencePlayer.botDifficulty == 0 && this.ReferencePlayer.Money >= 1000) {
                            for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                if (this.ReferencePlayer.fieldsOwned[i].hasAll && total <= 100 && this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != 5) {
                                    await new Promise(r => setTimeout(r, 1000));
                                    $("#RenovationsButton").click();
                                    await new Promise(r => setTimeout(r, 2000));
                                    //Decide which building to upgrade
                                    let buildToUpgrade = this.ReferencePlayer.fieldsOwned[i];
                                    let y;
                                    for (y = 0; y < this.ReferencePlayer.fieldsOwned.length; y++) {
                                        // @ts-ignore
                                        if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[y].color) && (y != i) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount)) {
                                            let z;
                                            for (z = 0; z < this.ReferencePlayer.fieldsOwned.length; z++) {
                                                // @ts-ignore
                                                if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[z].color) && (z != i) && (z != y) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount) && (this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount)) {
                                                    y = z;
                                                    break;
                                                }
                                            }
                                            buildToUpgrade = this.ReferencePlayer.fieldsOwned[y];
                                            break;
                                        }
                                    }
                                    if (buildToUpgrade == this.ReferencePlayer.fieldsOwned[i]) {
                                        y = i;
                                    }
                                    let str = "#Addbutton" + y;
                                    $(str).click();
                                    // @ts-ignore
                                    total += this.ReferencePlayer.fieldsOwned[i].renovationscosts;
                                    await new Promise(r => setTimeout(r, 2000));
                                    $("#ApproveButtonMortgage").click();
                                    break;
                                }
                            }
                        }

                        let rand = this.dice.getRandomInt(10);
                        if (rand > 1) {
                            while (total <= 50 && this.ReferencePlayer.botDifficulty == 1 && this.ReferencePlayer.Money >= 1000) {
                                for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                    if (this.ReferencePlayer.fieldsOwned[i].hasAll && this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != 5) {
                                        await new Promise(r => setTimeout(r, 1000));
                                        $("#RenovationsButton").click();
                                        await new Promise(r => setTimeout(r, 2000));
                                        //Decide which building to upgrade
                                        let buildToUpgrade = this.ReferencePlayer.fieldsOwned[i];
                                        let y;
                                        for (y = 0; y < this.ReferencePlayer.fieldsOwned.length; y++) {
                                            // @ts-ignore
                                            if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[y].color) && (y != i) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount)) {
                                                let z;
                                                for (z = 0; z < this.ReferencePlayer.fieldsOwned.length; z++) {
                                                    // @ts-ignore
                                                    if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[z].color) && (z != i) && (z != y) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount) && (this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount)) {
                                                        y = z;
                                                        break;
                                                    }
                                                }
                                                buildToUpgrade = this.ReferencePlayer.fieldsOwned[y];
                                                break;
                                            }
                                        }
                                        if (buildToUpgrade == this.ReferencePlayer.fieldsOwned[i]) {
                                            y = i;
                                        }
                                        let str = "#Addbutton" + y;
                                        $(str).click();
                                        // @ts-ignore
                                        total += this.ReferencePlayer.fieldsOwned[i].renovationscosts;
                                        await new Promise(r => setTimeout(r, 2000));
                                        $("#ApproveButtonMortgage").click();
                                        break;
                                    }
                                }
                            }
                        } else if ((rand > 3) && (rand < 8)) {
                            while (total <= 150 && this.ReferencePlayer.botDifficulty == 1 && this.ReferencePlayer.Money >= 1000) {
                                for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                    if (this.ReferencePlayer.fieldsOwned[i].hasAll && this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != 5) {
                                        await new Promise(r => setTimeout(r, 1000));
                                        $("#RenovationsButton").click();
                                        await new Promise(r => setTimeout(r, 2000));
                                        //Decide which building to upgrade
                                        let buildToUpgrade = this.ReferencePlayer.fieldsOwned[i];
                                        let y;
                                        for (y = 0; y < this.ReferencePlayer.fieldsOwned.length; y++) {
                                            // @ts-ignore
                                            if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[y].color) && (y != i) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount)) {
                                                let z;
                                                for (z = 0; z < this.ReferencePlayer.fieldsOwned.length; z++) {
                                                    // @ts-ignore
                                                    if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[z].color) && (z != i) && (z != y) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount) && (this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount)) {
                                                        y = z;
                                                        break;
                                                    }
                                                }
                                                buildToUpgrade = this.ReferencePlayer.fieldsOwned[y];
                                                break;
                                            }
                                        }
                                        if (buildToUpgrade == this.ReferencePlayer.fieldsOwned[i]) {
                                            y = i;
                                        }
                                        let str = "#Addbutton" + y;
                                        $(str).click();
                                        // @ts-ignore
                                        total += this.ReferencePlayer.fieldsOwned[i].renovationscosts;
                                        await new Promise(r => setTimeout(r, 2000));
                                        $("#ApproveButtonMortgage").click();
                                        break;
                                    }
                                }
                            }
                        } else if (rand > 7) {
                            while (total <= 200 && this.ReferencePlayer.botDifficulty == 1 && this.ReferencePlayer.Money >= 1000) {
                                for (let i = 0; i < this.ReferencePlayer.fieldsOwned.length; i++) {
                                    if (this.ReferencePlayer.fieldsOwned[i].hasAll && this.ReferencePlayer.fieldsOwned[i].renovatiosAmmount != 5) {
                                        await new Promise(r => setTimeout(r, 1000));
                                        $("#RenovationsButton").click();
                                        await new Promise(r => setTimeout(r, 2000));
                                        //Decide which building to upgrade
                                        let buildToUpgrade = this.ReferencePlayer.fieldsOwned[i];
                                        let y;
                                        for (y = 0; y < this.ReferencePlayer.fieldsOwned.length; y++) {
                                            // @ts-ignore
                                            if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[y].color) && (y != i) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount)) {
                                                let z;
                                                for (z = 0; z < this.ReferencePlayer.fieldsOwned.length; z++) {
                                                    // @ts-ignore
                                                    if ((buildToUpgrade.color == this.ReferencePlayer.fieldsOwned[z].color) && (z != i) && (z != y) && (buildToUpgrade.renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount) && (this.ReferencePlayer.fieldsOwned[y].renovatiosAmmount > this.ReferencePlayer.fieldsOwned[z].renovatiosAmmount)) {
                                                        y = z;
                                                        break;
                                                    }
                                                }
                                                buildToUpgrade = this.ReferencePlayer.fieldsOwned[y];
                                                break;
                                            }
                                        }
                                        if (buildToUpgrade == this.ReferencePlayer.fieldsOwned[i]) {
                                            y = i;
                                        }
                                        let str = "#Addbutton" + y;
                                        $(str).click();
                                        // @ts-ignore
                                        total += this.ReferencePlayer.fieldsOwned[i].renovationscosts;
                                        await new Promise(r => setTimeout(r, 2000));
                                        $("#ApproveButtonMortgage").click();
                                        break;
                                    }
                                }
                            }
                        }

                    }
                    await new Promise(r => setTimeout(r, 3000));
                }
                await new Promise(r => setTimeout(r, 2000));
            }
            await new Promise(r => setTimeout(r, 2000));
            this.TurnEnded = true;
        }
    }

    async InitializePlayers() {
        let ps: PlayerSelection = new PlayerSelection(this.language);
        ps.event();
        while (!ps.StartTheGamePressed) {
            await new Promise(r => {
                ps.languagesetter(this.language);
                setTimeout(r, 50);
            });
        }
        ps.initializePlayers(this.MaxNumberField, this.Erasmus);
        this.PlayerArray = ps.getPlayers();
        this.PlayerArray.forEach((player) => {
            player.setLanguage(this.language);
            player.setMap(this.FieldArray);
        });
        this.initLanguage(this.language);
        this.InitializeQueue();

    }

    InitializeFieldArray_standart(): void {
        this.FieldArray = [];
        let a, b, c, d;
        a = b = c = 0;

        for (let i = 0; i < 40; i++) {
            if (i == 0 || i == 10) {
                let idle: Idle = new Idle();
                this.FieldArray.push(idle);
            } else if (i == 20) {
                let restplace: Restplace = new Restplace();
                this.FieldArray.push(restplace);
            } else if (i == 30) {
                let gotoerasmus: GoToErasmus = new GoToErasmus();
                this.FieldArray.push(gotoerasmus);
            } else if (i == 5 || i == 15 || i == 25 || i == 35) {
                let station = propertiesFile.stations_standart[a];
                let b: Bus = new Bus(station.name);
                this.FieldArray.push(b);
                a++;
            } else if (i == 12 || i == 28) {
                let parking = propertiesFile.parkings_standart[b];
                let pa: Parking = new Parking(parking.name);
                this.FieldArray.push(pa);
                b++;
            } else if (i == 4 || i == 38) {
                switch (i) {
                    case 4:
                        let luxtax: Tax = new Tax("Luxury Tax");
                        this.FieldArray.push(luxtax);
                        break;
                    case 38:
                        let inctax: Tax = new Tax("Income Tax");
                        this.FieldArray.push(inctax);
                        break;
                }
            } else if (i == 2 || i == 17 || i == 33) {
                let eventfield: EventField = new EventField(this.MaxNumberField, this.Erasmus);
                this.FieldArray.push(eventfield);
            } else if (i == 7 || i == 22 || i == 36) {
                let quizfield: QuizField = new QuizField();
                this.FieldArray.push(quizfield);
            } else {
                let prop = propertiesFile.properties_standart[c];
                let color: Colors
                switch (prop.color) {
                    case "Green":
                        color = Colors.Green
                        break;
                    case "Yellow":
                        color = Colors.Yellow
                        break;
                    case "Red":
                        color = Colors.Red
                        break;
                    case "Brown":
                        color = Colors.Brown
                        break;
                    case "Light_Blue":
                        color = Colors.Light_Blue
                        break;
                    case "Purple":
                        color = Colors.Purple
                        break;
                    case "Orange":
                        color = Colors.Orange
                        break;
                    case "Blue":
                        color = Colors.Blue
                        break;
                    default:
                        color = Colors.default;
                        break;

                }
                let p: Properties = new Properties(color, prop.pricetopay, prop.renovationscost, prop.name, prop.initialprice);
                this.FieldArray.push(p);
                c++;
            }
        }

    }

    InitializeFieldArray_medium(): void {
        this.FieldArray = [];
        let a, b, c, d;
        a = b = c = 0;

        for (let i = 0; i < 32; i++) {
            if (i == 0 || i == 8) {
                let idle: Idle = new Idle();
                this.FieldArray.push(idle);
            } else if (i == 16) {
                let restplace: Restplace = new Restplace();
                this.FieldArray.push(restplace);
            } else if (i == 24) {
                let gotoerasmus: GoToErasmus = new GoToErasmus();
                this.FieldArray.push(gotoerasmus);
            } else if (i == 4 || i == 12 || i == 20 || i == 28) {
                let station = propertiesFile.stations_medium[a];
                let b: Bus = new Bus(station.name);
                this.FieldArray.push(b);
                a++;
            } else if (i == 10 || i == 22) {
                let parking = propertiesFile.parkings_medium[b];
                let pa: Parking = new Parking(parking.name);
                this.FieldArray.push(pa);
                b++;
            } else if (i == 3 || i == 30) {
                switch (i) {
                    case 3:
                        let luxtax: Tax = new Tax("Luxury Tax");
                        this.FieldArray.push(luxtax);
                        break;
                    case 30:
                        let inctax: Tax = new Tax("Income Tax");
                        this.FieldArray.push(inctax);
                        break;
                }
            } else if (i == 2 || i == 14 || i == 26) {
                let eventfield: EventField = new EventField(this.MaxNumberField, this.Erasmus);
                this.FieldArray.push(eventfield);
            } else if (i == 6 || i == 18 || i == 29) {
                let quizfield: QuizField = new QuizField();
                this.FieldArray.push(quizfield);
            } else {
                let prop = propertiesFile.properties_medium[c];
                let color: Colors
                switch (prop.color) {
                    case "Green":
                        color = Colors.Green
                        break;
                    case "Yellow":
                        color = Colors.Yellow
                        break;
                    case "Red":
                        color = Colors.Red
                        break;
                    case "Brown":
                        color = Colors.Brown
                        break;
                    case "Light_Blue":
                        color = Colors.Light_Blue
                        break;
                    case "Purple":
                        color = Colors.Purple
                        break;
                    case "Orange":
                        color = Colors.Orange
                        break;
                    case "Blue":
                        color = Colors.Blue
                        break;
                    default:
                        color = Colors.default;
                        break;

                }
                let p: Properties = new Properties(color, prop.pricetopay, prop.renovationscost, prop.name, prop.initialprice);
                this.FieldArray.push(p);
                c++;
            }
        }

    }

    InitializeFieldArray_small(): void {
        this.FieldArray = [];
        let a, b, c, d;
        a = b = c = 0;

        for (let i = 0; i < 20; i++) {
            if (i == 0 || i == 5) {
                let idle: Idle = new Idle();
                this.FieldArray.push(idle);
            } else if (i == 10) {
                let restplace: Restplace = new Restplace();
                this.FieldArray.push(restplace);
            } else if (i == 15) {
                let gotoerasmus: GoToErasmus = new GoToErasmus();
                this.FieldArray.push(gotoerasmus);
            } else if (i == 3 || i == 13 || i == 17) {
                let station = propertiesFile.stations_small[a];
                let b: Bus = new Bus(station.name);
                this.FieldArray.push(b);
                a++;
            } else if (i == 6) {
                let parking = propertiesFile.parkings_small[b];
                let pa: Parking = new Parking(parking.name);
                this.FieldArray.push(pa);
                b++;
            } else if (i == 18) {
                let luxtax: Tax = new Tax("Luxury Tax");
                this.FieldArray.push(luxtax);
                break;
            } else if (i == 2 || i == 8) {
                let eventfield: EventField = new EventField(this.MaxNumberField, this.Erasmus);
                this.FieldArray.push(eventfield);
            } else if (i == 11) {
                let quizfield: QuizField = new QuizField();
                this.FieldArray.push(quizfield);
            } else {
                let prop = propertiesFile.properties_small[c];
                let color: Colors
                switch (prop.color) {
                    case "Green":
                        color = Colors.Green
                        break;
                    case "Yellow":
                        color = Colors.Yellow
                        break;
                    case "Red":
                        color = Colors.Red
                        break;
                    case "Brown":
                        color = Colors.Brown
                        break;
                    case "Light_Blue":
                        color = Colors.Light_Blue
                        break;
                    case "Purple":
                        color = Colors.Purple
                        break;
                    case "Orange":
                        color = Colors.Orange
                        break;
                    case "Blue":
                        color = Colors.Blue
                        break;
                    default:
                        color = Colors.default;
                        break;

                }
                let p: Properties = new Properties(color, prop.pricetopay, prop.renovationscost, prop.name, prop.initialprice);
                this.FieldArray.push(p);
                c++;
            }
        }

    }


SaveGameState(): void {
    const axios = require('axios');

    let currentplayer = this.ReferencePlayer.name;

    for(let i = 0; i < this.PlayerArray.length; i++){
        let player = this.PlayerArray[i];
        let name = player.name;
        let position = player.currentposition;
        let money = player.Money;
        let prison = player.TurnsInPrison;
        let fieldsowned : any[] = [];
        for(let j = 0; j <player.fieldsOwned.length; j++){
            let fieldsave = {
                name: player.fieldsOwned[j].name,
                renovationsAmmount: player.fieldsOwned[j].renovatiosAmmount,
                isMortgage: player.fieldsOwned[j].isMortgage
            }
            fieldsowned.push(fieldsave);
        }
        let current = currentplayer === name;

        axios.delete('http://localhost:3000/save' + i.toString() + "/1", {
        }).then(response => {
            axios.post('http://localhost:3000/save' + i.toString(), {
                player: name,
                current: current,
                currentposition: position,
                money: money,
                prison: prison,
                fieldsowned: fieldsowned
            }).then(resp => {
                console.log(resp.data);
            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            axios.post('http://localhost:3000/save' + i.toString(), {
                player: name,
                current: current,
                currentposition: position,
                money: money,
                prison: prison,
                fieldsowned: fieldsowned
            }).then(resp => {
                console.log(resp.data);
            }).catch(error => {
                console.log(error);
            });
        });
    }
}

    async MakePlayerTurn(): Promise<void> {
        let erasmus = new Erasmus(this.Erasmus)
        let double = this.dice.isdouble();

        if (this.ReferencePlayer.TurnsInPrison > 0) {
            await erasmus.Event(this.ReferencePlayer, this.StaticPlayerArray);
            return;
        }
        if (double) {
            if (this.ConseqDoubles >= 2) {
                $("#rollButton").hide();
                this.ReferencePlayer.TurnsInPrison = 1;
                if (this.ReferencePlayer.currentposition > this.MaxNumberField/4) {
                    this.ReferencePlayer.move(this.MaxNumberField - this.ReferencePlayer.currentposition + (this.MaxNumberField/4));
                } else {
                    this.ReferencePlayer.move((this.MaxNumberField/4) - this.ReferencePlayer.currentposition);
                }
                this.ReferencePlayer.currentposition = this.Erasmus;
                this.ConseqDoubles = 0;
            } else {
                this.ConseqDoubles += 1;
            }
        } else {
            $("#rollButton").hide()
            this.ConseqDoubles = 0;
        }
        this.StaticPlayerArray.forEach(playerobject => console.log(playerobject.name));
    }

    CheckWinCondition(player: Player): void {
        if (player.Money >= this.WinCondition) {
            this.GameEnded = true;
        }
        let loosers = 0;
        let winner = "";
        for(let i=0;i<this.StaticPlayerArray.length;i++){
            if(this.StaticPlayerArray[i].isGameOver){
                loosers++;
            }
            else{
                winner = this.StaticPlayerArray[i].name;
            }
        }
        if(this.StaticPlayerArray.length-loosers == 1){
            new ModalWinning().winingModal(winner,this.StaticPlayerArray[0].language);
        }
    }

    CheckLooseCondition(player: Player): void {
        console.log("enters" + player.isGameOver);
        if (player.isGameOver) {
            this.Surrender(player);
        }
    }

    Surrender(p: Player): void {
        let index = this.StaticPlayerArray.indexOf(p);
        //this.StaticPlayerArray.splice(index, 1);
        let PlayerIdString: String = "#player-" + (index + 1);
        let payerdiv = $(PlayerIdString);
        payerdiv.html("<h6>💀💀💀💀💀💀</h6>");
        for (let i = 0; i < p.fieldsOwned.length; i++) {
            p.fieldsOwned[i].owner = undefined;
        }
    }


//USED TO TEST STUFF
    async launch() {
        console.log("a");

        console.log("c");
    }

     async RepayMortgageTest() {
        let p: Player = new Player(false, "f", 0, 0, this.MaxNumberField, this.Erasmus);
        this.playerInit(p);
        let repay = new RepayMortgage();
        await repay.event(p);
    }

    AuctionTest() {
        let aution: Auction = new Auction();
        let player1 = new Player(false, "YEEEEEEEEEEET", 0, 0, this.MaxNumberField, this.Erasmus);
        let player2 = new Player(false, "Guillaume", 1, 0, this.MaxNumberField, this.Erasmus);
        let player3 = new Player(false, "Tina", 2, 0, this.MaxNumberField, this.Erasmus);
        let player4 = new Player(false, "Bob", 3, 0, this.MaxNumberField, this.Erasmus);
        let playerlist: Player[];
        playerlist = [player1, player2, player3, player4];
        aution.AuctionEvent(player2, playerlist, new Restplace());
    }

    async MortageTest() {
        let p: Player = new Player(false, "f", 0, 0, this.MaxNumberField, this.Erasmus);
        this.playerInit(p);
        for (let i = 0; i < 30; i++) {
            var rand = Math.floor(Math.random() * Object.keys(Colors).length);
            var randColorValue: Colors = Colors[Object.keys(Colors)[rand]];
            let prop2: Properties = new Properties(randColorValue, [1, 2, 3, 4], 20, "Not today", 200);
            prop2.renovatiosAmmount = 3;
            prop2.isMortgage = false;
            p.fieldsOwned.push(prop2);
        }

        await new Mortage().event(p);

        for (let i = 0; i < p.fieldsOwned.length; i++) {
            console.log(p.fieldsOwned[i].renovatiosAmmount);
        }

    }

    async TradeTest() {
        let p1: Player = new Player(false, "ad", 0, 0, this.MaxNumberField, this.Erasmus);
        let p2: Player = new Player(false, "bc", 1, 0, this.MaxNumberField, this.Erasmus);
        this.playerInit(p1);
        this.playerInit(p2);
        p1.fieldsOwned[0].name = "aaaa";
        p1.fieldsOwned[1].name = "bbbb";
        p2.fieldsOwned[0].name = "cccc";
        p2.fieldsOwned[1].name = "dddd";
        p2.hasErasmusDispense = true;
        await new Trade().event(p1, p2)
        console.log("P1");
        console.log("P1 has erasmus =>" + p1.fieldsOwned);
        console.log("P2");
        console.log("P2 has erasmus =>" + p2.fieldsOwned);
    }

    async BuyTest() {
        let p: Player = new Player(false, "f", 0, 0, this.MaxNumberField, this.Erasmus);
        let p2: Player = new Player(false, "yieks", 1, 0, this.MaxNumberField, this.Erasmus)
        p.Money = 1000;
        let prop: Properties = new Properties(Colors.Light_Blue, [1, 2, 3, 4], 10, "lel", 100);
        prop.renovatiosAmmount = 3;
        prop.isMortgage = false;
        let buyevent = new BuyEvent();
        await buyevent.event(p, 700, prop, [p, p2]);
    }

    playerInit(p: Player) {

        p.Money = 10000;
        let prop: Properties = new Properties(Colors.Light_Blue, [1, 2, 3, 4], 10, "lel1", 100);
        prop.renovatiosAmmount = 0;
        prop.isMortgage = false;
        prop.hasAll = true;
        p.fieldsOwned.push(prop);
        let prop2: Properties = new Properties(Colors.Light_Blue, [1, 2, 3, 4], 10, "lel2", 10000);
        prop2.renovatiosAmmount = 0;
        prop2.isMortgage = false;
        prop2.hasAll = true;
        p.fieldsOwned.push(prop2);
        let prop3: Properties = new Properties(Colors.Light_Blue, [1, 2, 3, 4], 10, "lel3", 10000);
        prop3.renovatiosAmmount = 0;
        prop3.isMortgage = false;
        prop3.hasAll = true;
        p.fieldsOwned.push(prop3);
        let prop4: Bus = new Bus("FUUUU");
        p.map = [];
        p.map.push(prop4);
        p.map.push(prop4);
        p.map.push(prop4);
        p.map.push(prop4);
        p.map.push(prop4);
        p.map.push(prop4);
        p.map.push(prop);
        p.map.push(prop4);
        p.map.push(prop2);
        p.map.push(prop3);
    }

    async buttonEvent() {
        let self = this;
        // show the start game modal
        $("#startGame").click(function () {
            $("#startGameModal").show();
        });
        // close any modal that has a close X
        $(".close").click(function () {
            $(".modal").hide();
        });
        // show the lobby
        $("#lobbyButton").click(function () {
            $("#lobbyModal").show();
        });
        // select board size
        $(".boardSizeButton").click(function () {
            if (this.id == "bigBoardButton") {
                setBoardSize(0);
                bigBoard(self.language);
                self.WinCondition = 5000;
                self.MaxNumberField = globals.MaxNumberField_standart;
                self.Erasmus = globals.Erasmus_standart;
                self.InitializeFieldArray_standart();
            } else if (this.id == "mediumBoardButton") {
                setBoardSize(1);
                mediumBoard(self.language);
                self.WinCondition = 4000;
                self.MaxNumberField = globals.MaxNumberField_medium;
                self.Erasmus = globals.Erasmus_medium;
                self.InitializeFieldArray_medium();
                console.log(self.FieldArray);
            } else if (this.id == "smallBoardButton") {
                setBoardSize(2);
                smallBoard(self.language);
                self.WinCondition = 3000;
                self.MaxNumberField = globals.MaxNumberField_small;
                self.Erasmus = globals.Erasmus_small;
                self.InitializeFieldArray_small();
            } else {
                bigBoard(self.language);
                self.WinCondition = 5000;
                self.MaxNumberField = globals.MaxNumberField_standart;
                self.Erasmus = globals.Erasmus_standart;
                self.InitializeFieldArray_standart();
            }
            $("#boardResizeModal").hide();
            $("#lobbyModal").show();
        });
        // hide the start menu if the play button inside the
        $("#menuPlayButton").click(function () {
            $("#startMenu").hide();
            $("#boardResizeModal").show();
            fallingCoins('body');
        });
        // show the start menu
        let startMenu =  $("#startMenuButton");
        startMenu.click(function () {
            $("#startMenu").show();
            fallingCoins('body');
        });
        // to roll the dices
        $("#rollButton").click(function () {
            //handle the doubles
            self.dice.roll(self.ReferencePlayer.ReferenceNumber, self.ReferencePlayer.name);
            self.ReferencePlayer.move(self.dice.total());
            self.MakePlayerTurn();
        });
        let saveButton = $("#saveButton");
        let surrenderButton = $("#surrenderButton");

        saveButton.text();
        saveButton.click( function(){
            self.SaveGameState()
        });
        surrenderButton.click(function(){
            if(!self.ReferencePlayer.isBot){
                self.ReferencePlayer.isBot = true;
                let botname = "Bot Player " + (self.StaticPlayerArray.indexOf(self.ReferencePlayer) + 1);
                self.ReferencePlayer.name = botname
                $("#current-player").html(botname);
                self.ShowPlayerMoney();
                self.BotAction();
            }
        });
        // to test the renovation modal

        $("#quizButton").click(async () => {

            new Quiz().event(this.ReferencePlayer);

        });

        $("#tradeButton").click(async () => {
            let trade = new Trade();
            await trade.decidePlayer(self.ReferencePlayer, self.PlayerArray);
            await trade.event(self.ReferencePlayer, trade.getTarger())
        });

        $("#RenovationsButton").click(async function () {
            await new Renovation().event(self.ReferencePlayer);
            self.updateButtons(self.ReferencePlayer);
        });
        $("#repayMortgageButton").click(async function () {
            await new RepayMortgage().event(self.ReferencePlayer);
            self.updateButtons(self.ReferencePlayer);
        });

        $("#RemoveMoneyButton").click(function () {
            self.ReferencePlayer.Money = 0;
            self.ReferencePlayer.recieveMoney(0);
        });
        $("#Add500Money").click(function () {
            self.ReferencePlayer.recieveMoney(500);
        });
        $("#Removefield").click(function () {
            self.ReferencePlayer.fieldsOwned.pop();
        });
        $("#MoveToTax").click(function () {
            // @ts-ignore
            let tax = new Tax();
            tax.Event(self.ReferencePlayer, self.PlayerArray);
        });

        let counter = 1;
        $("#menuLanguageButton").click(function () {
            let PlayerButton1 = $("#PlayerButton1");
            let PlayerButton2 = $("#PlayerButton2");
            let PlayerButton3 = $("#PlayerButton3");
            let PlayerButton4 = $("#PlayerButton4");
            let BoardSizeHeader = $("#boardResizeModal .modal-content .modal-header h2");
            let smallButton = $("#boardResizeModal .modal-body .ButtonContainer #smallBoardButton");
            let mediumButton = $("#boardResizeModal .modal-body .ButtonContainer #mediumBoardButton");
            let defaultButton = $("#boardResizeModal .modal-body .ButtonContainer #bigBoardButton");
            let inputLobby = $(".inputLobby");

            if (counter === 1) {
                self.language = "FR";
                PlayerButton1.text("Joueur 1 (Clique sur moi)");
                PlayerButton2.text("Joueur 2 (Clique sur moi)");
                PlayerButton3.text("Joueur 3 (Clique sur moi)");
                PlayerButton4.text("Joueur 4 (Clique sur moi)");
                BoardSizeHeader.text("Durée de jeux");
                smallButton.text("Petit");
                mediumButton.text("Moyen");
                defaultButton.text("Grand (par défaut)");
                $("#menuPlayButton").text("Jouer");
                $("#menuLoadButton").text("Charger la partie");
                inputLobby.prop("placeholder", "Votre pseudo");
                $(this).html("Langue: <img src='./graphic/images/flags/france.png' style='height: 25px'>");
                surrenderButton.text("Se rendre");
                saveButton.text("Sauvegarder");
                counter++;
            } else if (counter === 2) {
                self.language = "DE";
                BoardSizeHeader.text("Spiel länge");
                smallButton.text("Kurz");
                mediumButton.text("Mittlemäßig");
                defaultButton.text("lang (Standard)");
                PlayerButton1.text("Spieler 1 (Klick mich)");
                PlayerButton2.text("Spieler 2 (Klick mich)");
                PlayerButton3.text("Spieler 3 (Klick mich)");
                PlayerButton4.text("Spieler 4 (Klick mich)");
                inputLobby.prop("placeholder", "Dein Spielername");
                saveButton.html("Spiel speichern");
                surrenderButton.html("Sich ergeben");
                $("#menuPlayButton").text("Spielen");
                $("#menuLoadButton").text("Spiel laden");
                $(this).html("Sprache: <img src='./graphic/images/flags/germany.png' style='height: 25px'>");
                counter++;
            } else if (counter === 3) {
                self.language = "PR";
                BoardSizeHeader.text("Duração do jogo");
                smallButton.text("Curto");
                mediumButton.text("Médio");
                defaultButton.text("Longo (normal)");
                PlayerButton1.text("Jogador 1 (clique em mim)");
                PlayerButton2.text("Jogador 2 (clique em mim)");
                PlayerButton3.text("Jogador 3 (clique em mim)");
                PlayerButton4.text("Jogador 4 (clique em mim)");
                inputLobby.prop("placeholder", "Seu nome");
                $("#menuPlayButton").text("Jogar");
                $("#menuLoadButton").text("Carregar jogo");
                $(this).html("Língua: <img src='./graphic/images/flags/portugal.png' style='height: 25px'>");
                saveButton.text("Guardar o jogo");
                surrenderButton.text("Desistir");
                counter++;
            } else if (counter === 4) {
                self.language = "LUX";
                BoardSizeHeader.text("Spill lengt");
                smallButton.text("Keurz");
                mediumButton.text("Mettelmeiseg");
                defaultButton.text("laang (default)");
                PlayerButton1.text("Spiller 1 (Klick mech)");
                PlayerButton2.text("Spiller 2 (Klick mech)");
                PlayerButton3.text("Spiller 3 (Klick mech)");
                PlayerButton4.text("Spiller 4 (Klick mech)");
                saveButton.text("Spill speichern");
                surrenderButton.text("Sech ergin");
                inputLobby.prop("placeholder", "Dein Spillernum");
                $("#menuPlayButton").text("Spilen");
                $("#menuLoadButton").text("Spil leuden");
                $(this).html("Sproch: <img src='./graphic/images/flags/lux.png' style='height: 25px'>");
                counter++;
            } else {
                self.language = "";
                BoardSizeHeader.text("Game length");
                smallButton.text("Short");
                mediumButton.text("Medium");
                defaultButton.text("longue (default)");
                PlayerButton1.text("Player 1 (click me)");
                PlayerButton2.text("Player 2 (Click me)");
                PlayerButton3.text("Player 3 (Click me)");
                PlayerButton4.text("Player 4 (Click me)");
                $("#menuPlayButton").text("Play");
                $("#menuLoadButton").text("Load game");
                saveButton.text("Save game");
                surrenderButton.text("Surender");
                $(this).html("Language: <img src='./graphic/images/flags/kingdom.png' style='height: 25px'>");
                counter = 1;
            }
        });

    }

    updateButtons(p: Player) {
        if (p.TurnsInPrison >= 1 && !p.isBot) {
            this.MakePlayerTurn();
            return;
        }
        //SELL RENOVATIONS
        let renovationSell = $("#sellRenovationsButton");
        let cansell: boolean = false;
        for (let i = 0; i < p.fieldsOwned.length; i++) {
            if (p.fieldsOwned[i].isMortgage != undefined && p.fieldsOwned[i].renovatiosAmmount != undefined) {
                // @ts-ignore
                if (!p.fieldsOwned[i].isMortgage && p.fieldsOwned[i].renovatiosAmmount > 0) {
                    cansell = true;
                }
            }
        }
        if (cansell) {
            renovationSell.show();
        } else {
            renovationSell.hide();
        }
        //Set Mortgage properties
        let SellMortage = $("#RenovationsButton");
        cansell = false;
        for (let i = 0; i < p.fieldsOwned.length; i++) {
            console.log(p.fieldsOwned[i].hasAll);
            if (p.fieldsOwned[i].isMortgage != undefined && p.fieldsOwned[i].renovatiosAmmount != undefined) {
                // @ts-ignore
                if (!p.fieldsOwned[i].isMortgage && p.fieldsOwned[i].hasAll) {
                    cansell = true;
                }

            }
        }
        if (cansell) {
            SellMortage.show();
        } else {
            SellMortage.hide();
        }
        //Buy renovations
        let Buyrenovation = $("#buyRenovationButton");
        cansell = false;

        for (let i = 0; i < p.fieldsOwned.length; i++) {
            if (p.fieldsOwned[i].isMortgage != undefined && p.fieldsOwned[i].renovatiosAmmount != undefined) {
                // @ts-ignore
                if (!p.fieldsOwned[i].isMortgage && p.fieldsOwned[i].renovatiosAmmount < globals.MaxRenovations && p.fieldsOwned[i].hasAll) {
                    cansell = true;
                }

            }

        }
        if (cansell) {
            Buyrenovation.show();
        } else {
            Buyrenovation.hide();
        }
        //End turn → skip that one because always on
        $("#endTurnButton").show();
        //Menu Button → skip that one because always on
        $("#startMenuButton").show();
        //Trade
        $("#tradeButton").show()
        //Repay mortgage
        let repaymortgage = $("#repayMortgageButton");
        let minimumPrice: number = 20000000000;
        for (let i = 0; i < p.fieldsOwned.length; i++) {
            if (p.fieldsOwned[i].isMortgage) {
                minimumPrice = minimumPrice < p.fieldsOwned[i].initialPrice ? minimumPrice : p.fieldsOwned[i].initialPrice;
            }
        }
        if (p.canBuy(minimumPrice)) {
            repaymortgage.show();
        } else {
            repaymortgage.hide();
        }
        //Roll dice
        $("#rollButton").show();
    }

    async RenovationTest(): Promise<void> {

        if (this.first) {
            let p1: Player = new Player(false, "test1", 0, 0, this.MaxNumberField, this.Erasmus);
            this.playerInit(p1);
            this.ReferencePlayer = p1;
            p1.PlayerArray = [p1];
            this.first = false;
        }
        let renov: Renovation = new Renovation();
        await renov.event(this.ReferencePlayer);
    }


    private initLanguage(language: string) {
        let RenovationsButton = $("#RenovationsButton");
        let tradeButton = $("#tradeButton");
        let repayMortgageButton = $("#repayMortgageButton");
        let rollButton = $("#rollButton");
        let endTurnButton = $("#endTurnButton");
        let currentplayer = $("#current-player-p");
        let playersround = $("#round-counter-p");
        let startMenu = $("#startMenuButton");
        let StartGame = $("#StartButton");


        switch (this.language) {
            case "LUX":
                RenovationsButton.html("Renovatioun");
                tradeButton.html("Handel");
                repayMortgageButton.html("Prêt zréckbezuelen");
                rollButton.html("wierflen");
                endTurnButton.html("Fäerdeg");
                currentplayer.html("Aktuellen spiller:<span id=\"current-player\"></span>");
                playersround.html("Teur :<span id=\"round-counter\">0</span>");
                startMenu.html("Start menu");
                break;
            case "FR":
                RenovationsButton.html("Rénovation");
                tradeButton.html("Troque");
                repayMortgageButton.html("Rembourser l'hypothèque");
                rollButton.html("Lancer les dés");
                endTurnButton.html("Fin du tour");
                currentplayer.html("Joueur actuel:<span id=\"current-player\"></span>");
                playersround.html("Tour :<span id=\"round-counter\">0</span>");
                startMenu.html("Menu principal");
                break;
            case "PR":
                RenovationsButton.html("Renovação");
                tradeButton.html("Trocar");
                repayMortgageButton.html("Reembolsar hipoteca");
                rollButton.html("Lancar os dados");
                endTurnButton.html("Fim do turno");
                currentplayer.html("Aktuellen spiller:<span id=\"current-player\"></span>");
                playersround.html("Vez :<span id=\"round-counter\">0</span>");
                startMenu.html("Menu principal");
                break;
            case "":
                break;
            case "DE":
                RenovationsButton.html("Renovierung");
                tradeButton.html("Handel");
                repayMortgageButton.html("Hypothek zurückzahlen");
                rollButton.html("würfeln");
                endTurnButton.html("fertig");
                currentplayer.html("Aktueller Spieler:<span id=\"current-player\"></span>")
                playersround.html("Runde :<span id=\"round-counter\">0</span>");
                break;
            default:

        }
    }
}


$("#startMenu").show(function () {
    fallingCoins('body');
});


new main().main();



