(()=>{
const $=id=>document.getElementById(id),socket=io();let room=null,mark=null,draws=0,timer;
const views=["home","queue","game"];function show(id){views.forEach(v=>$(v).classList.toggle("hidden",v!==id))}
function toast(s){$("toast").textContent=s;$("toast").classList.add("show");clearTimeout(timer);timer=setTimeout(()=>$("toast").classList.remove("show"),2300)}
function ack(event,data={}){return new Promise(resolve=>{if(!socket.connected)return resolve({ok:false,error:"Server connection unavailable. Try again."});socket.timeout(8000).emit(event,data,(err,res)=>resolve(err?{ok:false,error:"Server timeout. Try again."}:res))})}
function playerName(){return $("name").value.trim().replace(/[<>]/g,"").slice(0,18)||"Guest"}
function enter(r){room=r;mark=r.myMark;draws=0;show("game");render(r)}
function render(r){if(!r)return;room=r;$("roomCode").textContent=r.code;$("nx").textContent=r.players.X?.name||"Waiting...";$("no").textContent=r.players.O?.name||"Waiting...";$("px").classList.toggle("active",r.game.status==="playing"&&r.game.turn==="X");$("po").classList.toggle("active",r.game.status==="playing"&&r.game.turn==="O");
[...$("board").children].forEach((b,i)=>{let m=r.game.board[i];b.textContent=m||"";b.className=m?m.toLowerCase():"";b.disabled=!r.players.X||!r.players.O||r.game.status!=="playing"||!!m||r.game.turn!==mark});
let s="Waiting for opponent...";if(r.players.X&&r.players.O){if(r.game.status==="playing")s=r.game.turn===mark?"Your turn — make a move":`${r.players[r.game.turn]?.name||"Opponent"} is thinking...`;else if(r.game.status==="won")s=r.game.winner===mark?"You won this round!":"Your opponent won this round";else s="It's a draw. Well played!"}
$("status").textContent=s;$("sx").textContent=r.game.scores.X;$("so").textContent=r.game.scores.O;$("sd").textContent=draws;$("rematch").classList.toggle("hidden",r.game.status==="playing"||!r.players.X||!r.players.O);$("votes").textContent=r.votes?.length?`${r.votes.length}/2 players ready for rematch`:""}
socket.on("connect",()=>$("connection").textContent="Online");socket.on("disconnect",()=>$("connection").textContent="Reconnecting");socket.on("connect_error",()=>$("connection").textContent="Offline");
socket.on("room:state",r=>{if($("queue").classList.contains("hidden")===false){enter(r);toast("Opponent found!")}if(room?.game.status==="playing"&&r.game.status==="draw")draws++;if(room?.game.status==="playing"&&r.game.status==="won")toast(r.game.winner===mark?"You won the round!":"Your opponent won.");render(r)});
socket.on("player:left",p=>{if(!room)return;room.players[p.mark]=null;render(room);toast(`Player ${p.mark} left.`)});
$("random").onclick=async()=>{show("queue");let r=await ack("player:ready",{name:playerName()});if(!r.ok){show("home");return $("homeError").textContent=r.error}if(r.matched){enter(r.room);toast("Opponent found!")}else{room=r.room;mark="X"}};
$("create").onclick=async()=>{let r=await ack("room:create",{name:playerName()});if(!r.ok)return $("homeError").textContent=r.error;enter(r.room);toast("Room created. Share the invite!")};
$("join").onclick=async()=>{let code=$("code").value.trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code))return $("homeError").textContent="Enter a valid 6-character code.";let r=await ack("room:join",{code,name:playerName()});if(!r.ok)return $("homeError").textContent=r.error;enter(r.room)};
$("cancel").onclick=async()=>{await ack("queue:cancel");room=null;show("home")};
$("board").onclick=async e=>{let b=e.target.closest("button[data-i]");if(!b||!room)return;b.disabled=true;let r=await ack("game:move",{index:+b.dataset.i});if(!r.ok)toast(r.error)};
$("rematch").onclick=async()=>{let r=await ack("game:rematch");if(!r.ok)toast(r.error);else toast("Rematch vote sent. Waiting for your opponent.")};
$("copy").onclick=async()=>{let u=new URL("/",location.href);u.searchParams.set("room",room.code);try{await navigator.clipboard.writeText(u.href);toast("Invite link copied!")}catch{toast("Room code: "+room.code)}};
$("leave").onclick=async()=>{await ack("room:leave");room=null;mark=null;show("home")};
let invite=new URLSearchParams(location.search).get("room");if(invite)$("code").value=invite.toUpperCase();show("home");
})();