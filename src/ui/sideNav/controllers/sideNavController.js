// -----
//  SideNavController
// -----

class SideNavController {
  constructor($rootScope, BotClient) {
    this.$rootScope = $rootScope;
    this.botClient = BotClient;
  }

  // -----
  //  Properties
  // -----

  get isConnected() {
    return this.botClient.isConnected;
  }

  // -----
  //  Public
  // -----

  connectBot() {
    if ( this.botClient.isConnected ) {
      this.botClient.disconnect();
    }
    else {
      this.botClient.connect()
        .then(() => this.$rootScope.$apply());
    }
  }
}

// Exports
export default SideNavController;