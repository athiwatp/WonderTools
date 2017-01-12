import { remote } from 'electron';

import DashboardController from './dashboard/controllers/dashboardController.js';
import SideNavController from './sideNav/controllers/sideNavController.js';

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
  .constant('BotClient', remote.app.botClient)

  // Controllers
  .controller('SideNavController', SideNavController)
  .controller('DashboardController', DashboardController);