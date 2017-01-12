(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var electron = require('electron');
var moment = _interopDefault(require('moment'));

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
    electron.ipcRenderer.on('botClient:chatMessage', chatMessageHandler);
    $scope.$on('$destroy', () => {
      console.log('hi');
      electron.ipcRenderer.removeListener('botClient:chatMessage', chatMessageHandler);
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
    electron.shell.openExternal('https://twitchapps.com/tmi/');
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

// Module
angular.module('wonderTools', [ 'ui.router', 'ngMaterial' ])
  // Config
  .config([ '$mdThemingProvider', '$stateProvider', '$urlRouterProvider', 
    ($mdThemingProvider, $stateProvider, $urlRouterProvider) => {
      $urlRouterProvider.otherwise('/');

      // States
      $stateProvider.state('dashboard', {
        url: '/',
        controller: 'DashboardController as $ctrl',
        templateUrl: 'dashboard/dashboard.html'
      });

      // Setup Theme
      $mdThemingProvider.theme('default')
        .primaryPalette('brown')
        .accentPalette('deep-purple')
        .warnPalette('deep-orange');
    }
  ])

  // Constants
  .constant('BotClient', electron.remote.app.botClient)

  // Controllers
  .controller('SideNavController', SideNavController)
  .controller('DashboardController', DashboardController);
}());
//# sourceMappingURL=ui.js.map