'use strict';
var AWS = require('aws-sdk');


module.exports.handler = async event => {



    console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2));
    console.info("EVENT\n" + JSON.stringify(event, null, 2));

    var region = process.env.AWS_REGION_ENV;
    var secretName = process.env.RDS_POSTGRES_CONNECTION_AWS_SECRET_NAME;

    //if test in local dev , then set credentials

    if(process.env.stage !== undefined && process.env.stage==="local_dev"){
        var credentials = new AWS.SharedIniFileCredentials({profile: 'serverless-admin'});
        AWS.config.credentials = credentials;
        AWS.config.region = region;
    }
    
    //if in lambda in AWS , use IAM Role for Lambda , the IAM user is serverless-admin at this point
     var iam = new AWS.IAM({apiVersion:'2010-05-08'});
     var secretsManager = new AWS.SecretsManager({apiVersion:'2017-10-17'});


    //TODO get UserName from CloudWatch event
    try{

        var secretValue = await secretsManager.getSecretValue({SecretId: 'automation_db'}).promise();
        
        const pg = require('pg');


        if('SecretString' in secretValue.$response.data) {

            //Convert String to JSON Object

            var jsonSecretValues = JSON.parse(secretValue.$response.data.SecretString);

            const pool = new pg.Pool({user:jsonSecretValues.username, host:jsonSecretValues.host,
            database:jsonSecretValues.dbname,password: jsonSecretValues.password, port:jsonSecretValues.port});

            // query to find logins with more than 3 failures in last 24 hours
            const queryText = 'SELECT user_identity->\'userName\' as userName\n' +
                '              FROM public.cloudtrailevents\n' +
                '              WHERE response_elements->>\'ConsoleLogin\'=\'Failure\'\n' +
                '              and user_identity->>\'userName\''+'=$1'+
                '              GROUP BY userName\n' +
                '              HAVING count(*) >= 3; '
            const queryParams = ['david'];

            const queryResult = await pool.query(queryText, queryParams);
           

            console.info(queryResult.rows[0]);

            var userNameObject =    queryResult.rows[0];

            await pool.end();


            var params = {UserName: userNameObject.username};

            //this disables user from login into console
            await iam.deleteLoginProfile(params).promise();

            //note: to disable user from accessing aws via command line or API
            // need to make keys inactive or delete them , using iam.UpdateAccessKey, and iam.DeleteAccessKey

            return {statusCode: 200};
        }
        else{
            return {statusCode: 400};
        }
     }
     catch (e) {
               console.log(e);

               return {statusCode:400} ;
     }

};
