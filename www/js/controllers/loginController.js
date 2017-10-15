/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller to add and modify headaches.
 */

angular.module('Chronic').controller('loginController', function ($scope, dataService, $http, $q) {


        var VERSION_NUMBER = '1.0';

        ons.ready(function () {
            $('.hidden').removeClass("hidden");
            $('#loadingImg').hide();
            ons.disableDeviceBackButtonHandler();
            document.addEventListener("deviceready", onDeviceReady, false);

            // device APIs are available
            //
            function onDeviceReady() {
                document.addEventListener("backbutton", onBackKeyPress, false);
            }
            function onBackKeyPress(e) {
                e.preventDefault();

            }
        });

        // Set everything to null until a login has occured
    //dataService.registerUser(null, null, null, null, null, null, null, null);

        $scope.transition = function () {
            //console.log($("body").children());
            $("body").children().eq(0).show();
            $('body').children().eq(1).hide();
        };

        $scope.email = dataService.getEmail();
        if($scope.email != null){
            $scope.email = $scope.email.toLowerCase();
        }
    //console.log("Email:" + $scope.email);
        $scope.password = "";

        //Focus on the correct field
        if ($scope.email == "") {
            $('#login__username').focus();
        } else {
            $('#login__password').focus();
        }

        var array_compare = function (array1, array2) {
            return (array1.length == array2.length) && array1.every(function (element, index) {
                    return element === array2[index];
                });
        };

        var checkVersion = function(){
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", "http://tw06v033.ugent.be/Chronic/rest/VersionService/version", false ); // false for synchronous request
            xmlHttp.send( null );
            return xmlHttp.responseText;
        };

        $scope.submitLogin = function () {

            var pwHash = sha3_512($scope.password);
            //try to login
            //retrieve user
            dataService.registerUser("", "", null, true, null, true, $scope.email.toLowerCase(), sha3_512($scope.password), 0);
            // We can't use getAuthorization yet from the dataservice since no user is registered yet.
            //dataService.getDBStatus().then(function(result){
                var test = [$http.get('http://tw06v033.ugent.be/Chronic/rest/PatientService/login', {headers: {'Authorization': dataService.getAuthorization()}})]
                $q.all(test).then(function () {

                    }
                );
            $http.get('http://tw06v033.ugent.be/Chronic/rest/PatientService/login', {headers: {'Authorization': dataService.getAuthorization()}}).
            success(function (data, status, headers, config) {

                    //console.log("User succesfully logged in:", data);
                    var user = data;
                    dataService.setAdvice(data.advice);
                    console.log("Got user: ", JSON.stringify(user));
                    dataService.registerUser(user.firstName, user.lastName, user.birthDate, user.isMale, user.relation, user.isEmployed, $scope.email.toLowerCase(), sha3_512($scope.password), user.patientID);
                    dataService.sendNewHeadachesToDB();
                    dataService.sendNewMedicinesToDB();

                    dataService.syncDB().then(function (result) {
                        $scope.transition();
                        location.href = "dashboard.html";
                        console.log(checkVersion());
                        if(VERSION_NUMBER != checkVersion()){
                            alert("Er is een nieuwe versie beschikbaar op https://build.phonegap.com/apps/1669916/builds");
                        }
                    }, function(data, status, headers, config){
                        alert("Er is een fout opgetreden... " + status  + "\n" + data)
                    });

                }).
                error(function (data, status, headers, config) {
                    alert("Er is een fout opgetreden... " + status  + "\n" + data)
                    if(status==0){
                        alert("U bent niet verbonden met het internet, of de server is offline. U werkt nu verder met lokale gegevens tot u opnieuw verbinding met de server heeft " + status);
                        if (dataService.getCurrentUser() == null || dataService.getCurrentUser().passwordHash == null || dataService.getCurrentUser().passwordHash.length < 1) {
                            alert("Er is lokaal nog geen gebruiker ingesteld. Verbind eerst met het internet en probeer in te loggen " + status);
                        } else {
                            if (dataService.getCurrentUser().passwordHash == pwHash.toString() && dataService.getCurrentUser().email == $scope.email.toLowerCase()) {
                                $scope.transition();
                                location.href = "dashboard.html";
                            } else {
                                $(".error_message").show();
                            }
                        }
                    }else{
                        alert("Er is een fout opgetreden... " + status  + "\n" + data)
                    }



                });
            //});

        }

});
