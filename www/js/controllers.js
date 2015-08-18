moneyTracker=angular.module('moneyTracker.controllers', []);
var db = null;
dbcurency=null;
var email=null;
var oldmonth=null;
dbcurencycode=null;
moneyTracker.controller('homeController',function($scope,$ionicPlatform, $cordovaSQLite){
  $scope.exit = function() {
     $ionicPlatform.ready(function() {
       //console.log("exit.....");
          navigator.app.exitApp();
     });
   };

});

moneyTracker.controller('AppLogin',function($scope, $ionicHistory, $ionicPlatform, $cordovaSQLite, $ionicLoading, $location){
   //db oparation start
  $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
  });
  $ionicPlatform.ready(function() {

      if(window.cordova) {
              db =window.sqlitePlugin.openDatabase({name: "master.db.sqlite", createFromLocation: 1});
          }
      else{
          db = openDatabase("nuatboltu.db", '1.0', "My WebSQL Database", 2 * 1024 * 1024);
          db.transaction(function (tx) {
            tx.executeSql("DROP TABLE IF EXISTS Users");
      tx.executeSql("DROP TABLE IF EXISTS Categories");
        tx.executeSql("DROP TABLE IF EXISTS budgets");
          tx.executeSql("DROP TABLE IF EXISTS trans");
          tx.executeSql("DROP TABLE IF EXISTS settings");

          $ionicLoading.show({ template: 'Creating tables...' });
          tx.executeSql("CREATE TABLE IF NOT EXISTS settings (viewin integer,curency integer)");
          tx.executeSql("CREATE TABLE IF NOT EXISTS Users (id integer primary key, username text,password text)");
          tx.executeSql("CREATE TABLE IF NOT EXISTS Categories (id integer primary key, category_name text,category_type integer,UNIQUE (category_name COLLATE NOCASE))");
          tx.executeSql("CREATE TABLE IF NOT EXISTS budgets (id integer primary key, category integer,amount decimal(18,2), month text)");
          tx.executeSql("CREATE TABLE IF NOT EXISTS trans (id integer primary key,type int,category int,amount decimal(18,2),date text,note text)");


          tx.executeSql("INSERT INTO settings (viewin,curency) VALUES (?,?)", [1,1]);

           tx.executeSql("INSERT INTO Users (username,password) VALUES (?,?)", ["admin@example.com","123456"]);
             tx.executeSql("INSERT INTO Categories (category_name,category_type) VALUES (?,?)", ["Salary",1]);
             tx.executeSql("INSERT INTO Categories (category_name,category_type) VALUES (?,?)", ["Shoping",2]);

            tx.executeSql("INSERT INTO budgets (category,amount,month) VALUES (?,?,?)", [2,300.00,"2015-08-28T18:00:00.000Z"]);


            tx.executeSql("INSERT INTO trans (type,category,amount,date,note) VALUES (?,?,?,?,?)", [1,1,5000,"2015-08-29T18:00:00.000Z","Test Transaction"]);
            tx.executeSql("INSERT INTO trans (type,category,amount,date,note) VALUES (?,?,?,?,?)", [2,2,1500,"2015-08-28T18:00:00.000Z","Test Transaction"]);
            $ionicLoading.hide();
             $location.path("/login");




          },function (err) {
            $ionicLoading.show({ template: err.message });

          });
          setTimeout(function() {
         $ionicLoading.hide();
       },1000);


      }



  });

  //db operation end
    $scope.isshow="none";
    $scope.user = {
    username: '',
    password : ''
    };
    //test code
    $scope.user.username ="admin@example.com";
    $scope.user.password="123456";
    //end test code

    $scope.exit = function() {
       $ionicPlatform.ready(function() {
         //console.log("exit.....");
            navigator.app.exitApp();
       });
     };


  $scope.signIn = function(form) {

    if(form.$valid) {

   $ionicPlatform.ready(function() {

       //login  user
       var query = "SELECT username,password FROM Users where username=? and password=?";
       $cordovaSQLite.execute(db, query, [$scope.user.username,$scope.user.password]).then(function(res) {
           if(res.rows.length > 0) {
             Mail = res.rows.item(0).username;
             //console.log(Mail);

             var query = "SELECT viewin,curency  FROM settings";
             $cordovaSQLite.execute(db, query, []).then(function(res) {

                 if(res.rows.length > 0) {
                   var v = res.rows.item(0).viewin;
                   var c = res.rows.item(0).curency;

                   if(c==1)
                 {

                    dbcurency = "$";
                    dbcurencycode="1";
                 }
                 else if (c==2) {
                   dbcurency = "€";
                   dbcurencycode="2";
                 }
                 else if(c==3) {
                   dbcurency = "£";
                   dbcurencycode="3"
                 }
                 else {
                   dbcurency="৳";
                   dbcurencycode="4"
                 }


                  }

                   else {

                    dbcurency="$";

                   }
                   }, function (err) {
                     $ionicLoading.show({ template: err.message });
                       setTimeout(function() {
                       $ionicLoading.hide();
                     },2000);
                   });

                $location.path("/app/dashboard");
           }
           else {
             $scope.isshow="yes";
             $scope.loginError="Login Faild.Try Again";
               //console.log('login faild');
           }

       }, function (err) {
         $ionicLoading.show({ template: err.message });

       });





   });
   setTimeout(function() {
  $ionicLoading.hide();
},2000);
    }
  };
});


moneyTracker.controller('logout',function($scope, $ionicPlatform, $cordovaSQLite, $ionicLoading, $location){
  if(window.cordova) {
    db.close(function(success){
        $location.path("/login");
        },
    function(err){
          $ionicLoading.show({ template: err});

        });
        setTimeout(function() {
       $ionicLoading.hide();
     },3000);
   }
  else{
        $location.path("/login");
  }

});


