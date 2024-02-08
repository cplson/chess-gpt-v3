class Team {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.isTurn = color == "white" ? true : false;
    this.pieces;
  }
  async updatePieces(state, moveHistory) {
    console.log("updatePieces() state: ", moveHistory);
    axios.post('http://localhost:5000/api/moveset/updateState', {
      gameState: state,
      moveHistory: moveHistory
    }).then(async (res) => {
      const response = await axios.get(
        `http://localhost:5000/api/moveset/color/${this.color}`
        );
        this.pieces = response.data;
      })

    // console.log(this.pieces);
  }
  toggleTurn() {
    this.isTurn = !this.isTurn;
  }
}

export default Team;
