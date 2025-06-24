// SearchSession Model
export class SearchSession {
  constructor(data = {}) {
    this.id = data.id || '';
    this.user_id = data.user_id || '';
    this.search_query = data.search_query || '';
    this.search_filters = data.search_filters || {};
    this.user_location = data.user_location || {};
    this.status = data.status || 'active'; // 'active', 'completed', 'abandoned'
    this.selected_agent_id = data.selected_agent_id || null;
    this.total_bids = data.total_bids || 0;
    this.created_at = data.created_at || new Date().toISOString();
    this.completed_at = data.completed_at || null;
    this.user_feedback = data.user_feedback || '';
    this.bids = data.bids || [];
  }

  get isActive() {
    return this.status === 'active';
  }

  get isCompleted() {
    return this.status === 'completed';
  }

  get duration() {
    if (!this.completed_at) return null;
    const start = new Date(this.created_at);
    const end = new Date(this.completed_at);
    return Math.floor((end - start) / 1000); // Duration in seconds
  }

  get hasWinner() {
    return this.selected_agent_id !== null;
  }

  addBid(bid) {
    this.bids.push(bid);
    this.total_bids = this.bids.length;
  }

  selectWinner(agentId) {
    this.selected_agent_id = agentId;
    this.status = 'completed';
    this.completed_at = new Date().toISOString();
  }

  abandon() {
    this.status = 'abandoned';
    this.completed_at = new Date().toISOString();
  }

  getRankedBids() {
    return this.bids.sort((a, b) => {
      // Sort by coins_bid (descending), then by timestamp (ascending)
      if (b.coins_bid !== a.coins_bid) {
        return b.coins_bid - a.coins_bid;
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });
  }

  getTopBids(limit = 3) {
    return this.getRankedBids().slice(0, limit);
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      search_query: this.search_query,
      search_filters: this.search_filters,
      user_location: this.user_location,
      status: this.status,
      selected_agent_id: this.selected_agent_id,
      total_bids: this.total_bids,
      created_at: this.created_at,
      completed_at: this.completed_at,
      user_feedback: this.user_feedback,
      bids: this.bids
    };
  }

  static fromJSON(data) {
    return new SearchSession(data);
  }
}

export default SearchSession;
