// Agent Model
export class Agent {
  constructor(data = {}) {
    this.id = data.id || '';
    this.hushh_user_id = data.hushh_user_id || '';
    this.agent_name = data.agent_name || '';
    this.agent_email = data.agent_email || '';
    this.agent_phone = data.agent_phone || '';
    this.fcm_token = data.fcm_token || '';
    this.store_name = data.store_name || '';
    this.store_category = data.store_category || [];
    this.store_location = data.store_location || {};
    this.store_description = data.store_description || '';
    this.coins = data.coins || 2000;
    this.total_bids = data.total_bids || 0;
    this.successful_bids = data.successful_bids || 0;
    this.conversion_rate = data.conversion_rate || 0.0;
    this.average_bid_amount = data.average_bid_amount || 50;
    this.total_earnings = data.total_earnings || 0.0;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.is_online = data.is_online !== undefined ? data.is_online : false;
    this.last_seen = data.last_seen || new Date().toISOString();
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  get displayLocation() {
    if (!this.store_location) return 'Location not set';
    const { floor, section, shop_number } = this.store_location;
    return `${floor || 'Floor'} ${section || 'Section'}, Shop ${shop_number || 'N/A'}`;
  }

  get winRate() {
    return this.total_bids > 0 ? (this.successful_bids / this.total_bids) * 100 : 0;
  }

  get coinsPerBid() {
    return this.total_bids > 0 ? this.average_bid_amount : 0;
  }

  get status() {
    if (!this.is_active) return 'inactive';
    return this.is_online ? 'online' : 'offline';
  }

  get categoryDisplay() {
    return this.store_category.join(', ') || 'General';
  }

  canBid(amount) {
    return this.is_active && this.coins >= amount;
  }

  deductCoins(amount) {
    if (this.canBid(amount)) {
      this.coins -= amount;
      this.total_bids += 1;
      this.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  addSuccessfulBid() {
    this.successful_bids += 1;
    this.conversion_rate = this.total_bids > 0 ? (this.successful_bids / this.total_bids) : 0;
    this.updated_at = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      hushh_user_id: this.hushh_user_id,
      agent_name: this.agent_name,
      agent_email: this.agent_email,
      agent_phone: this.agent_phone,
      fcm_token: this.fcm_token,
      store_name: this.store_name,
      store_category: this.store_category,
      store_location: this.store_location,
      store_description: this.store_description,
      coins: this.coins,
      total_bids: this.total_bids,
      successful_bids: this.successful_bids,
      conversion_rate: this.conversion_rate,
      average_bid_amount: this.average_bid_amount,
      total_earnings: this.total_earnings,
      is_active: this.is_active,
      is_online: this.is_online,
      last_seen: this.last_seen,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  static fromJSON(data) {
    return new Agent(data);
  }
}

export default Agent;