moneyTracker.controller('dashboardController',function($scope,$filter, $ionicPlatform, $cordovaSQLite, $ionicLoading, $location){
  $scope.datehidden=new Date();
  $scope.month=$filter('date')(new Date(),'MMM-yyyy');
  var m =   $scope.datehidden.getMonth()+1;
  if(m.toString().length<2)
  {
    m='0'+m.toString();
  }
  var y=  $scope.datehidden.getFullYear();


     $scope.trans =[];
    $ionicPlatform.ready(function() {

        var query = "SELECT sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by type";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
          //  //console.log(res);
            if(res.rows.length ==1) {
              var earn = res.rows.item(0).total;
              var buy = 0;
              var bal = earn-buy;
            }
            else if (res.rows.length ==2) {
              var earn = res.rows.item(0).total;
              var buy = res.rows.item(1).total;
              var bal = earn-buy;
            }
            else {
              var earn = 0;
              var buy = 0;
              var bal = earn-buy;
            }


              $scope.trans.push({income:earn,expence:buy,balance:bal});

              $scope.dbcurenc=dbcurency;

              //  //console.log($scope.trans[0].balance);


        }, function (err) {
          $ionicLoading.show({ template: err.message });
            setTimeout(function() {
            $ionicLoading.hide();
          },2000);
        });
        $scope.budgetsthis=[];
        $scope.transthis=[];
        $scope.budgetsdata=[];
        var query = "SELECT b.id,b.category_type,b.category_name,a.amount FROM budgets as a, Categories as b where a.category=b.id and strftime('%m', a.month) ='"+m+"' and strftime('%Y', a.month) ='"+y+"' order by a.id asc";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
            if(res.rows.length>0) {
              for(var i = 0; i < res.rows.length; i++) {
                $scope.budgetsthis.push({id:res.rows.item(i).id,type:res.rows.item(i).category_type,category:res.rows.item(i).category_name,amount:res.rows.item(i).amount});
              }
            }

        }, function (err) {
          $ionicLoading.show({ template: err.message });
            setTimeout(function() {
            $ionicLoading.hide();
          },2000);
        });
        var query = "SELECT category,sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by category";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
          if(res.rows.length>0) {
            for(var i = 0; i < res.rows.length; i++) {
              $scope.transthis.push({id:res.rows.item(i).category,amount:res.rows.item(i).total});
            }


            for(var j=0;j<$scope.budgetsthis.length;j++)
            {
               for(var k=0;k<$scope.transthis.length;k++)
               {
                   if($scope.budgetsthis[j].id==$scope.transthis[k].id)
                   {
                     if($scope.budgetsthis[j].type==1)
                     {
                       var left = $scope.transthis[k].amount-$scope.budgetsthis[j].amount;
                     }
                     else {
                       var left = $scope.budgetsthis[j].amount - $scope.transthis[k].amount;
                     }


                     $scope.budgetsdata.push({category:$scope.budgetsthis[j].category,type:$scope.budgetsthis[j].type,bamount:$scope.budgetsthis[j].amount,lamount:$scope.transthis[k].amount,inhand:left});

                   }
               }

            }

          //////console.log($scope.budgetsdata);
          }

        }, function (err) {
          $ionicLoading.show({ template: err.message });
            setTimeout(function() {
            $ionicLoading.hide();
          },2000);
        });



    });

    //calendar controll
    $scope.prevMonth = function() {
         $scope.trans=[];
      var datefoo = new Date($scope.datehidden);
       datefoo.setMonth(datefoo.getMonth() -1);
       $scope.datehidden=datefoo;
       $scope.month=$filter('date')(datefoo,'MMM-yyyy');

       var m = datefoo.getMonth()+1;
       if(m.toString().length<2)
       {
         m='0'+m.toString();
       }
       var y=datefoo.getFullYear();
       var query = "SELECT sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by type";
       $cordovaSQLite.execute(db, query, []).then(function(res) {
  // //console.log(res);
   if(res.rows.length ==1) {
     var earn = res.rows.item(0).total;
     var buy = 0;
     var bal = earn-buy;
   }
   else if (res.rows.length ==2) {
     var earn = res.rows.item(0).total;
     var buy = res.rows.item(1).total;
     var bal = earn-buy;
   }
   else {
     var earn = 0;
     var buy = 0;
     var bal = earn-buy;
   }

             $scope.trans.push({income:earn,expence:buy,balance:bal});

             $scope.dbcurenc=dbcurency;

             //  //console.log($scope.trans[0].balance);


       }, function (err) {
         $ionicLoading.show({ template: err.message });
           setTimeout(function() {
           $ionicLoading.hide();
         },2000);
       });
       $scope.budgetsthis=[];
       $scope.transthis=[];
       $scope.budgetsdata=[];
       var query = "SELECT b.id,b.category_type,b.category_name,a.amount FROM budgets as a, Categories as b where a.category=b.id and strftime('%m', a.month) ='"+m+"' and strftime('%Y', a.month) ='"+y+"' order by a.id asc";
       $cordovaSQLite.execute(db, query, []).then(function(res) {
           if(res.rows.length>0) {
             for(var i = 0; i < res.rows.length; i++) {
               $scope.budgetsthis.push({id:res.rows.item(i).id,type:res.rows.item(i).category_type,category:res.rows.item(i).category_name,amount:res.rows.item(i).amount});
             }
           }

       }, function (err) {
         $ionicLoading.show({ template: err.message });
           setTimeout(function() {
           $ionicLoading.hide();
         },2000);
       });
       var query = "SELECT category,sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by category";
       $cordovaSQLite.execute(db, query, []).then(function(res) {
         if(res.rows.length>0) {
           for(var i = 0; i < res.rows.length; i++) {
             $scope.transthis.push({id:res.rows.item(i).category,amount:res.rows.item(i).total});
           }


           for(var j=0;j<$scope.budgetsthis.length;j++)
           {
              for(var k=0;k<$scope.transthis.length;k++)
              {
                  if($scope.budgetsthis[j].id==$scope.transthis[k].id)
                  {
                    if($scope.budgetsthis[j].type==1)
                    {
                      var left = $scope.transthis[k].amount-$scope.budgetsthis[j].amount;
                    }
                    else {
                      var left = $scope.budgetsthis[j].amount - $scope.transthis[k].amount;
                    }


                    $scope.budgetsdata.push({category:$scope.budgetsthis[j].category,type:$scope.budgetsthis[j].type,bamount:$scope.budgetsthis[j].amount,lamount:$scope.transthis[k].amount,inhand:left});

                  }
              }

           }

         ////console.log($scope.budgetsdata);
         }

       }, function (err) {
         $ionicLoading.show({ template: err.message });
           setTimeout(function() {
           $ionicLoading.hide();
         },2000);
       });

    };
    $scope.nextMonth = function() {
        $scope.trans=[];
      var datefoo = new Date($scope.datehidden);
       datefoo.setMonth(datefoo.getMonth() + 1);

       $scope.datehidden=datefoo;

       $scope.month=$filter('date')(datefoo,'MMM-yyyy');

       var m = datefoo.getMonth()+1;
       if(m.toString().length<2)
       {
         m='0'+m.toString();
       }
       var y=datefoo.getFullYear();

       var query = "SELECT sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by type";
       $cordovaSQLite.execute(db, query, []).then(function(res) {
  // //console.log(res);
   if(res.rows.length ==1) {
     var earn = res.rows.item(0).total;
     var buy = 0;
     var bal = earn-buy;
   }
   else if (res.rows.length ==2) {
     var earn = res.rows.item(0).total;
     var buy = res.rows.item(1).total;
     var bal = earn-buy;
   }
   else {
     var earn = 0;
     var buy = 0;
     var bal = earn-buy;
   }
             $scope.trans.push({income:earn,expence:buy,balance:bal});

             $scope.dbcurenc=dbcurency;

             //  //console.log($scope.trans[0].balance);


       }, function (err) {
         $ionicLoading.show({ template: err.message });
           setTimeout(function() {
           $ionicLoading.hide();
         },2000);
       });

       $scope.budgetsthis=[];
       $scope.transthis=[];
       $scope.budgetsdata=[];
       var query = "SELECT b.id,b.category_type,b.category_name,a.amount FROM budgets as a, Categories as b where a.category=b.id and strftime('%m', a.month) ='"+m+"' and strftime('%Y', a.month) ='"+y+"' order by a.id asc";
       $cordovaSQLite.execute(db, query, []).then(function(res) {
           if(res.rows.length>0) {
             for(var i = 0; i < res.rows.length; i++) {
               $scope.budgetsthis.push({id:res.rows.item(i).id,type:res.rows.item(i).category_type,category:res.rows.item(i).category_name,amount:res.rows.item(i).amount});
             }
           }

       }, function (err) {
         $ionicLoading.show({ template: err.message });
           setTimeout(function() {
           $ionicLoading.hide();
         },2000);
       });
       var query = "SELECT category,sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by category";
       $cordovaSQLite.execute(db, query, []).then(function(res) {
         if(res.rows.length>0) {
           for(var i = 0; i < res.rows.length; i++) {
             $scope.transthis.push({id:res.rows.item(i).category,amount:res.rows.item(i).total});
           }


           for(var j=0;j<$scope.budgetsthis.length;j++)
           {
              for(var k=0;k<$scope.transthis.length;k++)
              {
                  if($scope.budgetsthis[j].id==$scope.transthis[k].id)
                  {
                    if($scope.budgetsthis[j].type==1)
                    {
                      var left = $scope.transthis[k].amount-$scope.budgetsthis[j].amount;
                    }
                    else {
                      var left = $scope.budgetsthis[j].amount - $scope.transthis[k].amount;
                    }


                    $scope.budgetsdata.push({category:$scope.budgetsthis[j].category,type:$scope.budgetsthis[j].type,bamount:$scope.budgetsthis[j].amount,lamount:$scope.transthis[k].amount,inhand:left});

                  }
              }

           }

         ////console.log($scope.budgetsdata);
         }

       }, function (err) {
         $ionicLoading.show({ template: err.message });
           setTimeout(function() {
           $ionicLoading.hide();
         },2000);
       });

    };

});
moneyTracker.controller("CategoriesController", function($scope, $ionicPlatform,$ionicLoading, $cordovaSQLite,$location) {

    $scope.categories = [];
    $scope.catAdd = {};
    $scope.types = [
    {value: '1', displayName: 'Income'},
    {value: '2', displayName: 'Expence'}
    ];
    $scope.ctype = '1';

        var query = "SELECT id,category_name,category_type FROM Categories";
        $cordovaSQLite.execute(db, query, []).then(function(res) {

            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                  var ctype="Expence";
                  if(res.rows.item(i).category_type==1)
                  {
                    ctype="Income";
                  }
                    $scope.categories.push({id: res.rows.item(i).id, category_name: res.rows.item(i).category_name,category_type: ctype});

              }
            }

        }, function (err) {
          $ionicLoading.show({ template: err.message });
            setTimeout(function() {
            $ionicLoading.hide();
          },2000);
        });

    $scope.updatetype = function(item)
    {
      $scope.ctype = item;
    };
     $scope.insert = function() {

       $location.path("/app/categoryadd");
     };
     $scope.addCat = function(form) {
         if(form.$valid) {
             var query = "INSERT INTO Categories (category_name, category_type) VALUES (?,?)";


               $cordovaSQLite.execute(db, query, [$scope.catAdd.cname, $scope.ctype]).then(function(res) {
                   $scope.categories.push({id: res.insertId, category_name: $scope.catAdd.cname, category_type: $scope.ctype});
                     $location.path("/app/categories");

                }, function (err) {
                     if(err.message .indexOf("UNIQUE") > -1)
                     {
                        $ionicLoading.show({ template: "Category already exists!!" });
                     }
                     else {
                         $ionicLoading.show({ template: err.message });
                     }

                     setTimeout(function() {
                    $ionicLoading.hide();
                  },2000);
                });
          }
     };
});
moneyTracker.controller("CategoryController", function($scope, $ionicPlatform,$ionicLoading,$ionicPopup, $cordovaSQLite,$location,$stateParams) {

  $scope.category = [];

 $ionicPlatform.ready(function() {
     var query = "SELECT id, category_name,category_type FROM Categories where id = ?";
     $cordovaSQLite.execute(db, query, [$stateParams.categoryId]).then(function(res) {
           //console.log(res.rows.length);
         if(res.rows.length > 0) {
             for(var i = 0; i < res.rows.length; i++) {
               var ctype="Expence";
               if(res.rows.item(i).category_type==1)
               {
                 ctype="Income"
               }
                  $scope.category.push({id: res.rows.item(i).id,name: res.rows.item(i).category_name,type: ctype});
               //console.log($scope.category);
           }


         }
     }, function (err) {
       $ionicLoading.show({ template: err.message });
       setTimeout(function() {
      $ionicLoading.hide();
    },2000);
     });
 });

 $scope.deleteCat = function() {
   $ionicPopup.confirm({
     title: 'Delete Category',
     template: 'This operation will delete data from each tables that belongs to this category.Are you sure you want to delete?'
   }).then(function(res) {
     if(res) {
       var query1 = "delete from trans where category=?";
       var query2 = "delete from budgets where category=?";
       var query3 = "delete from Categories where id=?";
       $cordovaSQLite.execute(db, query1, [$stateParams.categoryId]).then(function(res) {

             $cordovaSQLite.execute(db, query2, [$stateParams.categoryId]).then(function(res) {

                   $cordovaSQLite.execute(db, query3, [$stateParams.categoryId]).then(function(res) {
                         $location.path("/app/categories");

                   }, function (err) {
                     $ionicLoading.show({ template: err.message });

                   });

             }, function (err) {
               $ionicLoading.show({ template: err.message });

             });

       }, function (err) {
         $ionicLoading.show({ template: err.message });

       });

     } else {
       //console.log('You are not sure');
     }
   });

   setTimeout(function() {
  $ionicLoading.hide();
},2000);
            }



});

