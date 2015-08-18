// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
 moneyTracker=angular.module('moneyTracker', ['ionic', 'moneyTracker.controllers','ngCordova','ngMessages','ionic-datepicker']);

moneyTracker.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});

moneyTracker.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
    cache: false,
  url: '/login',
  templateUrl: 'templates/login.html',
  controller: 'AppLogin'
})

 .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'

  })
  .state('app.logout', {
    cache: false,
  url: '/logout',
  views: {
    'menuContent': {

      controller: 'logout'
    }
  }

  })

  .state('app.dashboard', {
    cache: false,
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'dashboardController'
      }
    }
  })
  .state('app.categories', {
             cache: false,
              url: '/categories',
              views: {
                'menuContent': {
                  templateUrl: 'templates/categories.html',
                  controller: 'CategoriesController'
                }
              }

  })
  .state('app.categoryadd', {
              url: '/categoryadd',
              views: {
                'menuContent': {
                  templateUrl: 'templates/categoryadd.html',
                  controller: 'CategoriesController'
                }
              }

  })
  .state('app.catSingle', {
              url: '/categories/:categoryId',
              views: {
                'menuContent': {
                  templateUrl: 'templates/categoryedit.html',
                  controller: 'CategoryController'
                }
              }

  })
  .state('app.budgets', {
             cache: false,
              url: '/budgets',
              views: {
                'menuContent': {
                  templateUrl: 'templates/budgets.html',
                  controller: 'budgetsController'
                }
              }

  })
  .state('app.budgetadd', {
              url: '/budgetadd',
              views: {
                'menuContent': {
                  templateUrl: 'templates/budgetadd.html',
                  controller: 'budgetsController'
                }
              }

  })
  .state('app.budSingle', {
              url: '/budgets/:budgetId',
              views: {
                'menuContent': {
                  templateUrl: 'templates/budgetedit.html',
                  controller: 'budgetController'
                }
              }

  })
  .state('app.trans', {
             cache: false,
              url: '/trans',
              views: {
                'menuContent': {
                  templateUrl: 'templates/transactions.html',
                  controller: 'transController'
                }
              }

  })
  .state('app.transadd', {
    cache: false,
              url: '/transadd',
              views: {
                'menuContent': {
                  templateUrl: 'templates/transactionadd.html',
                  controller: 'transController'
                }
              }

  })
  .state('app.transSingle', {
              url: '/trans/:transid',
              views: {
                'menuContent': {
                  templateUrl: 'templates/transactionedit.html',
                  controller: 'tranController'
                }
              }

  })
  .state('app.abouts', {
              url: '/abouts',
              views: {
                'menuContent': {
                  templateUrl: 'templates/abouts.html'

                }
              }

  })
  .state('app.settings', {
    cache: false,
              url: '/settings',
              views: {
                'menuContent': {
                  templateUrl: 'templates/settings.html',
                  controller: 'settingsController'
                }
              }

  })
  .state('app.reports', {
      cache: false,
              url: '/reports',
              views: {
                'menuContent': {
                  templateUrl: 'templates/reports.html',
                  controller: 'reportController'
                }
              }

  })
  .state('app.changeaccess', {
      cache: false,
              url: '/changeaccess',
              views: {
                'menuContent': {
                  templateUrl: 'templates/changeaccess.html',
                  controller: 'changeaccessController'
                }
              }

  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
