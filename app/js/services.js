// API endpoint's URL (development only!)
app.factory('ApiServer', ['$window', function($window) {
    return {
        set: function(key) {
            if (key == 'local')
                return "http://localhost:8080/api";
            else if (key == 'live')
                return "http://node.colorblindlabs.com:8080/api";
        }
    }
}]);

app.factory('PhoneVerification', function($http, ApiServer) {
    var result1 = [],
        result2 = [];

    var link = ApiServer.set('live');

    return {
        getCode: function(getNumber, fname, lname) {
            var number = getNumber.toString();
            var phoneNumber = number.slice(1);

            return $http.get(link + "/verify?type=phone&phone=" + phoneNumber + '&fname=' + fname + '&lname=' + lname).then(function(response) {
                result1 = response;
                return result1;

            }, function(error) {
                result1 = error;
                return result1;
            });
        },
        getVerify: function(getNumber, getCode) {
            return $http.get(link + "/verify?type=code&phone=" + getNumber + "&code=" + getCode).then(function(response) {
                result2 = response;
                return result2;

            }, function(error) {
                result2 = error;
                return result2;
            });
        },
        getSignIn: function(getNumber) {
            var number = getNumber.toString();
            var phoneNumber = number.slice(1);

            return $http.get(link + "/verify?type=signin&phone=" + phoneNumber).then(function(response) {
                result1 = response;
                return result1;

            }, function(error) {
                result1 = error;
                return result1;
            });
        }
    }

    return {
        number: ''
    }
});

app.factory('CartService', function($http) {
    return {
        items: [],
        orderedItem: [],
        location: [],
        selectRequest: '',
        drinks:[],
        totalPrice:0
    }
})

app.factory('LoadPizzas', function($http) {
    return $http.get('js/pizza.json')
        .success(function(data) {
            return data;
        })
        .error(function(err) {
            return err;
        })
});

app.factory('LoadDrinks', function($http) {
    return $http.get('js/drink.json')
        .success(function(data) {
            return data;
        })
        .error(function(err) {
            return err;
        })
});

app.factory('UserService', function($http, ApiServer) {
    var result1 = [],
        result2 = [];

    var link = ApiServer.set('live');

    return {
        getProfile: function(number) {
            return $http.get(link + "/user/profile?phone=" + number).then(function(response) {
                result1 = response.data;
                return result1;
            }, function(error) {
                return error;
            });
        },
        getAddress: function(number) {
            return $http.get(link + "/user/address?phone=" + number).then(function(response) {
                result1 = response.data.address;
                return result1;
            }, function(error) {
                return error;
            });
        },
        getOrders: function(number) {
            return $http.get(link + "/user/orders?phone=" + number).then(function(response) {
                result2 = response.data.orders;
                return result2;
            }, function(error) {
                return error;
            });
        }
    }
})


// Local storage service
app.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || null);
        },
        remove: function(key) {
            $window.localStorage.removeItem(key);
        },
        flush: function() {
            $window.localStorage.clear();
        }
    }
}]);

app.factory('GetLatLong', function($http) {
    return {
        lat: 0,
        long: 0
    }
})

app.factory('CountDownTimer', function($http) {
    return {
        value: 0
    }
})


