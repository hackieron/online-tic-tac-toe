import test from "node:test";import assert from "node:assert/strict";import {createGame,applyMove} from "../src/game.js";
test("legal move switches turn",()=>{const r=applyMove(createGame(),"X",4);assert.equal(r.ok,true);assert.equal(r.game.turn,"O")});
test("rejects wrong turn and occupied square",()=>{assert.equal(applyMove(createGame(),"O",0).ok,false);let g=applyMove(createGame(),"X",0).game;assert.equal(applyMove(g,"O",0).ok,false)});
test("detects winner",()=>{let g=createGame();for(const [m,i] of [["X",0],["O",3],["X",1],["O",4],["X",2]])g=applyMove(g,m,i).game;assert.equal(g.status,"won");assert.equal(g.scores.X,1)});
