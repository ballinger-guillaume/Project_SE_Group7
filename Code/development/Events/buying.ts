import $ from "jquery";
import {Player} from "../Player";
import {Field} from "../Fields/Field";
import {Auction} from "./Auction";

export class BuyEvent {
    private pressed: Boolean = false;
    async event(p:Player,price:number,field:Field,playerList:Player[]){
        console.log(p.name+" entered Buying");
        let modal = document.getElementById("BuyingModal");
        let buybutton = $("#Buy");
        let Autionbutton = $("#Auction");
        let buyingeventtitle = $("#buyingeventtitle");

        switch (p.language) {
            case "LUX":
                buyingeventtitle.text("Kaaf Event");
                buybutton.text("Kaafen");
                Autionbutton.text("Auktioun");
                break;
            case "FR":
                buyingeventtitle.text("Événement d'achat");
                buybutton.text("Achat");
                Autionbutton.text("Enchère");
                break;
            case "PR":
                buyingeventtitle.text("Comprar evento");
                buybutton.text("Comprar");
                Autionbutton.text("Leilão");
                break;
            case "":
                break;
            case "DE":
                buybutton.text("Kaufereignis");
                Autionbutton.text("Versteigerung");
                break;
            default:

        }

                let self = this;
        //hiddes the buttons that can't be used
        $("#BuyingModal").css("display", "block");
        if(! p.canBuy(price)){
            buybutton.hide();
            buybutton.prop("disable", true);
        }
        else {
            buybutton.show();
            buybutton.prop("disable", false);
        }
        window.onclick = function (event) {
            if (event.target == modal && modal != undefined) {
                modal.style.display = "none";
            }
        }
        $(".close").click(function () {
            $("#BuyingModal").css("display", "none");
            self.pressed = true;
        });

        // the tree buttons inside the modal
        buybutton.click(async function(){
            buybutton.off("click");
            Autionbutton.off("click");
            if (p.canBuy(price)){
                p.buying(field,price);
                field.owner = p;
            }
            $("#BuyingModal").css("display", "none");
            self.pressed = true;
        });

        Autionbutton.click(async function () {
            buybutton.off("click");
            Autionbutton.off("click");
            if(p.AuctionEntry || !p.isBot){
                p.AuctionEntry = false;
                let auction =  new Auction();
                $("#BuyingModal").css("display", "none");
                auction.AuctionEvent(p,playerList,field);
            }
            self.pressed = true;
        });

        //waits for buttons
        await this.wait();

    }
    async wait() {

        while (!this.pressed) {
            await new Promise(r => setTimeout(r, 2000));
            console.log(this.pressed);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}