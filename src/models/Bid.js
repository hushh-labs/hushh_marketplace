// Bid Model
export class Bid {
  constructor(data = {}) {
    this.id = data.id || '';
    this.search_session_id = data.search_session_id || '';
    this.agent_id = data.agent_id || '';
    this.user_id = data.user_id || '';
    this.product_query = data.product_query || '';
    this.coins_bid = data.coins_bid || 0;
    this.bid_message = data.bid_message || '';
    this.bid_status = data.bid_status || 'active'; // 'active', 'won', 'lost', 'expired'
    this.is_selected = data.is_selected || false;
    this.created_at = data.created_at || new Date().toISOString();
    this.expires_at = data.expires_at || null; // No expiry for brute force approach
    
    // Additional data from joins
    this.agent = data.agent || null;
    this.store_name = data.store_name || '';
    this.store_location = data.store_location || {};
    this.store_category = data.store_category || [];
    this.agent_name = data.agent_name || '';
  }

  get isActive() {
    return this.bid_status === 'active';
  }

  get isWon() {
    return this.bid_status === 'won';
  }

  get isLost() {
    return this.bid_status === 'lost';
  }

  get timeAgo() {
    const now = new Date();
    const bidTime = new Date(this.created_at);
    const diffInSeconds = Math.floor((now - bidTime) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  }

  get coinValue() {
    // Convert coins to currency (70 coins = $1)
    return (this.coins_bid / 70).toFixed(2);
  }

  get displayLocation() {
    if (!this.store_location) return 'Location not set';
    const { floor, section, shop_number } = this.store_location;
    return `${floor || 'Floor'} ${section || 'Section'}, Shop ${shop_number || 'N/A'}`;
  }

  get bidPriority() {
    if (this.coins_bid >= 100) return 'high';
    if (this.coins_bid >= 50) return 'medium';
    return 'low';
  }

  get bidPriorityIcon() {
    switch (this.bidPriority) {
      case 'high': return '🔥';
      case 'medium': return '⭐';
      case 'low': return '💡';
      default: return '🪙';
    }
  }

  markAsWon() {
    this.bid_status = 'won';
    this.is_selected = true;
  }

  markAsLost() {
    this.bid_status = 'lost';
    this.is_selected = false;
  }

  toJSON() {
    return {
      id: this.id,
      search_session_id: this.search_session_id,
      agent_id: this.agent_id,
      user_id: this.user_id,
      product_query: this.product_query,
      coins_bid: this.coins_bid,
      bid_message: this.bid_message,
      bid_status: this.bid_status,
      is_selected: this.is_selected,
      created_at: this.created_at,
      expires_at: this.expires_at,
      agent: this.agent,
      store_name: this.store_name,
      store_location: this.store_location,
      store_category: this.store_category,
      agent_name: this.agent_name
    };
  }

  static fromJSON(data) {
    return new Bid(data);
  }
}

export default Bid;
