var app = angular.module('starter', ['ionic', 'ngCordova', 'uiGmapgoogle-maps', 'monospaced.elastic', 'timer']);

// Google Maps config
app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization,places'
    });
});

// Page routes
app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.navBar.alignTitle('center');
    $stateProvider
        .state('menu', {
            url: '/menu',
            templateUrl: 'templates/menu.html',
            controller: 'pizzaList'
        })
        .state('custom', {
            url: '/custom/:customId',
            templateUrl: 'templates/customPizza.html',
            controller: 'editItem'
        })
        .state('cart', {
            url: '/cart',
            templateUrl: 'templates/cart.html',
            controller: 'cart'
        })
        .state('cart.id', {
            url: '/:cartId',
            views: {
                '@': {
                    templateUrl: 'templates/edit_order.html',
                    controller: 'cart'
                }
            }
        })
        .state('register', {
            url: '/register',
            templateUrl: 'templates/register.html',
            controller: 'phoneVerification'
        })
        .state('confirm', {
            url: '/confirm',
            templateUrl: 'templates/confirm.html',
            controller: 'phoneVerification'
        })
        .state('signin', {
            url: '/signin',
            templateUrl: 'templates/signin.html',
            controller: 'phoneVerification'
        })
        .state('location', {
            url: '/location',
            templateUrl: 'templates/location.html',
            controller: 'MapController'
        })
        .state('detail_order', {
            url: '/detailOrder/:id',
            templateUrl: 'templates/detail_order.html',
            controller: 'DetailOrder'
        })
        .state('no_connection', {
            url: '/no_connection',
            templateUrl: 'templates/connection.html',
            controller: 'connection'
        });

    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.scrolling.jsScrolling(false);

});


// directive for auto-capitalizaton text inpute
app.directive('capitalize', function($parse) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var capitalize = function(inputValue) {
                if (inputValue === undefined) {
                    inputValue = '';
                }
                var capitalized = inputValue.charAt(0).toUpperCase() +
                    inputValue.substring(1);
                if (capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            }
            modelCtrl.$parsers.push(capitalize);
            capitalize($parse(attrs.ngModel)(scope)); // capitalize initial value
        }
    };
});


app.directive('disableTap', function($timeout) {
    return {
        link: function() {
            $timeout(function() {
                // Find google places div
                _.findIndex(angular.element(document.querySelectorAll('.pac-container')), function(container) {
                    // disable ionic data tab
                    container.setAttribute('data-tap-disabled', 'true');
                    // leave input field if google-address-entry is selected
                    container.onclick = function() {
                        document.getElementById('pac-input').blur();
                    };
                });
            }, 500);
        }
    };
});


app.run(function($ionicPlatform, $state, $localstorage, $ionicScrollDelegate, $ionicPopup) {

    var signedSession = $localstorage.getObject('signed');
    var verifiedSession = $localstorage.getObject('verified');

    $ionicPlatform.ready(function() {
        
        /*var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        

        if (states[networkState] == states[Connection.NONE]) {
            $state.go('no_connection');
            if (window.StatusBar) {
                StatusBar.hide();
            }
        } else {*/
        // check if location service is enabled
        /*cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
            if (!enabled) {

                var alertPopup = $ionicPopup.alert({
                    title: 'Turn on your location service to allow Slice to determine your location',
                    template: "<center>This will make it much easier to deliver your pizza</center>"
                });

                alertPopup.then(function() {
                    settings.openSettings();
                });

            }
        }, function(error) {
            alert("The following error occurred: " + error);
        });*/

        setTimeout(function() {
            //navigator.splashscreen.hide();    
        }, 100);

        $('.menu-pizza').removeClass('slideOutUp');
        $('.menu-pizza').removeClass('slideInDown');

        // Check user sessions if exists
        if (signedSession == null) {
            $state.go('register');
        } else {
            if (signedSession.status == false) {
                $state.go('signin');
            } else {
                if (verifiedSession) {
                    $state.go('menu');
                } else {
                    $state.go('confirm');
                }
            }
        }

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            //cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            StatusBar.hide();
        }



        // }

    });
});
