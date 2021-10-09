

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
        r:5.63,
        q:9.5,
        k:0
    }
    let score = 0;
}

function minmax(sim,maxDepth){

}


function initChessBoard(){
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

    function setHighlight(squarePos){
        const backgroundColor = "grey";
        let $square = $("#board .square-" + squarePos);
        $square.css("background",backgroundColor);
    }

    function removeHighlight(){
        $('#board .square-55d63').css('background', '');
    }
    function onMouseoverSquare(square,piece){
        let movePositions = game.moves({square:square});
        if(movePositions.length === 0){
            return;
        }
        setHighlight(square);
        for(let squarePos of movePositions){
            setHighlight(squarePos);
        }
    }

    function onMouseoutSquare(square,piece){
        removeHighlight(square);
        let movePositions = game.moves({square:square});
        console.log(movePositions);
        if(movePositions === null){
            return;
        }
        for(let squarePos of movePositions){
            removeHighlight(squarePos);
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






