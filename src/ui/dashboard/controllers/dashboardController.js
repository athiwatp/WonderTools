import { shell, ipcRenderer } from 'electron';
import moment from 'moment';

// -----
//  DashboardController
// -----

class DashboardController {
  constructor($scope, $mdToast, BotClient) {
    this.botClient = BotClient;
    this.$mdToast = $mdToast;
    this.$scope = $scope;

    this.credentials = {
      username: this.botClient._config.username || '',
      password: this.botClient._config.password || '',
      channel: this.botClient._config.channel || ''
    };

    this.botLog = [];

    const chatMessageHandler = this.handleChatLog.bind(this);
    ipcRenderer.on('botClient:chatMessage', chatMessageHandler);
    $scope.$on('$destroy', () => {
      console.log('hi');
      ipcRenderer.removeListener('botClient:chatMessage', chatMessageHandler);
    });
  }

  // -----
  //  Properties
  // -----

  get canSetCredentials() {
    return this.botClient.isConnected !== true && this.credentialsForm.$dirty == true && this.credentialsForm.$invalid == false;
  }

  // -----
  //  Public
  // -----

  handleChatLog(event, args) {
    this.$scope.$apply(() => {
      console.log(args);
      
      this.botLog.unshift({ 
        username: args.username,
        color: args.color,
        text: args.text,
        time: moment().format('hh:mm')
      });
    });
  }

  openOAuthLink() {
    shell.openExternal('https://twitchapps.com/tmi/');
  }

  fixChannel() {
    if ( !this.credentials.channel.startsWith('#') ) {
      this.credentials.channel = `#${ this.credentials.channel }`;
    }
  }

  setCredentials() {
    const config = this.botClient._config;
    
    config.username = this.credentials.username;
    config.password = this.credentials.password;
    config.channel = this.credentials.channel;

    config.save()
      .then(() => {
        this.credentialsForm.$setPristine();

        this.$mdToast.show(
          this.$mdToast.simple()
            .textContent('Bot credentials set successfully!')
            .position('top right')
            .hideDelay(3000)
        );
      });
  }
};

// Exports
export default DashboardController;