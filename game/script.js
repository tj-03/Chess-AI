

const game = new Chess();
const simGame = new Chess();

// According to AlphaZero (the strongest chess engine today), \
// a pawn is worth 1 point, a knight is worth 3.05,
//  a bishop is worth 3.33, a rook is worth 5.63, 
//  and a queen is worth 9.5 points. 
//  Source: https://arxiv.org/abs/2009.04374
//- from https://www.chess.com/terms/chess-piece-value



function evalPosition(player,simulatedGame,curGame){
    let pieceValues = {
        p:1,
        n:3,
        r:6,
        q:10,
        k:0
    }   
    let score = 0;
}

function minmax(sim,maxDepth){

}


function initChessBoard(){
    //if the game is over, dont drag, if its not players turn, dont drag
    function onDragStart(source, piece, position,orientation){
        if(game.game_over()){
            return false;
        }
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false
        }

    }

    //if invalid move, return drop back to reset to original position
    function onDrop(source,target){
        let move = game.move({from:source,to:target});
        if(move === null){
            return 'snapback';
        }
        removeHighlight(source);
        let possibleMoves = game.moves({square:source,verbose:true});
        if(possibleMoves === null){
            return;
        }
        for(let move of possibleMoves){
            removeHighlight(move.to);
        }
    }

    //update board state on new position
    function onSnapEnd(){
        board.position(game.fen());
    }


    function setHighlight(squarePos){
        const darkHighlightColor = "grey";
        const lightHighlightColor = "lightgray";
        let $square = $("#board .square-" + squarePos);
        if (game.square_color(squarePos) === "dark") {
            $square.addClass("selected")
         }
        else{
            $square.addClass("selectedAlt")
         }
      
    }

    function removeHighlight(){
        $('#board .square-55d63').removeClass("selected");
        $('#board .square-55d63').removeClass("selectedAlt");
    }
    function onMouseoverSquare(square,piece){
        let possibleMoves = game.moves({square:square,verbose:true});
        if(possibleMoves.length === 0){
            return;
        }
    
        setHighlight(square);
        for(let move of possibleMoves){
            setHighlight(move.to);
        }
    }

    function onMouseoutSquare(square,piece){
        removeHighlight(square);
        let possibleMoves = game.moves({square:square,verbose:true});
        if(possibleMoves === null){
            return;
        }
        for(let move of possibleMoves){
            removeHighlight(move.to);
        }


    }
    let config = {
        position:'start',
        draggable:true,
        dropOffBoard:'snapback',
        showNotation:true,
        onDragStart:onDragStart,
        onDrop:onDrop,
        onSnapEnd:onSnapEnd,
        onMouseoverSquare:onMouseoverSquare,
        onMouseoutSquare:onMouseoutSquare

    };

    return ChessBoard('board', config)
}

const board = initChessBoard();
const BLACK = 'b';
const WHITE = 'w';





