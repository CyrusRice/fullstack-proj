// Decline player move if space is occupied by one of their pieces
function onDrop (source, target, piece, newPos, oldPos, orientation) {
    /*console.log('piece: ' + piece)
    console.log('source: ' + source)
    console.log('target: ' + target)
    console.log('newPos: ' + newPos)
    console.log('oldPos: ' + oldPos)
    console.log('orientation: ' + orientation)*/
    if(board.position()[target] === undefined)
      return
    if ((piece.search(/b/) !== -1) && (board.position()[target].search(/b/) !== -1) ||
    (piece.search(/w/) !== -1) && (board.position()[target].search(/w/) !== -1)) {
      return 'snapback'
    }
  }

var config = {
    draggable: true,
    pieceTheme: '../img/{piece}.png',
    //showNotation: false,
    position: 'start',
    onDrop: onDrop
}
var board = Chessboard('myBoard', config)
$('#startPositionBtn').on('click', board.start)