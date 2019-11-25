'use strict';

module.exports.handler = async event => {

    //use aws profile: [serverless-admin]
    var AWS = require('aws-sdk');

    //if test in local dev , then set credentials
    var credentials = new AWS.SharedIniFileCredentials({profile: 'serverless-admin'});
    AWS.config.credentials = credentials;
    //if in lambda in AWS , use IAM Role for Lambda , the IAM user is serverless-admin at this point


     var iam = new AWS.IAM({apiVersion:'2010-05-08'});

     //TODO get UserName from CloudWatch event 
     try{
          var params = { UserName: "Bob"};

          //this disables user from login into console
          await iam.deleteLoginProfile(params).promise();

          //note: to disable user from accessing aws via command line or API
         // need to make keys inactive or delete them , using iam.UpdateAccessKey, and iam.DeleteAccessKey

         return {statusCode:200} ;
     }
     catch (e) {
               console.log(e);

               return {statusCode:400} ;
     }

};