moneyTracker.controller("budgetsController", function($scope,$filter,$ionicLoading,$ionicPlatform,$cordovaSQLite,$location) {

  if(oldmonth==null)
  {
  $scope.datehidden=new Date();
  $scope.month=$filter('date')(new Date(),'MMM-yyyy');
}
else {

  $scope.datehidden=new Date(oldmonth);
  $scope.month=$filter('date')($scope.datehidden,'MMM-yyyy');

}
  var m =   $scope.datehidden.getMonth()+1;
  if(m.toString().length<2)
  {
    m='0'+m.toString();
  }
  var y=  $scope.datehidden.getFullYear();

    $scope.budgets = [];
    $scope.budgetadd = {};
    $scope.categories=[];
        var query = "SELECT id,category_name FROM Categories order by id asc";
        $cordovaSQLite.execute(db, query, []).then(function(res) {

            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                    $scope.categories.push({id: res.rows.item(i).id, name: res.rows.item(i).category_name});

              }
              $scope.category=1;
            }

        }, function (err) {
           $ionicLoading.show({ template: err.message });
           setTimeout(function() {
          $ionicLoading.hide();
        },2000);
        });


        $scope.updatecat = function(item)
        {
          $scope.category = item;
        };

        var query = "SELECT a.id,b.category_name as category,a.amount FROM budgets as a,Categories as b where a.category=b.id and strftime('%m', a.month) ='"+m+"' and strftime('%Y', a.month) ='"+y+"'";
        $cordovaSQLite.execute(db, query, []).then(function(res) {

            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                    $scope.budgets.push({id: res.rows.item(i).id, category: res.rows.item(i).category,amount: res.rows.item(i).amount});

                      $scope.dbcurenc=dbcurency;
              }
            }

        }, function (err) {
          $ionicLoading.show({ template: err.message });
          setTimeout(function() {
         $ionicLoading.hide();
       },2000);
        });


     $scope.insert = function() {

       $location.path("/app/budgetadd");
     };
     $scope.addbudget = function(form) {
       if(form.$valid) {
             var query = "INSERT INTO budgets (category,amount,month) VALUES (?,?,?)";
                $cordovaSQLite.execute(db, query, [$scope.category, $scope.budgetadd.amount,$scope.datehidden.toISOString()]).then(function(res) {
                   $scope.budgets.push({id: res.insertId, budget_name: $scope.budgetadd.category, amount: $scope.budgetadd.amount});
                     $location.path("/app/budgets");

                }, function (err) {
                  $ionicLoading.show({ template: err.message });
                  setTimeout(function() {
                 $ionicLoading.hide();
               },2000);
                });
              };

     };

     //calendar controll
     $scope.prevMonthfor = function() {

       var datefoo = new Date($scope.datehidden);
        datefoo.setMonth(datefoo.getMonth() -1);
        $scope.datehidden=datefoo;
        $scope.month=$filter('date')(datefoo,'MMM-yyyy');




     };
     $scope.nextMonthfor = function() {

        var datefoo = new Date($scope.datehidden);
        datefoo.setMonth(datefoo.getMonth() + 1);

        $scope.datehidden=datefoo;

        $scope.month=$filter('date')(datefoo,'MMM-yyyy');

     };

     $scope.prevMonth = function() {
        $scope.budgets = [];
       var datefoo = new Date($scope.datehidden);
        datefoo.setMonth(datefoo.getMonth() -1);
        $scope.datehidden=datefoo;
        oldmonth =new Date($scope.datehidden);
        $scope.month=$filter('date')(datefoo,'MMM-yyyy');
        var m = datefoo.getMonth()+1;
        if(m.toString().length<2)
        {
          m='0'+m.toString();
        }
        var y=datefoo.getFullYear();
        var query = "SELECT a.id,b.category_name as category,a.amount FROM budgets as a,Categories as b where a.category=b.id and strftime('%m', a.month) ='"+m+"' and strftime('%Y', a.month) ='"+y+"'";
        $cordovaSQLite.execute(db, query, []).then(function(res) {

            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                    $scope.budgets.push({id: res.rows.item(i).id, category: res.rows.item(i).category,amount: res.rows.item(i).amount});

                      $scope.dbcurenc=dbcurency;
              }
            }

        }, function (err) {
          $ionicLoading.show({ template: err.message });
          setTimeout(function() {
         $ionicLoading.hide();
       },2000);
        });



     };
     $scope.nextMonth = function() {
        $scope.budgets = [];
       var datefoo = new Date($scope.datehidden);
        datefoo.setMonth(datefoo.getMonth() + 1);

        $scope.datehidden=datefoo;
       oldmonth =new Date($scope.datehidden);
        $scope.month=$filter('date')(datefoo,'MMM-yyyy');
        var m = datefoo.getMonth()+1;
        if(m.toString().length<2)
        {
          m='0'+m.toString();
        }
        var y=datefoo.getFullYear();
        var query = "SELECT a.id,b.category_name as category,a.amount FROM budgets as a,Categories as b where a.category=b.id and strftime('%m', a.month) ='"+m+"' and strftime('%Y', a.month) ='"+y+"'";
        $cordovaSQLite.execute(db, query, []).then(function(res) {

            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                    $scope.budgets.push({id: res.rows.item(i).id, category: res.rows.item(i).category,amount: res.rows.item(i).amount});

                      $scope.dbcurenc=dbcurency;
              }
            }

        }, function (err) {
          $ionicLoading.show({ template: err.message });
          setTimeout(function() {
         $ionicLoading.hide();
       },2000);
        });




     };



});
moneyTracker.controller("budgetController", function($scope,$ionicLoading,$ionicPlatform,$stateParams,$ionicPopup,$cordovaSQLite,$location,$stateParams) {

  $scope.budget = [];

 $ionicPlatform.ready(function() {
     var query = "SELECT a.id,b.category_name,a.amount FROM budgets as a, Categories as b where a.id = ? and a.category=b.id";
       //console.log($stateParams.budgetId);
     $cordovaSQLite.execute(db, query, [$stateParams.budgetId]).then(function(res) {

         if(res.rows.length > 0) {
             for(var i = 0; i < res.rows.length; i++) {
                  $scope.budget.push({id: res.rows.item(i).id,name: res.rows.item(i).category_name,amount: res.rows.item(i).amount});

               $scope.dbcurenc=dbcurency;
           }


         }
     }, function (err) {
       $ionicLoading.show({ template: err.message });
       setTimeout(function() {
      $ionicLoading.hide();
    },2000);
     });
 });

 $scope.deleteBud = function() {

   $ionicPopup.confirm({
     title: 'Delete Budget',
     template: 'This operation will delete data.Are you sure you want to delete?'
   }).then(function(res) {
     if(res) {

       var query = "delete from budgets where id=?";

       $cordovaSQLite.execute(db, query, [$stateParams.budgetId]).then(function(res) {
             $location.path("/app/budgets");

       }, function (err) {
         $ionicLoading.show({ template: err.message });

       });

     } else {
       //console.log('You are not sure');
     }
   });

   setTimeout(function() {
  $ionicLoading.hide();
},2000);
}


});
moneyTracker.controller("transController", function($scope, $ionicPlatform,$ionicLoading,$cordovaSQLite,$location,$filter) {
  $scope.trans = [];
  $scope.transadd = {};

    $scope.datehidden=new Date();
    $scope.month=$filter('date')(new Date(),'MMM-yyyy');
    var m =   $scope.datehidden.getMonth()+1;
    if(m.toString().length<2)
    {
      m='0'+m.toString();
    }
    var y=  $scope.datehidden.getFullYear();
//console.log(m+'/'+y);
        var query = "SELECT a.id,a.type,b.category_name,a.amount FROM trans as a,Categories as b where a.category=b.id and strftime('%m', a.date) ='"+m+"' and strftime('%Y', a.date) ='"+y+"'";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
           ////console.log(res);
            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                  var ctype="Expence";
                  if(res.rows.item(i).type==1)
                  {
                    ctype="Income"
                  }
                    $scope.trans.push({id: res.rows.item(i).id, type:ctype,category: res.rows.item(i).category_name,amount: res.rows.item(i).amount});
                   $scope.dbcurenc=dbcurency;
              }
            }

        }, function (err) {
            console.error(err.message);
        });
    $scope.categories=[];
        var query = "SELECT b.id,b.category_name FROM budgets as a, Categories as b where a.category=b.id and strftime('%m', a.month) ='"+m+"' and strftime('%Y', a.month) ='"+y+"' order by a.id asc";

        $cordovaSQLite.execute(db, query, []).then(function(res) {
      ////console.log(res);
            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                    $scope.categories.push({id: res.rows.item(i).id, name: res.rows.item(i).category_name});

              }
              $scope.category=1;
            }

        }, function (err) {
            console.error(err.message);
        });


        $scope.updatecat = function(item)
        {
          $scope.category = item;
        };

     $scope.insert = function() {

       $location.path("/app/transadd");
     };

     $scope.currentDate = new Date();
     $scope.title = "Transaction Date";
    $scope.trans.date= $scope.currentDate .toISOString();
      $scope.datePickerCallback = function (val) {
    if(typeof(val)==='undefined'){
        //console.log('Date not selected');
    }else{

        $scope.trans.date=addDays(val,1).toISOString();
    }

    function addDays(date, amount) {
      var tzOff = date.getTimezoneOffset() * 60 * 1000,
          t = date.getTime(),
          d = new Date(),
          tzOff2;

      t += (1000 * 60 * 60 * 24) * amount;
      d.setTime(t);

      tzOff2 = d.getTimezoneOffset() * 60 * 1000;
      if (tzOff != tzOff2) {
        var diff = tzOff2 - tzOff;
        t += diff;
        d.setTime(t);
      }

      return d;
    }
    };
     $scope.addtran = function(form) {
        if(form.$valid) {

             var query = "select category_type from Categories where id=?";
             $cordovaSQLite.execute(db, query, [$scope.category]).then(function(res) {

                 if(res.rows.length > 0) {
                   var type=null;
                  type=res.rows.item(0).category_type;

                  var query1 = "INSERT INTO trans (type,category,amount,date,note) VALUES (?,?,?,?,?)";

                 var note=$scope.trans.note;
                 if(note==undefined)
                 {
                   note="";
                 }

                 $cordovaSQLite.execute(db, query1, [type,$scope.category, $scope.trans.amount,$scope.trans.date.trim(),note]).then(function(res) {
                    $scope.trans.push({id: res.insertId, type: type,category:$scope.category,amount: $scope.trans.amount});
                      $location.path("/app/trans");

                 }, function (err) {
                    $ionicLoading.show({ template: err.message });
                   setTimeout(function() {
                  $ionicLoading.hide();
                },2000);
                 });

                 }

             }, function (err) {
               $ionicLoading.show({ template: err.message });
              setTimeout(function() {
             $ionicLoading.hide();
           },2000);
             });

         };
     };

     //calendar controll
     $scope.prevMonth = function() {
          $scope.trans=[];
       var datefoo = new Date($scope.datehidden);
        datefoo.setMonth(datefoo.getMonth() -1);
        $scope.datehidden=datefoo;
        $scope.month=$filter('date')(datefoo,'MMM-yyyy');

        var m = datefoo.getMonth()+1;
        if(m.toString().length<2)
        {
          m='0'+m.toString();
        }
        var y=datefoo.getFullYear();
        var query = "SELECT a.id,a.type,b.category_name,a.amount FROM trans as a,Categories as b where a.category=b.id and strftime('%m', a.date) ='"+m+"' and strftime('%Y', a.date) ='"+y+"'";
           //console.log(query);
           $cordovaSQLite.execute(db, query, []).then(function(res) {
                 ////console.log(res);
               if(res.rows.length > 0) {
                   for(var i = 0; i < res.rows.length; i++) {
                     var ctype="Expence";
                     if(res.rows.item(i).type==1)
                     {
                       ctype="Income"
                     }
                       //console.log(res.rows.item(i));
                       $scope.trans.push({id: res.rows.item(i).id, type:ctype,category: res.rows.item(i).category_name,amount: res.rows.item(i).amount});

                 }
               }


           }, function (err) {
               console.error(err.message);
           });


     };
     $scope.nextMonth = function() {
         $scope.trans=[];
       var datefoo = new Date($scope.datehidden);
        datefoo.setMonth(datefoo.getMonth() + 1);

        $scope.datehidden=datefoo;

        $scope.month=$filter('date')(datefoo,'MMM-yyyy');

        var m = datefoo.getMonth()+1;
        if(m.toString().length<2)
        {
          m='0'+m.toString();
        }
        var y=datefoo.getFullYear();

     var query = "SELECT a.id,a.type,b.category_name,a.amount FROM trans as a,Categories as b where a.category=b.id and strftime('%m', a.date) ='"+m+"' and strftime('%Y', a.date) ='"+y+"'";
        //console.log(query);
        $cordovaSQLite.execute(db, query, []).then(function(res) {
              ////console.log(res);
            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                  var ctype="Expence";
                  if(res.rows.item(i).type==1)
                  {
                    ctype="Income"
                  }
                    //console.log(res.rows.item(i));
                    $scope.trans.push({id: res.rows.item(i).id, type:ctype,category: res.rows.item(i).category_name,amount: res.rows.item(i).amount});

              }
            }


        }, function (err) {
            console.error(err.message);
        });

     };
});
moneyTracker.controller("tranController", function($scope,$filter,$ionicPopup, $ionicPlatform,$ionicLoading, $cordovaSQLite,$location,$stateParams) {

  $scope.tran = [];

 $ionicPlatform.ready(function() {
            var query = "SELECT a.id,b.category_type as type,b.category_name as category,a.amount,strftime('%d/%m/%Y',a.date) as date,note FROM trans as a, Categories as b where a.id = ? and a.category=b.id";
       //console.log($stateParams.transid);
        $cordovaSQLite.execute(db, query, [$stateParams.transid]).then(function(res) {

         if(res.rows.length > 0) {
             for(var i = 0; i < res.rows.length; i++) {
               var ctype="Expence";
               if(res.rows.item(i).type==1)
               {
                 ctype="Income"
               }
               var date = $filter('date')(res.rows.item(i).date,'MMM dd ,yyyy');
                $scope.tran.push({type: ctype,category:res.rows.item(i).category,amount: res.rows.item(i).amount,date: date,note: res.rows.item(i).note});
               //console.log($scope.tran);
                  $scope.dbcurenc=dbcurency;
           }


         }
     }, function (err) {
         console.error(err);
     });
 });


 $scope.deleteTrans = function() {

   $ionicPopup.confirm({
     title: 'Delete Transaction',
     template: 'This operation will delete data.Are you sure you want to delete?'
   }).then(function(res) {
     if(res) {

       var query = "delete from trans where id=?";

       $cordovaSQLite.execute(db, query, [$stateParams.transid]).then(function(res) {
             $location.path("/app/trans");

       }, function (err) {
         $ionicLoading.show({ template: err.message });

       });

     } else {
       //console.log('You are not sure');
     }
   });

   setTimeout(function() {
  $ionicLoading.hide();
 },2000);
 }



});


