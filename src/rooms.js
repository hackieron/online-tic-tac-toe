import {randomInt} from "node:crypto";
import {createGame,applyMove,nextRound} from "./game.js";
const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const cleanName=v=>String(v??"Guest").replace(/[<>]/g,"").replace(/\\s+/g," ").trim().slice(0,18)||"Guest";
export class Rooms{
 constructor(io){this.io=io;this.rooms=new Map();this.queue=[]}
 code(){let s;do{s=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join("")}while(this.rooms.has(s));return s}
 newRoom(mode){const code=this.code(),r={code,mode,players:{X:null,O:null},game:createGame(),votes:new Set(),updated:Date.now()};this.rooms.set(code,r);return r}
 add(r,s,mark,name){r.players[mark]={id:s.id,name:cleanName(name),mark};r.updated=Date.now();s.join(r.code)}
 find(id){return [...this.rooms.values()].find(r=>Object.values(r.players).some(p=>p?.id===id))}
 view(r,id){const me=Object.values(r.players).find(p=>p?.id===id);return {code:r.code,mode:r.mode,myMark:me?.mark,players:{X:r.players.X&&{name:r.players.X.name},O:r.players.O&&{name:r.players.O.name}},game:r.game,votes:[...r.votes]}}
 emit(r){for(const p of Object.values(r.players))if(p)this.io.to(p.id).emit("room:state",this.view(r,p.id))}
 removeQueue(id){this.queue=this.queue.filter(code=>this.rooms.get(code)?.players.X?.id!==id)}
 random(s,name){this.removeQueue(s.id);let r;while(this.queue.length&&!r){const c=this.queue.shift(),candidate=this.rooms.get(c);if(candidate&&!candidate.players.O)r=candidate}
 if(r){this.add(r,s,"O",name);this.emit(r);return {ok:true,matched:true,room:this.view(r,s.id)}}
 r=this.newRoom("public");this.add(r,s,"X",name);this.queue.push(r.code);return {ok:true,matched:false,room:this.view(r,s.id)}}
 create(s,name){this.removeQueue(s.id);const r=this.newRoom("private");this.add(r,s,"X",name);return {ok:true,room:this.view(r,s.id)}}
 join(s,code,name){const r=this.rooms.get(String(code||"").toUpperCase());if(!r||r.mode!=="private")return {ok:false,error:"Room not found."};if(r.players.O)return {ok:false,error:"Room is full."};if(r.players.X?.id===s.id)return {ok:false,error:"You created this room."};this.add(r,s,"O",name);this.emit(r);return {ok:true,room:this.view(r,s.id)}}
 move(s,index){const r=this.find(s.id),p=r&&Object.values(r.players).find(x=>x?.id===s.id);if(!r||!p)return {ok:false,error:"You are not in a room."};const out=applyMove(r.game,p.mark,index);if(out.ok){r.game=out.game;r.updated=Date.now();this.emit(r)}return out.ok?{ok:true}:{ok:false,error:out.error}}
 rematch(s){const r=this.find(s.id),p=r&&Object.values(r.players).find(x=>x?.id===s.id);if(!r||!p||r.game.status==="playing")return {ok:false,error:"Finish the round first."};r.votes.add(p.mark);if(r.votes.size===2){r.game=nextRound(r.game);r.votes.clear()}this.emit(r);return {ok:true}}
 leave(s){const r=this.find(s.id);if(!r)return;const p=Object.values(r.players).find(x=>x?.id===s.id);if(!p)return;r.players[p.mark]=null;this.removeQueue(s.id);this.io.to(r.code).emit("player:left",{mark:p.mark});if(!r.players.X&&!r.players.O)this.rooms.delete(r.code)}
 cleanup(){const limit=Date.now()-30*60*1000;for(const [c,r] of this.rooms)if(r.updated<limit)this.rooms.delete(c)}
}
