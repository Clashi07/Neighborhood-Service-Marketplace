export class User {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.role = data.role || 'customer';
    this.profilePhoto = data.profilePhoto || 'default-avatar.png';
    this.isEmailVerified = data.isEmailVerified || false;
    this.isActive = data.isActive || true;
    this.createdAt = data.createdAt || new Date();
  }

  isCustomer() {
    return this.role === 'customer';
  }

  isProvider() {
    return this.role === 'provider';
  }

  isAdmin() {
    return this.role === 'admin';
  }

  getDisplayName() {
    return this.name || this.email;
  }
}