moneyTracker.controller("reportController", function($scope,$filter, $ionicPlatform,$ionicLoading,$cordovaSQLite,$q,$cordovaFile) {

  $scope.datehidden=new Date();
  $scope.month=$filter('date')(new Date(),'MMM-yyyy');
  var m =   $scope.datehidden.getMonth()+1;
  if(m.toString().length<2)
  {
    m='0'+m.toString();
  }
  var y=  $scope.datehidden.getFullYear();

     $scope.trans =[];
     $scope.transt =[];
     $scope.dbcurenc=dbcurency;
      $ionicPlatform.ready(function() {
          var query = "SELECT b.category_name,sum(a.amount) as total FROM trans as a,Categories as b where a.category=b.id and strftime('%m', a.date) ='"+m+"' and strftime('%Y', a.date) ='"+y+"' group by a.category";
          $cordovaSQLite.execute(db, query, []).then(function(res) {
              ////console.log(res);
              if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                   $scope.trans.push({category: res.rows.item(i).category_name,amount:res.rows.item(i).total});
                  //console.log($scope.trans);

              }



              }
              else {

                  console.error('Category Trans data not found');
              }

          }, function (err) {
              console.error(err);
          });
          var query = "SELECT sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by type";
          $cordovaSQLite.execute(db, query, []).then(function(res) {

            if(res.rows.length ==1) {
              var earn = res.rows.item(0).total;
              var buy = 0;
              var bal = earn-buy;
            }
            else if (res.rows.length ==2) {
              var earn = res.rows.item(0).total;
              var buy = res.rows.item(1).total;
              var bal = earn-buy;
            }
            else {
              var earn = 0;
              var buy = 0;
              var bal = earn-buy;
             }
              $scope.transt.push({income:earn,expence:buy,balance:bal});



                }, function (err) {
                    console.error(err);
                });
      });
      //calendar controll
      $scope.prevMonth = function() {
        $scope.trans =[];
        $scope.transt =[];
        $scope.dbcurenc=dbcurency;

        var datefoo = new Date($scope.datehidden);
         datefoo.setMonth(datefoo.getMonth() -1);
         $scope.datehidden=datefoo;
         $scope.month=$filter('date')(datefoo,'MMM-yyyy');
         var m = datefoo.getMonth()+1;
         if(m.toString().length<2)
         {
           m='0'+m.toString();
         }
            var y=datefoo.getFullYear();
         var query = "SELECT b.category_name,sum(a.amount) as total FROM trans as a,Categories as b where a.category=b.id and strftime('%m', a.date) ='"+m+"' and strftime('%Y', a.date) ='"+y+"' group by a.category";
         $cordovaSQLite.execute(db, query, []).then(function(res) {
             ////console.log(res);
             if(res.rows.length > 0) {
               for(var i = 0; i < res.rows.length; i++) {
                  $scope.trans.push({category: res.rows.item(i).category_name,amount:res.rows.item(i).total});
                 //console.log($scope.trans);

             }



             }
             else {

                 console.error('Category Trans data not found');
             }

         }, function (err) {
             console.error(err);
         });
         var query = "SELECT sum(amount) as total FROM trans where strftime('%m', date) ='"+m+"' and strftime('%Y', date) ='"+y+"' group by type";
         $cordovaSQLite.execute(db, query, []).then(function(res) {

           if(res.rows.length ==1) {
             var earn = res.rows.item(0).total;
             var buy = 0;
             var bal = earn-buy;
           }
           else if (res.rows.length ==2) {
             var earn = res.rows.item(0).total;
             var buy = res.rows.item(1).total;
             var bal = earn-buy;
           }
           else {
             var earn = 0;
             var buy = 0;
             var bal = earn-buy;
            }
             $scope.transt.push({income:earn,expence:buy,balance:bal});
               }, function (err) {
                   console.error(err);
               });



      };
      $scope.nextMonth = function() {
        $scope.trans =[];
        $scope.transt =[];
        $scope.dbcurenc=dbcurency;
         var datefoo = new Date($scope.datehidden);
         datefoo.setMonth(datefoo.getMonth() + 1);

         $scope.datehidden=datefoo;

         $scope.month=$filter('date')(datefoo,'MMM-yyyy');
         var m = datefoo.getMonth()+1;
         if(m.toString().length<2)
         {
           m='0'+m.toString();
         }
            var y=datefoo.getFullYear();
         var query = "SELECT b.category_name,sum(a.amount) as total FROM trans as a,Categories as b where a.category=b.id and strftime('%m', a.date) ='"+m+"' and strftime('%Y', a.date) ='"+y+"' group by a.category";
         $cordovaSQLite.execute(db, query, []).then(function(res) {
             ////console.log(res);
             if(res.rows.length > 0) {
               for(var i = 0; i < res.rows.length; i++) {
                  $scope.trans.push({category: res.rows.item(i).category_name,amount:res.rows.item(i).total});
                 //console.log($scope.trans);

             }



             }
             else {

                 console.error('Category Trans data not found');
             }

         }, function (err) {
             console.error(err);
         });
         var query = "SELECT sum(amount) as total FROM trans where strftime('%m',date) ='"+m+"' and strftime('%Y',date) ='"+y+"' group by type";
         $cordovaSQLite.execute(db, query, []).then(function(res) {

           if(res.rows.length ==1) {
             var earn = res.rows.item(0).total;
             var buy = 0;
             var bal = earn-buy;
           }
           else if (res.rows.length ==2) {
             var earn = res.rows.item(0).total;
             var buy = res.rows.item(1).total;
             var bal = earn-buy;
           }
           else {
             var earn = 0;
             var buy = 0;
             var bal = earn-buy;
            }
             $scope.transt.push({income:earn,expence:buy,balance:bal});
               }, function (err) {
                   console.error(err);
               });

      };

    $scope.sendmail= function()
    {
      if(window.cordova) {

        $cordovaFile.checkFile(cordova.file.externalDataDirectory, "report.csv")
         .then(function (success) {
           cordova.plugins.email.isAvailable(function (isAvailable) {
                  if(isAvailable)
                  {
                     cordova.plugins.email.open({
                      to:      Mail,
                      subject: 'Money Tracker July,2015 Reports',
                      body:    '<h1>Money Tracker July,2015 Reports</h1>',
                      isHtml:  true,
                      attachments: [cordova.file.externalDataDirectory+'report.csv' ]
                  });
                  $ionicLoading.show({ template: 'Mail successfully send' });


                 }
                 else {
                   {
                     $ionicLoading.show({ template: 'Configure your email application first!!' });

                   }
                 }
           });
         }, function (error) {
           $ionicLoading.show({ template: 'File not exists. please export report first!!!' });
         });
       }
       else {
          $ionicLoading.show({ template: 'This Feature Only Available On Real Device!' });
       }



      setTimeout(function() {
       $ionicLoading.hide();
     },2000);
    };
    $scope.exportCSV = function() {
      if(window.cordova) {

      var strfoo="Income,Expence,Balance\n"+$scope.transt[0].income+","+$scope.transt[0].expence+","+
       $scope.transt[0].balance+"\n\nCategory wise Transaction History\n";
           for(var i = 0; i < $scope.trans.length; i++) {
               strfoo +=$scope.trans[i]["category"]+",";

           }
           strfoo = strfoo.substr(0, strfoo.length - 1);
            strfoo +="\n";
           for(var i = 0; i < $scope.trans.length; i++) {
               strfoo +=$scope.trans[i]["amount"]+",";

           }
          var myString = strfoo.substr(0, strfoo.length - 1);
            $ionicLoading.show({ template: 'Exporting data...' });

            $cordovaFile.checkFile(cordova.file.externalDataDirectory, "report.csv")
             .then(function (success) {
               $cordovaFile.removeFile(cordova.file.externalDataDirectory, "report.csv")
               .then(function (success) {
                 window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
               //console.log("got main dir",dir);
               dir.getFile("report.csv", {create:true,exclusive: true}, function(file) {
                 //console.log("got the file", file);
                 file.createWriter(function(writer) {
                   writer.write(myString);

                 // $ionicLoading.show({ template: 'report.csv file is exported at sdcard/Android/data/com.ionicframework.moneyTracker/files/' });

             })

           });
             });
               }, function (error) {
                 $ionicLoading.show({ template: 'Export File Remove Pronblem!!' });
               });
             },function(error){
               window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
             //console.log("got main dir",dir);
             dir.getFile("report.csv", {create:true,exclusive: true}, function(file) {
               //console.log("got the file", file);
               file.createWriter(function(writer) {
                 writer.write(myString);

               // $ionicLoading.show({ template: 'report.csv file is exported at sdcard/Android/data/com.ionicframework.moneyTracker/files/' });

           })

         });
           });
             });

             }
             else {
                $ionicLoading.show({ template: 'This Feature Only Available On Real Device!' });
             }
  setTimeout(function() {
   $ionicLoading.hide();
 }, 2000);

    };

});
moneyTracker.controller("changeaccessController", function($scope, $ionicPlatform,$ionicLoading, $cordovaSQLite,$location) {



          $scope.user = {
        username: '',
        password : ''
         };
      $scope.signIn = function(form) {

        if(form.$valid) {

        $ionicLoading.show({ template: 'Saving...' });
       $ionicPlatform.ready(function() {
           var query = "UPDATE Users set username=?,password=?";
           $cordovaSQLite.execute(db, query, [$scope.user.username,$scope.user.password]).then(function(res) {


                 $ionicLoading.hide();
                 $location.path("/login");


           }, function (err) {

               $ionicLoading.show({ template: err.message});
           });
       });

        }
      };

});
moneyTracker.controller("settingsController", function($scope, $ionicPlatform,$ionicLoading, $cordovaSQLite,$location) {
  $scope.viewindpls = [
{value: '1', displayName: 'Months'},
{value: '2', displayName: 'Years'}
];
$scope.curencies = [
{value: '1', displayName: '$(Dollar)'},
{value: '2', displayName: '€(Euro)'},
{value: '3', displayName: '£(Pound)'},
{value: '4', displayName: '৳(BDT)'},
];
  $scope.curency = dbcurencycode;

  /*var query = "SELECT viewin,curency  FROM settings";
  $cordovaSQLite.execute(db, query, []).then(function(res) {

      if(res.rows.length > 0) {
        var v = res.rows.item(0).viewin;
        var c = res.rows.item(0).curency;
        //$scope.viewin = "'"+v+"'";
        $scope.foo="3"

       }
        else {

          $scope.viewin = '1';
          $scope.curency = '1';
        }

        }, function (err) {
             $ionicLoading.show({ template: err.message});
             setTimeout(function() {
              $ionicLoading.hide();
             }, 2000);
        });*/

    // $scope.curency=foo;





        /*  $scope.settings = {
             viewin: '',
               currency : ''
         };*/

         $scope.updatecurency = function(item) {
          $scope.curency=item;
         }
         $scope.updateviewin = function(item) {
          $scope.viewin=item;
         }

         $scope.reportbug= function(){
             $ionicLoading.show({ template: 'https://github.com/hrshadhin/moneyTracker/issues' });
             setTimeout(function() {
              $ionicLoading.hide();
            },10000);
         };
      $scope.saveSettings = function() {



        $ionicLoading.show({ template: 'Saving...' });
       $ionicPlatform.ready(function() {
           var query = "UPDATE settings set viewin=?,curency=?";
           $cordovaSQLite.execute(db, query, [1,$scope.curency]).then(function(res) {

               $location.path("/app/dashboard");


           }, function (err) {

                 $ionicLoading.show({ template: err.message});
           });
           setTimeout(function() {
            $ionicLoading.hide();
           },2000);
       });

     };


});
