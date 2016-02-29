// SMS Verification
app.controller('phoneVerification', function($scope, $state, $ionicScrollDelegate, PhoneVerification, $localstorage, $ionicLoading, $ionicPopup, ApiServer, $http) {
    $scope.authLogo = {
        src: 'img/logo.png'
    }

    $scope.sendNumber = function(getNumber, fname, lname) {

        if (!getNumber) {
            $ionicPopup.alert({
                template: 'You have to type your phone number'
            });
        } else if (!fname) {
            $ionicPopup.alert({
                template: 'First name is required'
            });
        } else if (!lname) {
            $ionicPopup.alert({
                template: 'Last name is required'
            });
        } else {

            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
            });

            console.log(getNumber);

            PhoneVerification
                .getCode(getNumber, fname, lname).then(function(response) {

                    //response is an array of objects
                    var status = response.data.success;
                    var msg = response.data.message;

                    // slice 0 on phone
                    var number = getNumber.toString();
                    var phoneNumber = number.slice(1);

                    if (status == false) {
                        $ionicLoading.hide();

                        $ionicPopup.alert({
                            template: '<center>' + msg + '</center>'
                        });
                    } else {
                        PhoneVerification.number = phoneNumber;

                        // saving on local storage
                        $localstorage.setObject('auth', {
                            phone: phoneNumber
                        });

                        $localstorage.setObject('name', {
                            fname: fname,
                            lname: lname
                        });

                        $localstorage.setObject('signed', {
                            status: true
                        });

                        // go to next page
                        $ionicLoading.hide();
                        $state.go('confirm');
                    }

                }, function(err) {
                    $ionicLoading.hide();

                    //Something went wrong!
                    $ionicPopup.alert({
                        template: '<center>ERROR: ' + msg + '</center>'
                    });
                });
        }
    };


    $scope.backToRegister = function(number) {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        var link = ApiServer.set('live') + '/deactivate';

        $http.post(link, {
            phone: number
        }).then(function(res) {
            if (res.data.success == true) {
                // go to register page
                $localstorage.flush();
                $ionicLoading.hide();
                $state.go('register');
            } else {
                // stop loading..
                $ionicLoading.hide();

                var status = 'ERROR';
                var strings = res.data.message;
                var alertPopup = $ionicPopup.alert({
                    title: status,
                    template: '<center>' + strings + '</center>'
                });
            }
        });
    };


    $scope.goVerify = function(confirm_code) {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        // get phone number on local storage
        var session = $localstorage.getObject('auth');
        var savedNumber = session.phone;
        var fName = session.fName;
        var lName = session.lName;
        var getCode = confirm_code;

        PhoneVerification
            .getVerify(savedNumber, getCode).then(function(response) {

                //response is an array of objects
                var status = response.data.success;
                var msg = response.data.message;

                if (status == false) {

                    $scope.response = msg;
                    $ionicLoading.hide();

                } else {

                    // saving on local storage
                    $localstorage.setObject('verified', {
                        status: true
                    });

                    // go to main page
                    $state.go('menu');

                    $ionicLoading.hide();
                }
            }, function(err) {
                //Something went wrong!
                $ionicLoading.hide();
                $scope.response = "ERROR: " + err;
            });
    };


    $scope.resendCode = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        // get phone number on local storage
        var session = $localstorage.getObject('auth');
        var getNumber = '0' + session.phone;
        var name = $localstorage.getObject('name');
        var fname = name.fname;
        var lname = name.lname;

        PhoneVerification
            .getCode(getNumber, fname, lname).then(function(response) {

                //response is an array of objects
                var status = response.data.success;
                var msg = response.data.message;

                // slice 0 on phone
                //var number = getNumber.toString();
                //var phoneNumber = number.slice(1);

                if (status == false) {
                    $ionicLoading.hide();

                    $ionicPopup.alert({
                        template: '<center>' + msg + '</center>'
                    });
                } else {
                    PhoneVerification.number = getNumber;

                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        template: '<center>Your verification code has been sent.</center>'
                    });
                }

            }, function(err) {
                $ionicLoading.hide();

                //Something went wrong!
                $ionicPopup.alert({
                    template: '<center>ERROR: ' + msg + '</center>'
                });
            });

    }

    $scope.signIn = function(getNumber) {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        PhoneVerification
            .getSignIn(getNumber).then(function(response) {

                //response is an array of objects
                var status = response.data.success;
                var msg = response.data.message;

                if (status == false) {
                    $scope.response = msg;
                    $ionicLoading.hide();
                } else {
                    PhoneVerification.number = getNumber;

                    // saving on local storage
                    $localstorage.setObject('signed', {
                        status: true
                    });

                    // go to next page
                    $ionicLoading.hide();
                    $state.go('confirm');
                }
            }, function(err) {
                //Something went wrong!
                $scope.response = "ERROR: " + err;
                $ionicLoading.hide();
            });
    }


});

// Order handler
app.controller("editItem", function($scope, $rootScope, $state, $stateParams, $localstorage, CartService, LoadPizzas) {

    $scope.kFormatter = function(num) {
        return num > 999 ? (num / 1000).toFixed(0) + 'k' : num
    }

    LoadPizzas.success(function(data) {
        $scope.id = $stateParams.customId;
        $scope.customPizzas = data[$scope.id];
        $scope.crusts = [];
        $scope.cheeses = [];
        $scope.sauces = [];
        $scope.toppings = [];
        $scope.selectIdCrust = [];
        $scope.sizeTypes = [];

        angular.forEach($scope.customPizzas.crust, function(index) {
            $scope.crusts.push(index);
        });
        angular.forEach($scope.customPizzas.cheese, function(index) {
            $scope.cheeses.push(index);
        });
        angular.forEach($scope.customPizzas.sauce, function(index) {
            $scope.sauces.push(index);
        });
        angular.forEach($scope.customPizzas.topping, function(index) {
            $scope.toppings.push(index);
        });
        angular.forEach($scope.customPizzas.sizeType, function(index) {
            $scope.sizeTypes.push(index);
        });


        $scope.select = {
            crust: $scope.crusts[0].id,
            sizeType: $scope.sizeTypes[0].id,
        }

        for (var i = 0; i < $scope.crusts.length; i++) {
            $scope.selectIdCrust.push($scope.crusts[i].id);
            //console.log($scope.crusts[i].id);
        };

        $scope.customPizzas.price = $scope.customPizzas.price_;
        var pizzaPrices = parseInt($scope.customPizzas.price);

        $scope.onSizeChange = function(value) {

            if ($scope.select.sizeType == 'Regular') {

                $scope.customPizzas.price = pizzaPrices;

            } else if ($scope.select.sizeType == 'Large') {

                $scope.customPizzas.price = parseInt($scope.customPizzas.price) + 20000;

            };

        };


        $scope.addItem = function(item, crust, sizeType, specialRequest) {

            $('.btn-cart').show();

            var quantity = 1;
            var priceLargeNum = parseInt($scope.customPizzas.price);

            CartService.items.push({
                name: item,
                itemPrice: pizzaPrices,
                price: priceLargeNum,
                crust: crust,
                size: sizeType,
                allCrust: $scope.customPizzas.crust,
                quantity: quantity,
                request: specialRequest,
                allIdCrust: $scope.selectIdCrust,
                allSizeType: $scope.customPizzas.sizeType
            });

            $state.go('menu');
            $rootScope.openCartModal();
        };
    });
})

app.controller('showMessages', function($scope, $ionicLoading, $timeout) {
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        $('.menu-pizza').removeClass('slideOutUp');
    });
});


