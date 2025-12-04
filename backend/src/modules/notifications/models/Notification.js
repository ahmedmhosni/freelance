/**
 * Notification Domain Model
 */
class Notification {
  constructor(data) {
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.date = data.date;
    this.priority = data.priority || 'normal';
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return {
      type: this.type,
      title: this.title,
      message: this.message,
      date: this.date,
      priority: this.priority,
      metadata: this.metadata
    };
  }
}

module.exports = Notification;
