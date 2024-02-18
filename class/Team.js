class Team {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.isTurn = color == "white" ? true : false;
    this.pieces;
  }
  async updatePieces(state, moveHistory) {
    // console.log("updatePieces() state: ", moveHistory);
    await axios
      .post("http://localhost:5000/api/moveset/updateState", {
        gameState: state,
        moveHistory: moveHistory,
      })
      .then(async (res) => {
        // console.log(this.name, this.isTurn);
        const response = await axios.get(
          `http://localhost:5000/api/moveset/color/${this.color}/isTurn/${this.isTurn}`
        );
        this.pieces = response.data;
      });

  }
  toggleTurn() {
    this.isTurn = !this.isTurn;
  }

  getPieces() {
    return this.pieces
  }
}

export default Team;