app.controller('pizzaList', function($rootScope, $cordovaGeolocation, $scope, $state, $stateParams, $localstorage, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicPosition, $ionicModal, $ionicPopup, $ionicLoading, $localstorage, $http, $q, $ionicViewSwitcher, $ionicHistory, $compile, LoadPizzas, LoadDrinks, CartService, ApiServer, UserService, GetLatLong, CountDownTimer) {

    // show the loading page
    $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Preparing Slice...'
    });

    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.viewColor = '#f6cc4c';
    });

    $scope.videoUrl = {
        src: 'img/bg-intro.mp4'
    }

    $scope.authLogo = {
        src: 'img/logo.png'
    }

    var $this = this;

    var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
    };


    // Menu CSS
    $rootScope.slideInMenu = function() {
        $('.menu-pizza').addClass('slideOutUp');
        $('.menu-pizza').removeClass('slideInDown');
        $('.menu-pizza').attr('data-id', '0');
        $('.btn-menu i').addClass('ion-navicon');
        $('.btn-menu i').removeClass('ion-ios-close-empty');
    }

    $rootScope.slideUpMenu = function() {
        $('.menu-pizza').addClass('slideInDown');
        $('.menu-pizza').removeClass('slideOutUp');
        $('.menu-pizza').attr('data-id', '1');
        $('.btn-menu i').addClass('ion-ios-close-empty');
        $('.btn-menu i').removeClass('ion-navicon');
    }


    // INITIATING ALL MODALS //////////////////////////////////
    // CART modal
    $ionicModal.fromTemplateUrl('templates/connection.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $rootScope.connectionModal = modal;
    });

    // CART modal
    $scope.initCartModal = function() {
        if ($scope.modal) {
            return $q.when();
        } else {
            return $ionicModal.fromTemplateUrl('templates/cart.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.cartModal = modal;
            });
        }
    };

    // EDIT CART modal
    $ionicModal.fromTemplateUrl('templates/edit_order.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $rootScope.editModal = modal;
    });


    // SUMMARY modal
    $scope.initSummaryModal = function() {
        if ($scope.modal) {
            return $q.when();
        } else {
            return $ionicModal.fromTemplateUrl('templates/summary.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.summaryModal = modal;
            });
        }
    };

    // ADDRESS Modal
    $scope.initAddressModal = function() {
        if ($scope.modal) {
            return $q.when();
        } else {
            return $ionicModal.fromTemplateUrl('templates/address.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.addressModal = modal;
            });
        }
    }

    // ORDERS Modal
    $scope.initOrdersModal = function() {
        if ($scope.modal) {
            return $q.when();
        } else {
            return $ionicModal.fromTemplateUrl('templates/orders.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.ordersModal = modal;
            });
        }
    }

    // ORDERS Modal
    $scope.initAddressSummaryModal = function() {
        if ($scope.modal) {
            return $q.when();
        } else {
            return $ionicModal.fromTemplateUrl('templates/full_address.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.addressSummaryModal = modal;
            });
        }
    }

    // HELP modal
    $ionicModal.fromTemplateUrl('templates/help.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.helpModal = modal;
    });

    // LOCATION SERVICE modal
    $ionicModal.fromTemplateUrl('templates/location_service.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $rootScope.locationService = modal;
    });

    $ionicModal.fromTemplateUrl('templates/profile.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.profileModal = modal;
    });


    $ionicModal.fromTemplateUrl('templates/drink.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.drinkModal = modal;
    });

    // FINISH INITIATING MODALS ////////////////////////////////////

    // read current url and save into session

    $_height = $(window).height();
    $('.intro-app').css('height', $_height);

    // Read OPEN_ADDRESS_SUMMARY action if there is any
    if ($localstorage.getObject('open_address_summary')) {
        $scope.initAddressSummaryModal().then(function() {
            $scope.addressSummaryModal.show();
            $ionicLoading.hide();
            $localstorage.remove('open_address_summary');
        });
    }

    if ($localstorage.getObject('orders')) {
        $('.btn-cart').show();
    } else {
        $('.btn-cart').hide();
    }


    var phoneNumber = $localstorage.get('auth');
    if (phoneNumber) {
        var resPhone = phoneNumber.phone;
    }

    var link = ApiServer.set('live');

    $rootScope.signOut = function() {
        var signOutPopup = $ionicPopup.confirm({
            template: '<center>Are you sure want to sign out?<br/>You have to re-verify your phone number once you signed out</center>',
            cancelText: 'CANCEL',
            okText: 'SIGN ME OUT',
        });

        signOutPopup.then(function(res) {
            if (res) { // if want to make order
                $http.post(link)
                    .then(function(response) {
                        if (response.success == false) {
                            alert(response.message);
                        } else {
                            // dummy clear session
                            $localstorage.setObject('verified', {
                                status: false
                            });

                            $localstorage.setObject('signed', {
                                status: false
                            });

                            $state.go('signin');
                        };
                    })

                $rootScope.slideInMenu();

            } else { // if not :)
                console.log('Cancel sign out :)');
            }
        });
    }

    $rootScope.kFormatter = function(num) {
        return num > 999 ? (num / 1000).toFixed(0) + 'k' : num
    }

    // Load all pizza from service
    LoadPizzas.success(function(data) {
        $scope.pizzaNames = data;
        $ionicSlideBoxDelegate.update();

        $scope.ingredient = [];

        /////// ----- Generate Pager for Menu Page ----- //////
        var pager = '<span class="slider-pager-page pagerCustom pagerCustom0" data-id="0"><i class="icon ion-record"></i></span>';

        var pagerLength = $scope.pizzaNames.length;

        for (var i = 1; i < $scope.pizzaNames.length; i++) {
            pager += '<span class="slider-pager-page pagerCustom pagerCustom' + i + '" data-id="' + i + '"><i class="icon ion-record"></i></span>';
            $scope.ingredient.push($scope.pizzaNames[i].ingredient);
        };

        pager += '<span class="slider-pager-page pagerCustom pagerCustom' + pagerLength + '" data-id="' + pagerLength + '"><i class="icon ion-record"></i></span>';

        $scope.ingredientByIndex = $scope.ingredient[0];

        $scope.openPizzaMenu = function() {
            $ionicSlideBoxDelegate.slide(1);
        };

        $scope.openDrinkMenu = function() {
            $ionicScrollDelegate.$getByHandle('drinkScroll').scrollBy('top', $rootScope.imgHeight.height, true);
        }

        ////// Generate Home Page Button  //////
        var divTemplateHome = '<a href="#" ng-click="openPizzaMenu()"><button class="button button-block button-positive activated add_pizza_btn btn">OUR MENU TODAY</button></a><div class="slider-pager" style="bottom: 73px;z-index: 0;display:none">' + pager + '</div>';
        var tempHome = $compile(divTemplateHome)($scope);


        //// ---- Generate Button Add Pizza Sticky Bottom ---- /////
        $('.menu-content').append(tempHome);

        ////// ----- End Generate Pager for Menu Page ----- /////

        $scope.slideChanged = function(index) {

            setTimeout(function() {
                $ionicScrollDelegate.scrollTop(true);
            }, 200);

            var index = index;

            $rootScope.slideIndex = index;

            $('.menu-content a').remove();

            var newIndex = index - 1;
            var endIndex = pagerLength + 1;
            //// Add and remove class active on slide pager when slide changed ////
            if (newIndex == 0) {
                $('.pagerCustom').removeClass('active');
                $('.pagerCustom0').addClass('active');
            } else {
                $('.pagerCustom').removeClass('active');
                $('.pagerCustom' + newIndex).addClass('active');
            }

            if (index > 0 && index < endIndex) {
                $('.slider-pager').fadeIn();
                $('.menu-content .add_btn_box').remove();
                $('.menu-content').append('<div class="add_btn_box"><a href="#/custom/' + newIndex + '"><button class="button button-block button-positive activated add_pizza_btn btn">ADD PIZZA - IDR ' + $rootScope.kFormatter($scope.pizzaNames[newIndex].price_) + '</button></a></div>');
                $('.show-drink-menu').fadeOut();

                ////// hide page slide when scroll top more than 50 /////
                var scrollIndex = index - 1;
                $scope.gotScrolled = function() {
                    var scrollTopVal = $ionicScrollDelegate.$getByHandle('contentScroll' + scrollIndex).getScrollPosition().top;
                    if (scrollTopVal > 50) {
                        $('.slider-pager').fadeOut();
                    } else {
                        $('.slider-pager').fadeIn();
                    }
                };

            } else if (index == 0) {
                $('.slider-pager').fadeOut();
                $('.menu-content').append(tempHome);
                $('.menu-content .add_btn_box').remove();
            } else {
                $('.show-drink-menu').fadeIn();
                $('.add_btn_box').remove();

                ////// hide page slide when scroll top more than 50 /////
                $scope.gotScrolled = function() {
                    var scrollTopVal = $ionicScrollDelegate.$getByHandle('drinkScroll').getScrollPosition().top;
                    if (scrollTopVal > 50) {
                        $('.slider-pager').fadeOut();
                    } else {
                        $('.slider-pager').fadeIn();
                    }
                };
            }



            return index;
        };

        /// CSS Height for Image Slider Background  ///

        var windowHeight = $(window).height();
        $rootScope.imgHeight = {
            height: windowHeight
        };


    });


    $scope.cheese = {};
    $scope.sauce = '';
    $scope.toppings = {};


    // OPEN MENU SLIDE
    $rootScope.menus = function() {

        var menuPizzaAttr = $('.menu-pizza').attr('data-id');
        if (menuPizzaAttr == 0) {
            $rootScope.slideUpMenu();
        } else if (menuPizzaAttr == 1) {
            $rootScope.slideInMenu();
        } else {
            $('.menu-pizza').removeClass('slideOutUp');
        }
    }

    // add address button
    $scope.addAddress = function() {

        //$scope.closeAddressModal();
        if ($scope.addressModal) {
            console.log('Removing any active ADDRESS modal!');
            $scope.addressModal.hide();
        }

        if ($scope.cartModal) {
            console.log('Removing any active CART modal!');
            $scope.cartModal.remove();
        }

        $state.go('location');


        /*cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
            if (!enabled) {

                var alertPopup = $ionicPopup.alert({
                    title: 'Turn on your location service to allow Slice to determine your location',
                    template: "<center>This will make it much easier to deliver your pizza</center>"
                });

                alertPopup.then(function() {
                    settings.openSettings();
                });
                $rootScope.openLocationServiceModal();
         
            } else {
                $rootScope.closeLocationServiceModal();
                $scope.addressModal.hide();
                $state.go('location');
            }
        }, function(error) {
            alert("The following error occurred: " + error);
        });*/


    }

    var ordered = CartService.items;



    //////////////////////////////////
    ///// ----- Cart Modal ----- /////
    //////////////////////////////////

    function invisibleOptionBtn() {
        $('.item-options').addClass('invisible');
        $('.item-content').css('transform', 'translate3d(0, 0, 0)');
    };

    $rootScope.initialize = function() {
        //console.log(defaultAddressSession);
        GetLatLong.lat = $scope.defaultAddressSession.latitude;
        GetLatLong.long = $scope.defaultAddressSession.longitude;

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {

            var myLatLng = {
                lat: GetLatLong.lat,
                lng: GetLatLong.long
            };

            var lating = new google.maps.LatLng(GetLatLong.lat, GetLatLong.long)
            var mapOptions = {
                center: lating,
                zoom: 15
            };

            var map = new google.maps.Map(document.getElementById('map'), mapOptions);

            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map
            });

            map.setOptions({
                draggable: false,
                zoomControl: false,
                scrollwheel: false,
                disableDoubleClickZoom: true
            });


        }, function(err) {
            // error
        });
    }


    $scope.setFavAddress = function(uid) {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        $state.go('menu');

        var phoneNumber = JSON.parse($localstorage.get('auth'));
        var phoneSession = phoneNumber.phone;

        $http.get(link + "/user/address?type=list&phone=" + phoneSession).then(function(response) {
            // filtering the chosen address\
            $scope.addressModal.hide();

            if (response.data != null) {
                angular.forEach(response.data.address, function(value) {
                    if (value['uid'] == uid) {
                        $localstorage.setObject('default-address', value);
                        console.log('Save fav address into session: ', value.address);
                    }
                })
            }

            $rootScope.openCartModal();

            $ionicLoading.hide();
        }, function(error) {
            return error;
        });

    }


    $rootScope.openCartModal = function() {

        // show the loading page
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Preparing Your Cart...',
            showBackdrop: false
        });

        // update ORDERS session everytime modal-cart opens
        if (CartService.items.length < 1 && CartService.drinks.length < 1) {
            $localstorage.remove('orders');
        } else {
            $localstorage.setObject('orders', {
                pizzas: CartService.items,
                drinks: CartService.drinks
            });
        }

        if ($scope.cartModal) {
            console.log('There is an active CART modal. Going to destroy it!')
            $scope.cartModal.remove();
        }

        $scope.initCartModal().then(function() {
            $scope.cartModal.show();
        });
        var session = $localstorage.getObject("auth");
        var phoneSession = session.phone;

        // Set default address from session >> used on CART MODAL
        var defaultAddressSession = $localstorage.getObject('default-address');

        if (!defaultAddressSession) {
            var posOptions = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            };

            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;

                // Get the static map
                $scope.staticMap = "https://maps.google.com/maps/api/staticmap?center=" + lat + "," + long + "&zoom=15&size=375x142&sensor=false&markers=" + lat + "," + long;

            });

            $scope.cartAddress = 'Tap here to set your address';

        } else {
            var address = defaultAddressSession.address;
            var number = defaultAddressSession.number;
            $scope.cartAddress = address + ' ' + number;

            GetLatLong.lat = defaultAddressSession.latitude;
            GetLatLong.long = defaultAddressSession.longitude;

            // Get the static map
            $scope.staticMap = "https://maps.google.com/maps/api/staticmap?center=" + GetLatLong.lat + "," + GetLatLong.long + "&zoom=15&size=375x142&sensor=false&markers=" + GetLatLong.lat + "," + GetLatLong.long;
        }

        // Displaying items
        $scope.items = CartService.items;
        $scope.drinks = CartService.drinks;

        // Calculating total price
        var totalPrice = 0;

        angular.forEach($scope.items, function(value) {
            totalPrice += parseInt(value.price);
        })

        angular.forEach($scope.drinks, function(value) {
            totalPrice += parseInt(value.price) * parseInt(value.qty);
        })

        //$scope.closeAddressModal();
        $ionicLoading.hide();


        //// hide cart and drinks button function
        $rootScope.hideCartButton = function() {
            if (CartService.items.length <= 0 && CartService.drinks.length <= 0) {
                console.log('Hiding cart button');
                $('.btn-cart').hide();
            } else {
                console.log('Showing cart button');
                $('.btn-cart').show();
            }
        }

        $scope.onItemDelete = function(item) {
            $scope.totalPrice -= parseInt(item.price);
            $scope.items.splice($scope.items.indexOf(item), 1);
            if (CartService.items.length < 1 && CartService.drinks.length < 1) {
                $rootScope.hideCartButton();
            }

            CartService.items = $scope.items;
        };

        $scope.onItemDeleteDrink = function(drink) {

            $scope.totalPrice -= parseInt(drink.price) * parseInt(drink.qty);
            $scope.drinks.splice($scope.drinks.indexOf(drink), 1);

            if (CartService.items.length < 1 && CartService.drinks.length < 1) {
                $rootScope.hideCartButton();
            }

            CartService.drinks = $scope.drinks;
        };


        $scope.increasePizza = function(index, item) {
            $scope.items[index].quantity += 1;
            var price = parseInt(item.itemPrice);

            if (item.size == "Regular") {
                var price = parseInt(item.itemPrice);
            } else if (item.size == "Large") {
                var price = parseInt(item.itemPrice) + 20000;
            };

            $scope.items[index].price = parseInt($scope.items[index].price) + price;

            // Calculating total price
            var totalPrice = 0;
            angular.forEach($scope.items, function(value) {
                //console.log(value.price);
                totalPrice += parseInt(value.price);
            })

            angular.forEach($scope.drinks, function(value) {
                //console.log(value.price*value.qty);
                totalPrice += parseInt(value.price) * parseInt(value.qty);
            })

            $scope.totalPrice = totalPrice;

        };



        $scope.decreasePizza = function(index, item) {
            $scope.items[index].quantity -= 1;

            if (item.size == "Regular") {
                var price = parseInt(item.itemPrice);
            } else if (item.size == "Large") {
                var price = parseInt(item.itemPrice) + 20000;
            };

            $scope.items[index].price = parseInt($scope.items[index].price) - price;

            if ($scope.items[index].quantity < 1) {
                $scope.items[index].quantity = 1;
                $scope.items[index].price = price;
            }
            // Calculating total price
            var totalPrice = 0;
            angular.forEach($scope.items, function(value) {
                //console.log(value.price);
                totalPrice += parseInt(value.price);
            })

            angular.forEach($scope.drinks, function(value) {
                //console.log(value.price*value.qty);
                totalPrice += parseInt(value.price) * parseInt(value.qty);
            })

            $scope.totalPrice = totalPrice;
        };

        $scope.increaseDrink = function(index, drink) {
            $scope.drinks[index].qty += 1;

            var totalPrice = 0;
            angular.forEach($scope.drinks, function(value) {
                //console.log(value.price*value.qty);
                totalPrice += parseInt(value.price) * parseInt(value.qty);
            })

            angular.forEach($scope.items, function(value) {
                //console.log(value.price);
                totalPrice += parseInt(value.price);
            })

            $scope.totalPrice = totalPrice;

        }

        $scope.decreaseDrink = function(index, drink) {
            $scope.drinks[index].qty -= 1;
            if ($scope.drinks[index].qty < 1) {
                $scope.drinks[index].qty = 1;
            }

            var totalPrice = 0;
            angular.forEach($scope.drinks, function(value) {
                //console.log(value.price*value.qty);
                totalPrice += parseInt(value.price) * parseInt(value.qty);
            })

            angular.forEach($scope.items, function(value) {
                //console.log(value.price);
                totalPrice += parseInt(value.price);
            })

            $scope.totalPrice = totalPrice;
        }

        $scope.totalPrice = totalPrice;

        $scope.finishOrder = function() {

            var defaultAddressSession = $localstorage.getObject('default-address');
            if (!defaultAddressSession) {
                var alertPopup = $ionicPopup.alert({
                    template: '<center>You Don\'t have default address yet.<br/>Please set an address first</center>'
                });
            } else if ($scope.items.length == 0 && $scope.drinks.length == 0) { // check if user is ordering something or not
                var alertPopup = $ionicPopup.alert({
                    template: '<center>Your Cart is Empty</center>'
                });
            } else if ($scope.items.length == 0 && $scope.drinks.length > 0) {
                var alertPopup = $ionicPopup.alert({
                    template: '<center>You have to order minimum 1 pizza</center>'
                });
            } else if ($scope.items.length > 0) { // user's cart is not empty
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Processing your order...'
                });

                var authSession = $localstorage.getObject('auth');
                var phoneSession = authSession.phone;
                var orderSession = $localstorage.getObject('orders');
                var addressSession = $localstorage.getObject('default-address');

                // SENDING ORDER !!!
                var random = Math.floor(Math.random() * 900000);
                var date = Date.now();
                var pizzas = $scope.items;
                var drinks = $scope.drinks;
                var total = 0;

                angular.forEach(pizzas, function(value) {
                    total = total + parseInt(value['price']);
                })

                angular.forEach(drinks, function(value) {
                    total = total + (parseInt(value.price) * parseInt(value.qty));
                })

                var link = ApiServer.set('live') + '/orders';

                $http.post(link, {
                    phone: phoneSession,
                    order_date: date,
                    order_no: random,
                    total: total,
                    pizza: pizzas,
                    drink: drinks,
                    address: addressSession.address,
                    number: addressSession.number,
                    addAddress: addressSession.addAddress,
                    longitude: addressSession.longitude,
                    latitude: addressSession.latitude
                }).then(function(res) {

                    if (res.data.success == true) {

                        $('.btn-cart').hide();

                        // delete session order
                        $localstorage.remove('orders');
                        $localstorage.remove('from_cart');

                        $localstorage.setObject('orders-finish', {
                            order: res.data.message
                        });

                        // emptying cart items
                        CartService.items.splice(0);
                        CartService.drinks.splice(0);

                        $rootScope.closeCartModal();
                        $localstorage.setObject('from', {
                            cart: false
                        });
                        $scope.openSummaryModal();

                        $ionicLoading.hide();


                    } else {

                        $ionicLoading.hide();

                        var status = 'ERROR';
                        var strings = res.data.message;
                        var cause = res.data.message;
                        var alertPopup = $ionicPopup.alert({
                            title: status,
                            template: '<center>' + strings + ':<br/><strong>' + cause + '</strong></center>'
                        });

                    }

                });
            }
        }

        //$rootScope.slideInMenu();

        $localstorage.setObject('from', {
            cart: true
        });

    };


    $rootScope.closeCartModal = function() {

        // update ORDERS session everytime cart-modal closing
        if (CartService.items.length < 1 && CartService.drinks.length < 1) {
            $localstorage.remove('orders');
            $rootScope.hideCartButton();
        } else {
            $localstorage.setObject('orders', {
                pizzas: CartService.items,
                drinks: CartService.drinks
            });
        }

        //$rootScope.slideUpMenu();

        //$scope.cartModal.hide();
        if ($scope.cartModal) {
            $scope.cartModal.remove(function() {
                console.log('Successfully close CART modal...');
            });
        }

        if (!$localstorage.getObject('orders')) {
            $('.btn-cart').hide();
        } else {
            $('.btn-cart').show();
        }
        /*.then(function() {
            $scope.modal = null;
        });*/
    };




    $scope.openPizzaMenuFromCart = function() {
        $scope.cartModal.hide();
        
        // update ORDERS session everytime cart-modal closing
        if (CartService.items.length < 1 && CartService.drinks.length < 1) {
            $localstorage.remove('orders');
            $rootScope.hideCartButton();
        } else {
            $localstorage.setObject('orders', {
                pizzas: CartService.items,
                drinks: CartService.drinks
            });
        }

        $localstorage.setObject('from', {
            cart: false
        });
    };

    ///////////////////////////////////
    /// ----- Edit Cart Modal ----- ///
    ///////////////////////////////////
    $rootScope.openEditModal = function(index) {

        invisibleOptionBtn();

        $rootScope.closeCartModal();
        $scope.editModal.show();

        var ordered = $scope.items;

        if (ordered.length > 0) {
            $scope.orderedByIndex = ordered[index];
        } else {
            console.log('Cart item is empty!');
        }
        console.log($scope.orderedByIndex);

        $scope.select = {
            crust: $scope.orderedByIndex.crust,
            sizeType: $scope.orderedByIndex.size
        };

        var pizzaPrices = $scope.orderedByIndex.price;

        $scope.onSizeChange = function(value) {
            var largeSumPrice = 20000 * $scope.orderedByIndex.quantity;

            if (value == 'Regular') {
                $scope.orderedByIndex.price = pizzaPrices - largeSumPrice;
                console.log($scope.orderedByIndex.price);
            } else if (value == 'Large') {
                $scope.orderedByIndex.price = parseInt($scope.orderedByIndex.price) + largeSumPrice;
                console.log($scope.orderedByIndex.price);
            };
        }

        console.log($scope.orderedByIndex.price);

        function updateModal() {

            $scope.$broadcast('a-carousel.arrayupdated', 'carousel-7');
        }


        var i, l = $scope.orderedByIndex.allCrust.length;

        // Splice crust by 3 items per row
        $scope.chunks = [];
        for (i = 0; i < l; i += 3) {
            $scope.chunks.push($scope.orderedByIndex.allCrust.slice(i, i + 3));
        }

        var j, k = $scope.orderedByIndex.allSizeType.length;

        // Splice size by 3 items per row
        $scope.dhunks = [];
        for (i = 0; i < l; i += 3) {
            $scope.dhunks.push($scope.orderedByIndex.allSizeType.slice(i, i + 3));
        }



        $scope.request = $scope.orderedByIndex.request;

        /* ----- Update per item Pizza function ----- */
        $scope.updateItem = function(crust, size, request) {
            $scope.orderedByIndex.crust = crust;
            $scope.orderedByIndex.size = size;
            $scope.orderedByIndex.request = request;
            $rootScope.openCartModal();
            $scope.editModal.hide();
            $scope.closeAddressModal();
        }

        $rootScope.slideInMenu();
    };

    $rootScope.backEditModal = function() {
        $scope.editModal.hide();
        $rootScope.openCartModal();
        $scope.closeAddressModal();

        $rootScope.slideInMenu();
    };

    ///////////////////////////////////
    //// ------ Profile Modal --- /////
    ///////////////////////////////////

    $rootScope.openProfileModal = function() {
        // page loading...
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        $scope.profileModal.show();

        var phoneNumberString = JSON.parse(phoneNumber);
        var newPhoneNumber = phoneNumberString.phone;

        // Fetching profile drom local storage
        var name = $localstorage.getObject('name');

        $scope.profileItems = {
            "firstName": name.fname,
            "lastName": name.lname,
            "phoneNumber": phoneNumber
        };

        // stop loading..
        $ionicLoading.hide();

        $scope.saveProfile = function(fName, lName) {
            // page loading...
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Updating your profile...'
            });

            var link = ApiServer.set('live') + '/update';

            $http.post(link, {
                phone: newPhoneNumber,
                fname: fName,
                lname: lName
            }).then(function(res) {
                if (res.data.success == true) {
                    // stop loading..
                    $ionicLoading.hide();

                    var status = 'SAVED';
                    var strings = res.data.message;
                    var alertPopup = $ionicPopup.alert({
                        title: status,
                        template: '<center>' + strings + '</center>'
                    });
                    alertPopup.then(function(res) {

                        // update name session
                        $localstorage.setObject('name', {
                            fname: fName,
                            lname: lName
                        });


                        $state.go('menu');
                        $rootScope.closeProfileModal();
                        $rootScope.menus();

                    });
                } else {
                    // stop loading..
                    $ionicLoading.hide();

                    var status = 'ERROR';
                    var strings = res.data.message;
                    var alertPopup = $ionicPopup.alert({
                        title: status,
                        template: '<center>' + strings + '</center>'
                    });
                }
            });
        }

        $scope.deleteAccount = function(number) {

            var confirmPopup = $ionicPopup.confirm({
                template: '<center>Are you sure you want to deactivate your account?<br/>All of your user datas will be wiped out, including saved addresses and your order histories</center>',
                okText: 'DELETE MY ACCOUNT',
                cancelText: 'CANCEL'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    // page loading...
                    $ionicLoading.show({
                        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                    });

                    var link = ApiServer.set('live') + '/deactivate';

                    $http.post(link, {
                        phone: number
                    }).then(function(res) {
                        if (res.data.success == true) {
                            // stop loading..
                            $ionicLoading.hide();

                            var strings = res.data.message;
                            var alertPopup = $ionicPopup.alert({
                                title: status,
                                template: '<center>' + strings + '</center>'
                            });

                            alertPopup.then(function(res) {
                                // flush session
                                $localstorage.flush();
                                $rootScope.closeProfileModal();
                                $state.go('register');
                            });
                        } else {
                            // stop loading..
                            $ionicLoading.hide();

                            var status = 'ERROR';
                            var strings = res.data.message;
                            var alertPopup = $ionicPopup.alert({
                                title: status,
                                template: '<center>' + strings + '</center>'
                            });
                        }
                    });

                } else {
                    console.log('Cancel deleting account :)');
                }
            });
        }

        $rootScope.slideInMenu();
    };


    $rootScope.closeProfileModal = function() {
        $scope.profileModal.hide();
        $rootScope.slideUpMenu();
    };



    //////////////////////////////////
    //// ------ Orders Modal --- /////
    //////////////////////////////////


    $rootScope.openOrdersModal = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        if ($scope.ordersModal) {
            console.log('There is orders modal instance active! Going to destroy it!');
            $scope.ordersModal.remove();
        }

        $scope.initOrdersModal().then(function() {
            $scope.ordersModal.show();
        });

        var session = $localstorage.getObject("auth");
        var phoneSession = session.phone;

        var ordersSession = $localstorage.getObject('order-history');

        if (!ordersSession | ordersSession == undefined) { // if order history session doesnt exist

            console.log('Fetching order history from server...');
            $http.get(link + "/user/orders?phone=" + phoneSession).then(function(response) {
                $ionicLoading.hide();

                $scope.orderList = response.data.orders;

                // Save order history to local storage
                $localstorage.setObject('order-history', response.data.orders);

            }, function(error) {
                $ionicLoading.hide();

                return error;
            });

        } else { // if order history exists

            // check order history length
            $http.get(link + "/user/orders/length?phone=" + phoneSession).then(function(response) {
                if (response.data.message != ordersSession.length) {
                    console.log('Session data size doesn\'t match. Begin fetching data from server...');
                    $http.get(link + "/user/orders?phone=" + phoneSession).then(function(response) {
                        $ionicLoading.hide();

                        $scope.orderList = response.data.orders;

                        // Save order history to local storage
                        $localstorage.setObject('order-history', response.data.orders);

                    }, function(error) {
                        $ionicLoading.hide();

                        return error;
                    });
                } else {
                    $scope.orderList = ordersSession;
                }
            });

            $ionicLoading.hide();
        }


        $rootScope.slideInMenu();

    }

    $rootScope.closeOrdersModal = function() {
        // update ORDERS session
        $localstorage.setObject('orders', {
            pizzas: CartService.items,
            drinks: CartService.drinks
        })

        $scope.ordersModal.hide();
        $scope.ordersModal.remove()
            .then(function() {
                $scope.modal = null;
            });
        //$rootScope.menus();
        $rootScope.slideUpMenu();

    }

    ////////////////////////////////////
    //// ------ Address Modal --- //////
    ////////////////////////////////////
    $scope.openAddressModal = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        if ($scope.addressModal) {
            console.log('There is address modal instance active! Going to destroy it!');
            $scope.addressModal.remove();
        }

        $scope.initAddressModal().then(function() {
            $scope.addressModal.show();
        });

        // reading address session
        var addresses = $localstorage.getObject("addresses");

        if (!addresses || addresses == undefined) { // If address session is not set (empty)
            console.log('a');
            console.log('Address session empty yet. Begin fetching addresses data from server..');
            var session = $localstorage.getObject("auth");
            var phoneSession = session.phone;

            $http.get(link + "/user/address?type=list&phone=" + phoneSession).then(function(response) {

                var defaultAddressSession = $localstorage.get('default-address');

                if (defaultAddressSession) {
                    var addressList = response.data.address;
                    var defaultAddressId = defaultAddressSession.uid;
                    var newAddressList = [];

                    angular.forEach(addressList, function(value) {
                        if (value['uid'] == defaultAddressId) {
                            value['status'] = 1;
                        } else {
                            value['status'] = 0;
                        }
                        newAddressList.push(value);
                    })

                    $scope.addressList = newAddressList;

                } else {

                    var addressList = response.data.address;
                    var newAddressList = [];

                    angular.forEach(addressList, function(value) {
                        value['status'] = 0;
                        newAddressList.push(value);
                    })

                    $scope.addressList = newAddressList;
                }

                // save fetched data to local storage
                $localstorage.setObject("addresses", $scope.addressList);

            }, function(error) {
                return error;
            });

        } else { // if session address exist

            //console.log('Reading address data from local storage..');
            var defaultAddressSession = $localstorage.getObject('default-address');

            if (defaultAddressSession) {
                var defaultAddressId = defaultAddressSession.uid;
                var newAddressList = [];

                angular.forEach(addresses, function(value) {
                    if (value['uid'] == defaultAddressId) {
                        value['status'] = 1;
                    } else {
                        value['status'] = 0;
                    }
                    newAddressList.push(value);
                })

                $scope.addressList = newAddressList;

            } else {

                var newAddressList = [];

                angular.forEach(addresses, function(value) {
                    value['status'] = 0;
                    newAddressList.push(value);
                })

                $scope.addressList = newAddressList;
            }

        }

        $ionicLoading.hide();

        $rootScope.closeCartModal();
        //$scope.cartModal.hide();

        $scope.deleteAddress = function(uid) {
            var session = $localstorage.getObject("auth");
            var phoneSession = session.phone;

            // check if address to be deleted is the default one
            var defaultAddressSession = $localstorage.getObject('default-address');
            if (defaultAddressSession) {
                var defaultAddressId = defaultAddressSession.uid;
                if (uid == defaultAddressId) {
                    $localstorage.remove('default-address');
                }
            }

            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
            });

            // begin deleting process
            $http.get(link + "/user/address?type=rm&phone=" + phoneSession + '&uid=' + uid).then(function(response) {
                if (response.data.success == true) {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: "Deleted",
                        template: '<center>' + response.data.message + '</center>'
                    });

                    alertPopup.then(function(res) {
                        var newLink = ApiServer.set('live') + '/';
                        $http.get(newLink + "user/address?type=list&phone=" + phoneSession).then(function(response) {


                            var defaultAddressSession = $localstorage.getObject('default-address');

                            if (defaultAddressSession) {

                                var addressList = response.data.address;
                                var defaultAddressId = defaultAddressSession.uid;
                                var newAddressList = [];

                                angular.forEach(addressList, function(value) {
                                    if (value['uid'] == defaultAddressId) {
                                        value['status'] = 1;
                                    } else {
                                        value['status'] = 0;
                                    }
                                    newAddressList.push(value);
                                    //console.log(value);
                                })

                                $scope.addressList = newAddressList;
                            } else {

                                var addressList = response.data.address;
                                var newAddressList = [];

                                angular.forEach(addressList, function(value) {
                                    value['status'] = 0;
                                    newAddressList.push(value);
                                })

                                $scope.addressList = newAddressList;

                            }

                            // update address data on local storage
                            console.log('Deleting address data on local storage..');
                            $localstorage.setObject("addresses", $scope.addressList);

                            $ionicLoading.hide();

                        }, function(error) {
                            return error;
                            $ionicLoading.hide();
                        });
                    });

                } else {
                    console.log(response.data);
                    var alertPopup = $ionicPopup.alert({
                        title: "ERROR :(",
                        template: 'Something gone wrong. Please contact support team.'
                    });
                }
            }, function(error) {
                return error;
            });
        }


        $rootScope.slideInMenu();


    }

    $scope.closeAddressModal = function() {
        $localstorage.remove('from_cart');
        $scope.addressModal.hide();

        var from = $localstorage.getObject('from');

        if (from.cart == true) {
            $rootScope.openCartModal();
        } else {
            $rootScope.slideUpMenu();
        }
    }


    //////////////////////////////////////
    //// ------ Detail Order Modal --- ///
    //////////////////////////////////////
    $rootScope.openHelpModal = function() {
        $scope.helpModal.show();
        $rootScope.slideInMenu();
    }

    $rootScope.closeHelpModal = function() {
        $scope.helpModal.hide();
        $rootScope.slideUpMenu();
    }

    //////////////////////////////////////
    //// -- Location Service Modal --- ///
    //////////////////////////////////////
    $rootScope.openLocationServiceModal = function() {
        $rootScope.locationService.show();

        $scope.try_location = function() {
            cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
                if (!enabled) {

                    /*var alertPopup = $ionicPopup.alert({
                        title: 'Turn on your location service to allow Slice to determine your location',
                        template: "<center>This will make it much easier to deliver your pizza</center>"
                    });

                    alertPopup.then(function() {
                        settings.openSettings();
                    });*/

                    //alert('Turn on your location service to allow Slice to determine your location');
                    var alertPopup = $ionicPopup.alert({
                        template: 'Turn on your location service to allow Slice to determine your location'
                    });


                } else {
                    $rootScope.closeLocationServiceModal();
                    $scope.addressModal.hide();
                    $state.go('location');
                }
            }, function(error) {
                alert("The following error occurred: " + error);
            });
        }

        //$rootScope.slideInMenu();
    }

    $rootScope.closeLocationServiceModal = function() {
        $scope.locationService.hide();
    }


    ///////////////////////////////////
    //// ------ Summary Modal --- /////
    ///////////////////////////////////

    $scope.openSummaryModal = function() {
        if ($scope.summaryModal) {
            console.log('There is an active SUMMARY modal. Going to destroy it!');
            $scope.summaryModal.remove();
        }

        $scope.initSummaryModal().then(function() {
            $scope.summaryModal.show();
        });

        var finishedOrderSession = $localstorage.getObject('orders-finish');
        var order = finishedOrderSession.order;

        console.log('Order summary > ', order);

        $scope.pizzas = order.pizza;
        $scope.drinks = order.drinks;
        $scope.total = order.total;
        $scope.address1 = order.delivery.drop_address;
        $scope.address2 = order.delivery.drop_address_number;
        $scope.date = order.date;
        $scope.number = order.number;

        // Get the static map
        $scope.staticMap = "https://maps.google.com/maps/api/staticmap?center=" + order.delivery.latitude + "," + order.delivery.longitude + "&zoom=15&size=375x142&sensor=false&markers=" + order.delivery.latitude + "," + order.delivery.longitude;
    }


    $scope.closeSummaryModal = function(value) {
        $localstorage.remove('orders-finish');

        $scope.summaryModal.hide();
        $scope.summaryModal.remove()
            .then(function() {
                $scope.modal = null;
            });
        //$rootScope.menus();

    }

    $scope.detailOrder = function(item) {
        $rootScope.closeOrdersModal();

        CountDownTimer.value = item.date;
        $state.go('detail_order', {
            id: item.number
        });
        $rootScope.slideInMenu();
    }




    // hide the page loader
    $ionicLoading.hide();

    $rootScope.backToAddressList = function() {
        //map.remove();
        $scope.openAddressModal();
        $state.go('menu');
    }


    ///////////////////////////////////////////
    ///////// DETAIL ORDER FUNCTION //////////
    /////////////////////////////////////////

    $rootScope.closeOrderDetailModal = function() {

        $scope.openOrdersModal();
        $state.go('menu');

    }


    ///////////////////////////////////
    ///////// SAVE NEW ADDRESS ////////
    //////////////////////////////////

    $scope.street = $rootScope.streetName;
    $scope.number = $rootScope.streetNo;
    $scope.fullAddress = $localstorage.getObject('location-address');


    $scope.saveLocation = function(fullAddress, additional) {

        // get datas from session
        authSession = $localstorage.getObject('auth');
        var savedNumber = authSession.phone;


        orderSession = $localstorage.getObject('orders');

        locationSession = $localstorage.getObject('location');
        var latitude = locationSession.lat;
        var longitude = locationSession.lng;

        //var address = address1 + ' ' + address2;
        var addAddress = additional;


        var random = Math.floor(Math.random() * 900);

        var link = ApiServer.set('live') + '/add';

        var splitFullAddress = fullAddress.split(" ");
        var splitStreetNo = splitFullAddress[splitFullAddress.length - 1];

        var splitStreetAddress = [];
        for (var i = 0; i < splitFullAddress.length - 1; i++) {
            splitStreetAddress.push(splitFullAddress[i]);
        };

        var newSplitStreetAddress = splitStreetAddress.join(" ");

        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        });

        $http.post(link, {
            uid: random,
            phone: savedNumber,
            address: newSplitStreetAddress,
            number: splitStreetNo,
            longitude: longitude,
            latitude: latitude,
            addAddress: addAddress
        }).then(function(res) {

            if (res.data.success == true) {

                var status = 'NEW ADDRESS ADDED';
                var strings = newSplitStreetAddress.toUpperCase() + ' ' + splitStreetNo.toUpperCase() + ' has been added';

                var alertPopup = $ionicPopup.alert({
                    title: status,
                    template: strings
                });

                alertPopup.then(function(res) {
                    // set as last location and save to session
                    var lastLoc = {
                        longitude: longitude,
                        latitude: latitude,
                        address: newSplitStreetAddress,
                        number: splitStreetNo
                    }

                    $localstorage.setObject('last-location', lastLoc);

                    var newLink = ApiServer.set('live') + '/';

                    // update address data in local storage
                    $http.get(newLink + "user/address?type=list&phone=" + savedNumber).then(function(response) {

                        // save fetched data to local storage
                        $localstorage.setObject("addresses", response.data.address);
                        var dateNow = Date.now();
                        var default_address = {
                            "date": dateNow,
                            "longitude": longitude,
                            "latitude": latitude,
                            "addAddress": addAddress,
                            "number": splitStreetNo,
                            "address": newSplitStreetAddress,
                            "uid": random

                        }

                        $localstorage.setObject("default-address", default_address);

                        // destroying address summary modal instance
                        $scope.addressSummaryModal.remove();

                        var fromCart = $localstorage.getObject('from');
                        if (fromCart.cart == true) {
                            console.log('from cart');
                            $scope.openCartModal();
                        } else {
                            console.log('from address modal');
                            $scope.openAddressModal();
                        }

                        $ionicHistory.clearCache().then(function() {
                            $state.go('menu');
                        });



                    }, function(error) {
                        return error;
                    });

                });

                $ionicLoading.hide();

            } else {
                var status = 'ERROR';
                var strings = res.data.message;
                var alertPopup = $ionicPopup.alert({
                    title: status,
                    template: '<center>' + strings + '</center>'
                });
            }
        });
    }

    //////////////////////////////////////
    //// --- Address Summary Modal --- ///
    //////////////////////////////////////
    $scope.closeAddressSummaryModal = function(string) {
        $scope.addressSummaryModal.remove();
        $state.go('location');
    }



    LoadDrinks.success(function(data) {
        $scope.drinkss = data;

        $scope.addDrink = function(drink, id, index) {

            if (CartService.drinks.length > 0) { // if cart service is not empty
                var tempData = [];
                var flag = '';
                // Find a match inside service
                angular.forEach(CartService.drinks, function(data) {
                    if (data.id === id) { // Found a match!
                        flag = id;
                    }
                });
                // process the matched one
                if (flag != '') {
                    // put data on temp array
                    tempData = CartService.drinks;
                    angular.forEach(tempData, function(value) {
                        if (value.id == flag) { // Found a match!
                            value.qty += 1;
                        }
                    });
                    // put data back to service
                    CartService.drinks = tempData;
                } else { // if no match found
                    CartService.drinks.push({
                        "id": id,
                        "name": drink.name,
                        "price": drink.price,
                        "qty": 1
                    });
                }

            } else { // if cart service is empty -> initial item
                CartService.drinks.push({
                    "id": id,
                    "name": drink.name,
                    "price": drink.price,
                    "qty": 1
                });
            }

            if (CartService.drinks.length > 0) {
                angular.forEach(CartService.drinks, function(value) {
                    if (id == value.id) {
                        $scope.drinkQty = value.qty;
                    }
                });

            }


            if (CartService.items.length >= 0 && CartService.drinks.length >= 0) {
                $('.btn-cart').show();
            } else {
                $('.btn-cart').hide();
            }

            angular.forEach(data, function(value, key) {
                if (index == key) {
                    var data_id = $('.badges[data-id="' + index + '"]').addClass('add');

                    setTimeout(function() {
                        $('.badges').removeClass('add');
                    }, 1000);
                }
            });
        }

    });



    $scope.closeDrinkModal = function() {
        $scope.drinkModal.hide();
    }
});


