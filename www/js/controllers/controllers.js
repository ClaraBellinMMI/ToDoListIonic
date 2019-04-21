var app = angular.module('todo.controllers', [])

app.controller('ConnectionController', function ($scope, $http, $window, $state){
    //var serverNode = "../app.js";
    $scope.password = "";
    $scope.username = "";
    if($window.localStorage.user!=null){
        $state.go("tasks");
    }
    $scope.auth = function(){
        if($scope.username && $scope.password){
            var req = {
                username : $scope.username,
                password : $scope.password
            };

            $http.post('/login', req).then(function(resp){
                if(resp.data.length>0){
                    $window.localStorage.setItem('user',resp.data[0].username);
                    $window.localStorage.setItem('id',resp.data[0]._id);
                    $state.go('tasks');
                }
                else{
                    window.alert("wrong id");
                }
                $scope.password="";
                $scope.username="";
            });
        }
    };

    $scope.inscription = function(){
        if($scope.usernameCreate && $scope.passwordCreate){
            var req = {
                username : $scope.usernameCreate,
                password : $scope.passwordCreate
            };

            $http.post('/verif',req).then(function(resp){
                if(resp.data.length==0){
                    $http.post('/createUser',req).then(function(resp){

                        $scope.usernameCreate = "";
                        $scope.passwordCreate = "";
                        window.alert("You're registered, you can now connect");

                    });
                }else{
                    window.alert("This name is already taken");
                }
            });
        }
    };

});


