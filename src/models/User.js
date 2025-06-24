// User Model
export class User {
  constructor(data = {}) {
    this.hushh_id = data.hushh_id || '';
    this.first_name = data.first_name || '';
    this.last_name = data.last_name || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone_number = data.phone_number || '';
    this.gender = data.gender || '';
    this.city = data.city || '';
    this.country = data.country || '';
    this.user_coins = data.user_coins || 0;
    this.fcmToken = data.fcmToken || '';
    this.avatar = data.avatar || '';
    this.accountCreation = data.accountCreation || new Date().toISOString();
    this.is_hushh_app_user = data.is_hushh_app_user || false;
  }

  get fullName() {
    return this.name || `${this.first_name} ${this.last_name}`.trim();
  }

  get displayName() {
    return this.fullName || this.email || this.phone_number;
  }

  toJSON() {
    return {
      hushh_id: this.hushh_id,
      first_name: this.first_name,
      last_name: this.last_name,
      name: this.name,
      email: this.email,
      phone_number: this.phone_number,
      gender: this.gender,
      city: this.city,
      country: this.country,
      user_coins: this.user_coins,
      fcmToken: this.fcmToken,
      avatar: this.avatar,
      accountCreation: this.accountCreation,
      is_hushh_app_user: this.is_hushh_app_user
    };
  }

  static fromJSON(data) {
    return new User(data);
  }
}

export default User;
