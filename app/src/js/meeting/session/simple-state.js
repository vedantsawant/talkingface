class SimpleState {
  constructor() {
    this.reset();
  }

  reset() {
    this.selfId = -1;
    this.participants = [];
    this.audioEncode = false;
    this.audioDecode = false;
    this.isStartedAudio = false;
  }

  resetParticipantId() {
    this.participants = [];
  }
}

// Provide global state
export default new SimpleState();
