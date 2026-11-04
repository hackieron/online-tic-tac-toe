export function createGame(){return {board:Array(9).fill(null),turn:"X",status:"playing",winner:null,scores:{X:0,O:0},round:1}}
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function applyMove(game,mark,index){
 if(game.status!=="playing")return {ok:false,error:"Round finished."};
 if(!Number.isInteger(index)||index<0||index>8)return {ok:false,error:"Invalid square."};
 if(mark!==game.turn)return {ok:false,error:"Not your turn."};
 if(game.board[index])return {ok:false,error:"Square already taken."};
 const next={...game,board:[...game.board],scores:{...game.scores}};next.board[index]=mark;
 const win=lines.some(([a,b,c])=>next.board[a]&&next.board[a]===next.board[b]&&next.board[a]===next.board[c]);
 if(win){next.status="won";next.winner=mark;next.scores[mark]++}else if(next.board.every(Boolean))next.status="draw";else next.turn=mark==="X"?"O":"X";
 return {ok:true,game:next};
}
export function nextRound(game){return {...createGame(),scores:{...game.scores},round:game.round+1}}
