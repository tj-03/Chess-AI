
const game = new Chess();
const simGame = new Chess();

function onDragStart(source, piece, position,orientation){
    if(game.game_over()){
        return false;
    }


    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }

}

function onDrop(source,target){

    
    let move = game.move({from:source,to:target});
    if(move === null){
        return 'snapback';
    }

}

function onSnapEnd(){
    board.position(game.fen());
}

let config = {
    position:'start',
    draggable:true,
    dropOffBoard:'snapback',
    showNotation:true,
    onDragStart:onDragStart,
    onDrop:onDrop,
    onSnapEnd:onSnapEnd

};
 const board =  ChessBoard('board', config)
console.log(game);

const BLACK = 'b';
const WHITE = 'w';
//Main Loop ig



function evalPosition(player,simulatedGame,curGame){
    
    



}

function minmax(node){

}


