//3k1b1r/R1p1pppp/2Qp4/8/8/2P1B3/5PPP/1q4K1 w - - 1 23
//"R2k1b1r/2p1pppp/2Qp4/8/8/2P1B1P1/1q3P1P/6K1 b - - 1 23"
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
//const START_FEN = "R2k1b1r/2p1pppp/2Qp4/8/8/2P1B1P1/1q3P1P/6K1 b - - 1 23"
const game = new Chess(START_FEN);
const simGame = new Chess();
const BLACK = 'b';
const WHITE = 'w';
const MAX_DEPTH = 3;
const MAX_QUIESCENT_DEPTH = 1;
const PLAYER_COLOR = WHITE;
const AI = BLACK;
const KING = 'k', QUEEN = 'q', ROOK = 'r', KNIGHT = 'n', BISHOP ='b', PAWN = 'p';

//Helper functions 
function back(arr){
    return arr[arr.length-1];
}

function shuffle(arr){
    arr.sort(()=>.5-Math.random());
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

//sorts based on material and psoitional value of pieces
function sortByBestMoves(moves){
    moves.sort((a,b)=>{
        const COLOR = a.color;
        if(a.captured && b.captured){
            
            return MATERIAL_VALUES[b.captured] + PIECE_TABLES[COLOR][b.captured][b.to] - MATERIAL_VALUES[a.captured]+ PIECE_TABLES[COLOR][a.captured][a.to];
        }
        else{

            return (MATERIAL_VALUES[b.captured]+PIECE_TABLES[COLOR][b.captured]?.[b.to]) || -1 * (MATERIAL_VALUES[a.captured] + PIECE_TABLES[COLOR][a.captured]?.[a.to]);
        }
    })
}

class InvaldPositionError extends Error{
    constructor(pos){
        super();
        this.message = "Invalid Board Position: " + pos;
      
    }
}


function boardPositionToIndex(pos){
    return pos.charCodeAt(0)-97 + (pos.charCodeAt(1)-49)*8;
}

function PieceTable(arr){
    const handler = {
        get:function(table,pos){
            if(/[a-h][1-8]/.test(pos)){
             return table.position_values[boardPositionToIndex(pos)];
            }
            else{
   
                throw new InvaldPositionError(pos);
            }
        }
    }
    this.position_values = arr;
    return new Proxy(this,handler);
}


// tables determining a piece's posiitonal value 
//Taken from Pesto evaluation function
//https://www.chessprogramming.org/PeSTO%27s_Evaluation_Function
const PIECE_TABLES = {
   [WHITE]:{     
       [KING]: PieceTable([-65,  23,  16, -15, -56, -34,   2,  13,
            29,  -1, -20,  -7,  -8,  -4, -38, -29,
            -9,  24,   2, -16, -20,   6,  22, -22,
        -17, -20, -12, -27, -30, -25, -14, -36,
        -49,  -1, -27, -39, -46, -44, -33, -51,
        -14, -14, -22, -46, -44, -30, -15, -27,
            1,   7,  -8, -64, -43, -16,   9,   8,
        -15,  36,  12, -54,   8, -28,  24,  14,]),

        [QUEEN]: PieceTable([-28,   0,  29,  12,  59,  44,  43,  45,
            -24, -39,  -5,   1, -16,  57,  28,  54,
            -13, -17,   7,   8,  29,  56,  47,  57,
            -27, -27, -16, -16,  -1,  17,  -2,   1,
            -9, -26,  -9, -10,  -2,  -4,   3,  -3,
            -14,   2, -11,  -2,  -5,   2,  14,   5,
            -35,  -8,  11,   2,   8,  15,  -3,   1,
            -1, -18,  -9,  10, -15, -25, -31, -50,]),

        [ROOK]: PieceTable([ 32,  42,  32,  51, 63,  9,  31,  43,
            27,  32,  58,  62, 80, 67,  26,  44,
            -5,  19,  26,  36, 17, 45,  61,  16,
        -24, -11,   7,  26, 24, 35,  -8, -20,
        -36, -26, -12,  -1,  9, -7,   6, -23,
        -45, -25, -16, -17,  3,  0,  -5, -33,
        -44, -16, -20,  -9, -1, 11,  -6, -71,
        -19, -13,   1,  17, 16,  7, -37, -26,]),

        [BISHOP]: PieceTable([-29,   4, -82, -37, -25, -42,   7,  -8,
            -26,  16, -18, -13,  30,  59,  18, -47,
            -16,  37,  43,  40,  35,  50,  37,  -2,
            -4,   5,  19,  50,  37,  37,   7,  -2,
            -6,  13,  13,  26,  34,  12,  10,   4,
            0,  15,  15,  15,  14,  27,  18,  10,
            4,  15,  16,   0,   7,  21,  33,   1,
            -33,  -3, -14, -21, -13, -12, -39, -21,]),

        [KNIGHT]: PieceTable([ -167, -89, -34, -49,  61, -97, -15, -107,
            -73, -41,  72,  36,  23,  62,   7,  -17,
            -47,  60,  37,  65,  84, 129,  73,   44,
            -9,  17,  19,  53,  37,  69,  18,   22,
            -13,   4,  16,  13,  28,  19,  21,   -8,
            -23,  -9,  12,  10,  19,  17,  25,  -16,
            -29, -53, -12,  -3,  -1,  18, -14,  -19,
        -105, -21, -58, -33, -17, -28, -19,  -23,]),
        [PAWN]: PieceTable([ 0,   0,   0,   0,   0,   0,  0,   0,
            98, 134,  61,  95,  68, 126, 34, -11,
            -6,   7,  26,  31,  65,  56, 25, -20,
        -14,  13,   6,  21,  23,  12, 17, -23,
        -27,  -2,  -5,  12,  17,   6, 10, -25,
        -26,  -4,  -4, -10,   3,   3, 33, -12,
        -35,  -1, -20, -23, -15,  24, 38, -22,
            0,   0,   0,   0,   0,   0,  0,   0,])
        },

    [BLACK]:{

        [KING]: PieceTable([-65,  23,  16, -15, -56, -34,   2,  13,
            29,  -1, -20,  -7,  -8,  -4, -38, -29,
            -9,  24,   2, -16, -20,   6,  22, -22,
        -17, -20, -12, -27, -30, -25, -14, -36,
        -49,  -1, -27, -39, -46, -44, -33, -51,
        -14, -14, -22, -46, -44, -30, -15, -27,
            1,   7,  -8, -64, -43, -16,   9,   8,
        -15,  36,  12, -54,   8, -28,  24,  14,].reverse()),

        [QUEEN]: PieceTable([-28,   0,  29,  12,  59,  44,  43,  45,
            -24, -39,  -5,   1, -16,  57,  28,  54,
            -13, -17,   7,   8,  29,  56,  47,  57,
            -27, -27, -16, -16,  -1,  17,  -2,   1,
            -9, -26,  -9, -10,  -2,  -4,   3,  -3,
            -14,   2, -11,  -2,  -5,   2,  14,   5,
            -35,  -8,  11,   2,   8,  15,  -3,   1,
            -1, -18,  -9,  10, -15, -25, -31, -50,].reverse()),

        [ROOK]: PieceTable([ 32,  42,  32,  51, 63,  9,  31,  43,
            27,  32,  58,  62, 80, 67,  26,  44,
            -5,  19,  26,  36, 17, 45,  61,  16,
        -24, -11,   7,  26, 24, 35,  -8, -20,
        -36, -26, -12,  -1,  9, -7,   6, -23,
        -45, -25, -16, -17,  3,  0,  -5, -33,
        -44, -16, -20,  -9, -1, 11,  -6, -71,
        -19, -13,   1,  17, 16,  7, -37, -26,].reverse()),

        [BISHOP]: PieceTable([-29,   4, -82, -37, -25, -42,   7,  -8,
            -26,  16, -18, -13,  30,  59,  18, -47,
            -16,  37,  43,  40,  35,  50,  37,  -2,
            -4,   5,  19,  50,  37,  37,   7,  -2,
            -6,  13,  13,  26,  34,  12,  10,   4,
            0,  15,  15,  15,  14,  27,  18,  10,
            4,  15,  16,   0,   7,  21,  33,   1,
            -33,  -3, -14, -21, -13, -12, -39, -21,].reverse()),

        [KNIGHT]: PieceTable([ -167, -89, -34, -49,  61, -97, -15, -107,
            -73, -41,  72,  36,  23,  62,   7,  -17,
            -47,  60,  37,  65,  84, 129,  73,   44,
            -9,  17,  19,  53,  37,  69,  18,   22,
            -13,   4,  16,  13,  28,  19,  21,   -8,
            -23,  -9,  12,  10,  19,  17,  25,  -16,
            -29, -53, -12,  -3,  -1,  18, -14,  -19,
        -105, -21, -58, -33, -17, -28, -19,  -23,].reverse()),
        [PAWN]: PieceTable([ 0,   0,   0,   0,   0,   0,  0,   0,
            98, 134,  61,  95,  68, 126, 34, -11,
            -6,   7,  26,  31,  65,  56, 25, -20,
        -14,  13,   6,  21,  23,  12, 17, -23,
        -27,  -2,  -5,  12,  17,   6, 10, -25,
        -26,  -4,  -4, -10,   3,   3, 33, -12,
        -35,  -1, -20, -23, -15,  24, 38, -22,
            0,   0,   0,   0,   0,   0,  0,   0,].reverse())
    }
}

const MATERIAL_VALUES = {
    [KING]:1000,
    [QUEEN]:10,
    [ROOK]:5,
    [BISHOP]:3,
    [KNIGHT]:3,
    [PAWN]:1.2,
}

class GameInfo{
    constructor(game){
        
        const curTurn = game.turn();
        function PlayerInfo(game,player){
            const playerTurn = player === game.turn();
            //this.fen = game.fen();
            this.in_checkmate = game.in_checkmate() && playerTurn;
            this.in_stalemate = game.in_stalemate() && playerTurn;
            // this.in_threefold_repetition = game.in_threefold_repetition();
            this.in_check = game.in_check() && playerTurn;
             this.in_check = game.in_check() && playerTurn;
          
            this.pieces = {};
            const board = game.board();
            for(let rank = 0; rank < board.length; rank++){
                for (let tile = 0;tile<board[rank].length;tile++){
                    if(board[rank][tile]?.color === player){
                        this.pieces[String.fromCharCode(tile+97)+(rank+1)] = board[rank][tile].type;
                    }
                }
            }
        }
        
        
        
        this.black = new PlayerInfo(game,BLACK);
        this.white = new PlayerInfo(game,WHITE);
        this[BLACK] = this.black;
        this[WHITE] = this.white;
    }
}

// According to AlphaZero (the strongest chess engine today), \
// a pawn is worth 1 point, a knight is worth 3.05,
//  a bishop is worth 3.33, a rook is worth 5.63, 
//  and a queen is worth 9.5 points. 
//  Source: https://arxiv.org/abs/2009.04374
//- from https://www.chess.com/terms/chess-piece-value



function evalPositionValues(game_info){
    const black = game_info.black;
    const white = game_info.white;
    let white_val = 0;
    for(let pos in white.pieces){
        
        let piece = white.pieces[pos];
 
        white_val += PIECE_TABLES[WHITE][piece][pos]/360;
    }
    let black_val = 0;

    for(let pos in black.pieces){
        let piece = black.pieces[pos];

        black_val += PIECE_TABLES[BLACK][piece][pos]/360;
    }
    return {black_position_value:black_val,white_position_value:white_val};
}

function pieceDistance(pos1,pos2){
    const x1 = pos1.charCodeAt(0), y1 = pos1.charCodeAt(1);
    const x2 = pos2.charCodeAt(0), y2 = pos2.charCodeAt(1);
   
    return Math.abs(x2-x1)+Math.abs(y2-y1);
}

//Naiive evaluation based on how close pieces are - does not affect evaluation too much since its not accurate
function evalKingSafety(game_info){
    const black = game_info.black;
    const white = game_info.white;
    let king_safety = 0;
    let king_pos = Object.keys(black.pieces).find(pos=>black.pieces[pos] === KING);
    
    for(let pos in black.pieces){
        if(black.pieces[pos] !== KING){
            
            let dist = pieceDistance(pos,king_pos);
         
            king_safety += 1/dist;
        }
    }
    for(let pos in white.pieces){
        
            
            let dist = pieceDistance(pos,king_pos);
         
            king_safety -= dist/40;
        
    }
  
    king_safety/=25;
    return king_safety;
   
}

function evalMaterialValue(game_info){
    const black = game_info.black;
    const white = game_info.white;
    let black_val = 0;
    let white_val = 0;
    for(let piece in white.pieces){
        
        white_val += MATERIAL_VALUES[white.pieces[piece]];
       
    }
    for(let piece in black.pieces){
        black_val += MATERIAL_VALUES[black.pieces[piece]];
    }
    return {black_material_value:black_val,white_material_value:white_val};
}

function evalPosition(game){
    const game_info = new GameInfo(game);
    const white = game_info.white;
    const black = game_info.black;
  
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

    let king_safety = evalKingSafety(game_info);
    let {black_material_value,white_material_value} = evalMaterialValue(game_info);
    let {black_position_value,white_position_value} = evalPositionValues(game_info);
   //console.log(black_position_value,white_position_value);

  
    //check score increases depending on how many pieces are available 
    if(black.in_check){
        score -= 20/(black_material_value);
        console.log(20/(black_material_value))
    }
    if(white.in_check){
        score += 20/(white_material_value);
        console.log(20/(white_material_value))
    }

    score += black_position_value + black_material_value -white_material_value - white_position_value;

    score += king_safety;
    return score;
}





let nodesExpanded = 0;

//Beta represnts the minimizing parents current best choice
//If the current maximizing node expands a node of value V >= beta, we 
//know the current nodes value will be >= V, which will not be chosen
//by the minimizng parent since its larger than its best choice
//Applies vice versa, where alpha is the maximizing parents current best choice
let transpositions = {}


function minimax(game_state,depth,alpha = Number.NEGATIVE_INFINITY,beta = Number.POSITIVE_INFINITY){
    nodesExpanded++; 
    console.log(nodesExpanded);
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let best_move = null;
    let nextFen;
    let predicted_moves = [];
    
    if(depth !== 0){
        const moves = game_state.moves({verbose:true});
        sortByBestMoves(moves);
 
        const cur_fen = game_state.fen();
        for(let move of moves){
            game_state.move(move);
   
            const next_move_fen = game_state.fen();
            let result;
            // if(transpositions[next_move_fen+depth]){
            //     result = transpositions[next_move_fen+depth].value;
            //     console.log(next_move_fen+depth,transpositions[next_move_fen+depth])
            // }
            // else{
            //     result = minimax(game_state,depth-1,alpha,beta);
            //     transpositions[next_move_fen+depth] = {value:result.value,depth:depth};
                
            // }
           
            result = minimax(game_state,depth-1,alpha,beta);
    
           
            game_state.load(cur_fen);
            //Maximizing Logic
            if(game_state.turn() === AI){
               
          
                if(result.value > max ){
                    predicted_moves = result.moves;
                    max = result.value;
                    best_move = move;
                }
                
                alpha = Math.max(max,alpha);
                
            }
            //Minimizing Logic
            else{
             
              
                if(result.value < min){
                   predicted_moves = result.moves;
                    min = result.value;
                    best_move = move;
                }
                beta = Math.min(min,beta);
              
            }
            
            //prune subtree
            if(alpha >= beta){
                  break;
              }
            
        }
        
        //If every available move leads to a win/loss just choose the first one 
        if(best_move === null){
            best_move = moves[0];
        }

        //Return current nodes score, along with additional information about the node and the previous moves
        if(game_state.turn() === AI){
            predicted_moves.push([best_move,max,cur_fen,depth]);
            return {value:max,decision:best_move,moves:predicted_moves};
        }
        else{
           predicted_moves.push([best_move,min,cur_fen,depth]);
            return {value:min,decision:best_move,moves:predicted_moves};
        }
    }

    //static evaluation of position
    else{
        //let result = quiescentMinimax(game_state,MAX_QUIESCENT_DEPTH,alpha,beta);
        let result = {value:evalPosition(game_state),decision:null,moves:[]};
     
        return result;
    }
}

//Not currently used, will improve later
function isQuiet(game_state,moves){
    if(game_state.in_check()){
        return false;
    }
    for(let move of moves){
        if(('captured' in move )|| 'promotion' in move){
            return false;
        }
    }
    return true;
}
function quiescentMinimax(game_state,depth,alpha,beta){
    nodesExpanded++;
    console.log(nodesExpanded);
    const moves = game_state.moves({verbose:true});
    
    if(isQuiet(game_state,moves) || depth === -1){
        const value = evalPosition(game_state);
        return {value:value,decision:null,moves:[]};
    }
    let stand_pat = evalPosition(game_state);
    if(beta >= stand_pat){
       // return {value:beta,decision:null,moves:[]};
    }
  //  alpha = Math.max(alpha,stand_pat);

    let best_move = null;
    let max = Number.NEGATIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;
    let pred = [];
    for(let move of moves){
        const cur_fen = game_state.fen();
        if(!('captured' in move) && depth === 0){
            continue;
        }
        game_state.move(move);
        let result = quiescentMinimax(game_state,depth-1,alpha,beta);
        game_state.load(cur_fen);

        if(game_state.turn() === AI){
            if(result.value > max){
                max = result.value;
                best_move = move; 
                pred = result.moves;
            }
            alpha = Math.max(alpha,max);
        }
        else{
            if(result.value < min){
                min = result.value;
                best_move = move;
                pred = result.moves;
            }
            beta = Math.min(beta,min);
        }
        if(alpha >= beta){
            break;
        }
    }

    if(game_state.turn() === AI){
        pred.push(best_move);
        return {value:max,decision:best_move,moves:pred};
    }
    else{
        pred.push(best_move);
        return {value:min,decision:best_move,moves:pred};
    }
    

}


 function makeMove(){
    let moves = game.moves();

    if(game.turn() === PLAYER_COLOR)return;
    if(moves.length == 0)return;
   
    const sim = Chess(game.fen());//making sure game state isnt changed in minimax
    console.time("MINIMAX");
    let move =  minimax(sim,MAX_DEPTH);
    console.timeEnd("MINIMAX");
    console.log(move);
    game.move(move.decision);
    console.log("Expanded Nodes" + nodesExpanded);
    nodesExpanded =0;
    board.position(game.fen());
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
        if (game.turn() !== PLAYER_COLOR) {
            return false;
        }
    }
    //if invalid move, return drop back to reset to original position
    function onDrop(source,target){
        let move = game.move({from:source,to:target,promotion:'q'});
        if(move === null){
            return 'snapback';
        }
        removeHighlight(source);
       
       
      
    }
    //update board state on new position
    function onSnapEnd(){
        board.position(game.fen());
        setTimeout(makeMove,1000);
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
        position:START_FEN,
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
function func2(){
    for(var i = 0; i < 3; i++){
      setTimeout(()=> console.log(i),2000);
  }
  
  }
  
  func2();