"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("../development/Player");
test('PlayerBeeingOnField10', function () {
    var P = new Player_1.Player(false);
    P.goToErasmus();
    expect(P.currentposition).toBe(10);
});
//# sourceMappingURL=PlayerTest.test.js.map