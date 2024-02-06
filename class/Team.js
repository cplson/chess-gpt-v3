let playerPieces;

class Team {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.isTurn = color == "white" ? true : false;
    this.pieces;
  }
  async updatePieces(state) {
    // console.log("updatePieces() state: ", state);
    const response = await axios.get(
      `http://localhost:5000/api/moveset/state/${state}`
    );
    this.pieces = response.data;
  }
}

export default Team;