app.controller('DetailOrder', function($rootScope, $scope, $stateParams, $state, $http, $localstorage, $timeout, $cordovaGeolocation, ApiServer, CountDownTimer) {

    $scope.id = $stateParams.id;
    var phoneNumber = JSON.parse($localstorage.get('auth'));
    var resPhone = phoneNumber.phone;
    var link = ApiServer.set('live');

    $scope.date = new Date(CountDownTimer.value);
    var addMinutes = 30 * 60000;

    var d = new Date();

    var currentDate = d.getTime();
    var dates = CountDownTimer.value + addMinutes;


    $scope.sisaWaktu = (dates - currentDate) / 60000 * 60;

    if ($scope.sisaWaktu <= 0) {
        $('#countdown').text('00:00');
    };



    $http.get(link + "/user/orders?phone=" + resPhone).then(function(response) {
        $rootScope.orderList = response.data.orders;

        angular.forEach($scope.orderList, function(item) {
            if (item.number == $scope.id) {
                $rootScope.orderDetail = item;
            }
        })

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
            var lat = $rootScope.orderDetail.delivery.latitude;
            var long = $rootScope.orderDetail.delivery.longitude;

            // Get the static map
            $scope.staticMap = "https://maps.google.com/maps/api/staticmap?center=" + lat + "," + long + "&zoom=15&size=375x142&sensor=false&markers=" + lat + "," + long;

        });

        $scope.totalPrice = 0;

        angular.forEach($scope.orderDetail.pizza, function(value) {
            $scope.totalPrice += parseInt(value.price);
        });
        angular.forEach($scope.orderDetail.drinks, function(value) {
            $scope.totalPrice += parseInt(value.price) * parseInt(value.qty);
        });



    }, function(error) {
        return error;
    });
});

