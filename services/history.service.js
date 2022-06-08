// Singleton service to store the past activities
class HistoryService {
  constructor() {
    this.history = [];
    this.numberOfHistoryItems = 100;
  }

  getHistory() {
    return this.history;
  }

  setNumberOfHistoryItems(number) {
    this.numberOfHistoryItems = number;
  }

  addItemToHistory(item){
    const historyItem = {
      ...item
    };

    historyItem.date = Date.now();

    this.history.push(historyItem);
    if (this.history.length > this.numberOfHistoryItems) {
      this.history.splice(this.history.length - 100, 100);
    }
  }
}

export default HistoryService