app.controller('MainController', function ($ionicModal,$ionicSideMenuDelegate,$scope, $http,$window,$state,$ionicPopup, $timeout){ //,$cookies
    $scope.updateData = {};
    $scope.nameList = {};
    $scope.updateListe = {};
    $scope.listeData = {};
    $scope.listeDataP = {};
    $scope.tache = [];
    $scope.tacheP = [];
    $scope.nameTask={};
    $scope.listeActive ={};
    $scope.nameList.text;
    $scope.user = {
        username: $window.localStorage.getItem('user'),
        id: $window.localStorage.getItem('id')
    };
    $scope.collab = {};

    
    $scope.getTask = function(id, idx){        
        $scope.listeData.idListe = id;      
		$http.post('/getTask', $scope.listeData)
			.success(function(data) {
                $scope.tache[idx] = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
            });
    }

    $scope.getTaskP = function(id, idx){        
        $scope.listeDataP.idListe = id;      
		$http.post('/getTask', $scope.listeDataP)
			.success(function(data) {
                $scope.tacheP[idx] = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
            });
    }

    $scope.getListe = function(){
        var req = {author : $scope.user.id};
        $http.post('/getList',req).then(function(resp){
            $scope.Liste = resp.data;
            i=0;
            for(l of resp.data){
                $scope.getTask(l._id, i);
                i++;
            }
        });
        var req = {collaborater : $scope.user.id};
        $http.post('/getListP',req).then(function(resp){
            $scope.ListeP = resp.data;
            i=0;
            for(l of resp.data){
                $scope.getTaskP(l._id, i);
                i++;
            }
        });    
    }

    //lancée au chargement de la page: check des cookies, récupération des listes
    if($scope.user.username!=""){
        var req = {author : $scope.user.id};
        $http.post('/getList',req).then(function(resp){
            $scope.Liste = resp.data;
            i=0;
            for(l of resp.data){
                $scope.getTask(l._id, i);
                i++;
            }
        });
        var req = {collaborater : $scope.user.id};
        $http.post('/getListP',req).then(function(resp){
            $scope.ListeP = resp.data;
            i=0;
            for(l of resp.data){
                $scope.getTaskP(l._id, i);
                i++;
            }
        });
    }else{
        $state.go("connexion");
    }    
 
    $scope.createToDo = function(){
        var req = {
            name : $scope.nameTask.text,
            idList : $scope.listeActive._id
        };
		$http.post('/createToDo',req)
		.success(function(data) {
            $scope.nameTask={};
           $scope.getListe();
           $scope.getTask($scope.listeActive._id);
            $scope.getTaskP($scope.listeActive._id);
		})
		.error(function(data) {
			console.log('Error: ' + data);
        });   
    }

    $scope.deleteToDo = function(id){     
        var req = {
            identifiant : id 
        };
		$http.post('/deleteToDo', req)
			.success(function(data) {
                $scope.getListe();
                $scope.getTask($scope.listeActive._id);
                $scope.getTaskP($scope.listeActive._id);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
    }

    $scope.checkToDo =function(id, ok){
        $scope.updateData.identifiant = id;
        $scope.updateData.ok = !ok;
        $http.post('/checkToDo', $scope.updateData).success(function(data) {    
            $scope.getListe();
            $scope.getTask($scope.listeActive._id);
            $scope.getTaskP($scope.listeActive._id);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }

    $scope.updateToDo = function(){
        $scope.updateData.identifiant = $scope.toggleUT._id;
        if($scope.updateData.text!=undefined){
            $http.post('/updateToDo', $scope.updateData).success(function(data) {    
                $scope.getListe();
                $scope.updateData = {};
                $scope.toggleUT = {};
                $scope.getTask($scope.listeActive._id);
                $scope.getTaskP($scope.listeActive._id);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        }
    }

    $scope.createList = function(){
        console.log($scope.nameList.text);
        if($scope.nameList!= undefined){
            console.log($scope.nameList.text);
            var req = {
                nameList : $scope.nameList.text,
                author : $scope.user.id
            };
            $http.post('/createList',req)
            .success(function(data) {
                $scope.nameList.text = "";
                $scope.getListe();
            })
            .error(function(data) {
                console.log('Error: ' + data);
            }); 
        }
    }

    $scope.deleteList = function(id){     
        var req = {
            identifiant : id 
        };
		$http.post('/deleteList', req)
			.success(function(data) {
				$scope.getListe();
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
    }

    $scope.updateList = function(){
        console.log($scope.toggleU._id);
        $scope.updateListe.identifiant= $scope.toggleU._id;
        if($scope.updateListe.text!=undefined){
            $http.post('/updateList', $scope.updateListe).success(function(data) { 
                $scope.updateListe = {}; 
                $scope.getListe();  
                $scope.toggleU = {};  
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        }
    }

    //partage d'une liste avec des collaborateurs
    $scope.share = function(){
        var req = {username : $scope.collab.text};
        $http.post('/verif',req).then(function(resp){
            if(resp.data.length>0){
                req = {
                    _id : $scope.toggleS._id,
                    collaborater : resp.data[0]._id
                }
                $http.post('/share', req).success(function(data){
                    window.alert("list : "+ $scope.toggleS.name+" shared with " + resp.data[0].username);
                    $scope.collab.text = "";
                    $scope.getListe();  
                    $scope.toggleS = {}; 
                })
            }else{
                window.alert("This user does not exist");
            }
        });
    }

    $scope.deconnexion = function(){
        $window.localStorage.removeItem('id');
        $window.localStorage.removeItem('user');
        $state.go('connexion');
    }

    $ionicModal.fromTemplateUrl('templates/modalTask.html', {
        scope : $scope
    }).then(function(modal){
        $scope.modalTask = modal;
    })

    $ionicModal.fromTemplateUrl('templates/modalTaskP.html', {
        scope : $scope
    }).then(function(modal){
        $scope.modalTaskP = modal;
    })

    $scope.openTaskList = function(liste){
        $scope.getTask(liste._id);
        $scope.listeActive = liste;
        $scope.modalTask.show();
    }

    $scope.openTaskListP = function(liste){
        $scope.getTaskP(liste._id);
        $scope.listeActive = liste;
        $scope.modalTaskP.show();
    }

    $scope.shareToggle = function(list){
        $scope.toggleS = list;
    }

    $scope.updateToggle = function(list){
        console.log(list);
        $scope.toggleU = list;
    }

    $scope.updateTaskToggle = function(list){
        console.log(list);
        $scope.toggleUT = list;
    }
});