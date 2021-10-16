
const game = new Chess();
const simGame = new Chess();
const BLACK = 'b';
const WHITE = 'w';
const MAX_DEPTH = 4;
const PLAYER_COLOR = WHITE;
const AI = BLACK;

Array.prototype.back = function(){
    return this[this.length-1];
}
function evalPosition(game){
    let pieceValues = {
        p:1,
        n:3,
        b:3,
        r:6,
        q:10,
        k:0
    }   
    const gameInfo = new GameInfo(game);
    const white = gameInfo.white;
    const black = gameInfo.black;
    if(black.in_checkmate){
        return Number.NEGATIVE_INFINITY;
    }
    if(white.in_checkmate){
        return Number.POSITIVE_INFINITY;
    }
    let score = 0;
    if(black.in_stalemate){
        score-=100;
    }
    if(white.in_stalemate){
        score+=100;
    }

    if(white.in_check){
        score+=50;
    }
    if(black.in_check){
        score-=50;
    }

    let whiteScore = 0;
    let blackScore  = 0;
    for(let piece of white.pieces){
        whiteScore += pieceValues[piece];
    }
    for(let piece of black.pieces){
        blackScore += pieceValues[piece];
    }

    score += blackScore -whiteScore;
   
    return score;
}

// According to AlphaZero (the strongest chess engine today), \
// a pawn is worth 1 point, a knight is worth 3.05,
//  a bishop is worth 3.33, a rook is worth 5.63, 
//  and a queen is worth 9.5 points. 
//  Source: https://arxiv.org/abs/2009.04374
//- from https://www.chess.com/terms/chess-piece-value

class GameInfo{
    constructor(_game){
        const game = new Chess(_game.fen());
        const curTurn = game.turn();
        this.curFen = game.fen();

        function PlayerInfo(game){
   
            //this.fen = game.fen();
            this.in_checkmate = game.in_checkmate();
            this.in_stalemate = game.in_stalemate();
            // this.in_threefold_repetition = game.in_threefold_repetition();
            this.in_check = game.in_check();
             this.in_check = game.in_check();
          
            this.pieces = [];
            const board = game.board();
            for(let rank of board){
                for (let tile of rank){
                    if(tile?.color === game.turn()){
                        this.pieces.push(tile.type);
                    }
                }
            }
          
            
        }

        swapTurn(game,WHITE);
        this.white = new PlayerInfo(game);
        swapTurn(game,BLACK);
        this.black = new PlayerInfo(game);
        swapTurn(game,curTurn);
        this[BLACK] = this.black;
        this[WHITE] = this.white;
    }
}

function swapTurn(chess,turn) {

	let tokens = chess.fen().split(" ");
    if(turn != null){
	    tokens[1] = turn;
    }
    else{
        tokens[1] = chess.turn() === BLACK ? WHITE : BLACK;
    }
	tokens[3] = "-";
	chess.load(tokens.join(" "));
 
}


let nodesExpanded = 0;

//Beta represnts the minimizing parents current best choice
//If the current maximizing node expands a node of value V >= beta, we 
//know the current nodes value will be >= V, which will not be chosen
//by the minimizng parent since its larger than its best choice
//Applies vice versa, where alpha is the maximizing parents current best choice

const cache ={}
const stuff = []
function minimax(game,depth,alpha = Number.NEGATIVE_INFINITY,beta = Number.POSITIVE_INFINITY){

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let nodeDecision = null;
    let nextFen;
    let seq = [];
    if(depth !== 0){
        const moves = game.moves({verbose:true});
      //  moves.sort(()=>Math.random());
        const curBoardPosition = game.fen();
        for(let move of moves){
    
            game.move(move);
            nextFen = game.fen();
            let result;
            if(cache[nextFen]==null){
                nodesExpanded++; 
                result = minimax(game,depth-1,alpha,beta);
                
            }
            else{
                result = cache[nextFen];
            }
            game.undo();
            //Maximizing Logic
            if(game.turn() === AI){
               
                if(cache[nextFen] == null){
                    cache[nextFen] = result;
                }

                if(result.value >= max){
                    seq = result.moves;
                    max = result.value;
                    nodeDecision = move;
                }
                
                alpha = Math.max(max,alpha);
           
                if(alpha >= beta){
                    break;
                }
            }

            //Minimizing Logic
            else{
             
                if(cache[nextFen] == null){
                   cache[nextFen] = result;
                }
                if(result.value <= min){
                    seq = result.moves;
                    min = result.value;
                    nodeDecision = move;
                }
                beta = Math.min(min,beta);
                
                if(alpha >= beta){
                  //  console.log("Node pruned at MIN");
                    break;
                }
            }
        }
        
        if(game.turn() === AI){
            seq.push([nodeDecision,max,curBoardPosition]);
            return {value:max,decision:nodeDecision,moves:seq};
        }
        else{
            seq.push([nodeDecision,min,curBoardPosition]);
            return {value:min,decision:nodeDecision,moves:seq};
        }
    }

    else{
        const value = evalPosition(game);
        console.log(value);
        return {value:value,decision:nodeDecision,moves:[]};
    }
   
    
}
function makeMove(){
    let moves = game.moves();
    if(game.turn() === PLAYER_COLOR)return;
    if(moves.length == 0)return;
    //let move = moves[Math.floor(moves.length * Math.random())];
    const sim = Chess(game.fen());
    console.time("MINIMAX");
    let move = minimax(sim,MAX_DEPTH);
    console.log(cache,Object.keys(cache).length);
    console.timeEnd("MINIMAX");
    console.log(move);
    game.move(move.decision);
    console.log(stuff)
    board.position(game.fen());
    console.log("Expanded Nodes" + nodesExpanded);
    nodesExpanded =0;
}


function initChessBoard(){
    $("button").on("click",()=>{
        game.undo();
        board.position(game.fen());
        if(game.turn() === BLACK){
            setTimeout(makeMove,1200);
        }
 
    })
    //if the game is over, dont drag, if its not players turn, dont drag
    function onDragStart(source, piece, position,orientation){
        if(game.game_over()){
            return false;
        }
        if ((game.turn() === PLAYER_COLOR && piece.search(/^b/) !== -1)) {
            return false
        }

    }

    //if invalid move, return drop back to reset to original position
    function onDrop(source,target){
        let move = game.move({from:source,to:target,promotion:'q'});
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

        setTimeout(makeMove,500);

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