app.controller('MapController', function($scope, $http, $rootScope, $state, $ionicPlatform, $ionicLoading, $cordovaGeolocation, $ionicModal, $ionicPopup, $localstorage, $ionicHistory, ApiServer) {

    $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Getting your location...'
    });

    // function to measure user's location distance
    var measureDistance = function(lat, lng) {
        from = new google.maps.LatLng(-7.2653455, 112.74701);
        to = new google.maps.LatLng(lat, lng);
        dist = google.maps.geometry.spherical.computeDistanceBetween(from, to);
        km = (dist / 1000).toFixed(1);

        if (km > 5.0) {
            var result = false;
        } else {
            var result = true;
        }

        return result;
    }

    $('#map').parent('.scroll').css('height', '100%');

    // get image folder URL
    $scope.mapMarker = {
        src: 'img/map-marker.png'
    }

    var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    };


    $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
        // Rendering MAP and getting user's current location


        // Initiating functions
        function successFunction(position) {
            codeLatLng(lat, long);
        }

        function errorFunction() {
            alert("Geocoder failed");
        }

        function codeLatLng(lat, lng) {
            var latlng = {
                lat: lat,
                lng: lng
            };

            geocoder.geocode({
                'latLng': latlng
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        var arrAddress = results;
                        // iterate through address_component array
                        $.each(
                            arrAddress,
                            function(i, address_component) {
                                if (address_component.types[0] == "locality") {

                                    itemLocality = address_component.address_components[0].long_name;

                                    //$scope.fullAddress = results[0].formatted_address;


                                    var splitAddress = results[0].formatted_address.split(",");

                                    var searchInput = $('#pac-input');

                                    searchInput.focus(function() {
                                        $('.close-autocomplate').show();
                                    });

                                    searchInput.blur(function() {
                                        $('.close-autocomplate').hide();
                                    });

                                    $('.close-autocomplate').click(function() {
                                        searchInput.val(" ");
                                        searchInput.focus();
                                        searchInput.attr("placeholder", "Search here");
                                    });


                                    // ---- get address only from GMaps --- //
                                    $rootScope.addressOnly = splitAddress[0];

                                    $rootScope.getAddresses = $rootScope.addressOnly;
                                    //$('#pac-input').val($rootScope.addressOnly);


                                    // ---- get Street Number from GMaps ----- //
                                    var splitSteetNo = splitAddress[0].split(" ");
                                    $scope.streetNumberMaps = splitSteetNo[splitSteetNo.length - 1];
                                    var justStreetNum = $scope.streetNumberMaps.split(".");
                                    $scope.justStreetNumMaps = justStreetNum[1];

                                    // save the location geolocation to session
                                    $localstorage.setObject('location', {
                                        'lat': lat,
                                        'lng': lng
                                    });

                                    $localstorage.setObject('location-address', $rootScope.addressOnly);
                                    $('.addressInfo').text($localstorage.getObject('location-address'));
                                }
                            });
                    }
                } else {
                    //$('.addressInfo').text("Geocoder failed due to: " + status);
                    if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        nextAddress--;
                        delay++;
                    } else {
                        var reason = "Code " + status;
                        var msg = 'address="' + search + '" error=' + reason + '(delay=' + delay + 'ms)<br>';
                        document.getElementById("address_info").innerHTML += msg;
                    }
                }
            });
        }

        $rootScope.getAddresses = " ";

        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        var myLatlng = new google.maps.LatLng(lat, long);

        var mapOptions = {
            center: myLatlng,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [{
                "featureType": "landscape",
                "stylers": [{
                    "saturation": -100
                }, {
                    "lightness": 60
                }]
            }, {
                "featureType": "road.local",
                "stylers": [{
                    "saturation": -100
                }, {
                    "lightness": 40
                }, {
                    "visibility": "on"
                }]
            }, {
                "featureType": "transit",
                "stylers": [{
                    "saturation": -100
                }, {
                    "visibility": "simplified"
                }]
            }, {
                "featureType": "administrative.province",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "water",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "lightness": 30
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ef8c25"
                }, {
                    "lightness": 40
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#b6c54c"
                }, {
                    "lightness": 40
                }, {
                    "saturation": -40
                }]
            }, {}]
        };

        // initiate map
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        var image = 'img/marker.png';
        var marker = new google.maps.Marker({
            position: {
                lat: lat,
                lng: long
            },
            map: map,
            icon: image
        });
        marker.setMap(map);

        //// button get current location
        $('.btn-current-location').click(function() {
            map.panTo(myLatlng);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
            }
        });

        // add shop marker
        var shopLatLng = {
            lat: -7.26536,
            lng: 112.74707
        };

        var homeImage = 'img/home.png';
        var beachMarker = new google.maps.Marker({
            position: shopLatLng,
            map: map,
            icon: homeImage,
            title: 'Home'
        });

        // Add circle overlay and bind to marker
        /*var circle = new google.maps.Circle({
            center: shopLatLng,
            map: map,
            radius: 5000, // 5 kilometers in meters
            fillColor: '#2b8dd8',
            strokeColor: '#2b8dd8'
        });*/


        map.addListener('dragend', function() {
            codeLatLng(map.getCenter().lat(), map.getCenter().lng());
        });

        var geocoder = new google.maps.Geocoder();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        }

        $ionicLoading.hide();

    }, function(err) {
        $ionicLoading.hide();
        console.log(err);
    });



    $scope.disableTap = function() { // fix for map autocomplete
        container = document.getElementsByClassName('pac-container');
        // disable ionic data tab
        angular.element(container).attr('data-tap-disabled', 'true');
        // leave input field if google-address-entry is selected
        angular.element(container).on("click", function() {
            document.getElementById('pac-input').blur();
        });
    }


    $scope.send = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Saving Location...'
        });

        // distance filter 
        var locSession = $localstorage.getObject('location');
        var lat = locSession.lat;
        var lng = locSession.lng;

        // ------ measure the distance ------- //
        /*var distance = measureDistance(lat, lng);
        if (distance == false) {

            $ionicPopup.alert({
                title: 'Too far.. :(',
                template: '<center>Oops, can\'t be further than 5 km\'s.<br/>PLease choose an address within range 5 km\'s from our shop<center>'
            });

        } else {*/

        // check if address already added
        var link = ApiServer.set('live');
        var phoneNumber = JSON.parse($localstorage.get('auth'));
        var phoneSession = phoneNumber.phone;

        // Get street name 
        var unformattedAddress = $('.addressInfo').text().split(" ");
        unformattedAddress.pop();

        var formattedAddress = "";
        for (var i = 0; i < unformattedAddress.length; i++) {
            formattedAddress = formattedAddress + " " + unformattedAddress[i];
        };

        // fetch street name only
        $rootScope.streetName = formattedAddress;
        // ftech street number only
        $rootScope.streetNo = $scope.justStreetNumMaps;

        var newAddress = formattedAddress + ' ' + $scope.justStreetNumMaps;

        // filtering the chosen address\
        var err = 0;
        var addressesSession = $localstorage.getObject('addresses');

        angular.forEach(addressesSession, function(value) {
            if (value['address'] == newAddress) {
                err++;
            }
        })

        if (err > 0) {
            $ionicPopup.alert({
                template: '<center>Sorry, you already added this address<br/>Please pick another one</center>'
            });
        } else {
            $rootScope.streetNumber = $scope.justStreetNumMaps;

            // delete map instance
            //map.remove();

            // redirect to full_address page
            $ionicHistory.clearCache().then(function() {
                $localstorage.setObject('open_address_summary', true);
                $state.go('menu');
            });

        }
    };
});


app.controller('connection', function($scope, $state, $ionicPopup) {

    var windowHeight = $(window).height();
    $scope.imgHeight = {
        height: windowHeight
    };

    $scope.try_connection = function() {
        var networkState = navigator.connection.type;

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
            var notifCon = states[Connection.NONE];
            var alertPopup = $ionicPopup.alert({
                template: notifCon
            });
        } else {
            $state.go('menu');
        }
    }
});
