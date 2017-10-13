const restify = require('restify');
const botbuilder = require('botbuilder');

// setup restify server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
    console.log('%s bot started at %s', server.name, server.url);
});

// create chat connector
const connector = new botbuilder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});

// Listening for user input
server.post('/api/messages', connector.listen());
//menu 
var myMenu = {
    "Créer une nouvelle alarme" : {
        "choice": "createAlarm"
    },
    "Consulter les alarmes actives" : {
        "choice": "showAlarmActive"
    },
    "Consulter tout les alarmes": {
        "choice": "showAlarmAll"
    }
}

var bot = new botbuilder.UniversalBot(connector, [
    function(session) {
        session.beginDialog('myMenu');
    }
]);

var alarms = [];

bot.dialog('myMenu', [
    function(session) {
        botbuilder.Prompts.choice(session, 'Menu : ', myMenu, {
            listStyle: botbuilder.ListStyle["button"]
        });    
    },
    function(session, results) {
        session.beginDialog(myMenu[results.response.entity].choice);
    } 
]);

bot.dialog('createAlarm', [
    function(session, args, next) {
        session.dialogData.alarm = args || {};
        if(!session.dialogData.alarm.name) {
            botbuilder.Prompts.text(session, "Quel est le nom de votre alarme?");
        }else{
            next();
        }     
    },
    function(session, results, next) {
        if(results.response) {
            session.dialogData.alarm.name = results.response;
        }
        if(!session.dialogData.alarm.date) {
            botbuilder.Prompts.time(session, "Quel date/heure?");
        }else{
            next();
        }
    },
    function(session, results, next) {
        if(results.response) {
            session.dialogData.alarm.time = botbuilder.EntityRecognizer.resolveTime([results.response]);
        }
        if(!session.dialogData.alarm.active) {
            botbuilder.Prompts.confirm(session, "Voulez-vous activer votre alarm?");
        }
    },
    function(session, results, next) {
        if(results.response) {
            session.dialogData.alarm.active = results.response;
        }
        var alarm = {
            "name" : session.dialogData.alarm.name,
            "time" : session.dialogData.alarm.time,
            "active" : session.dialogData.alarm.active
        }
        if(alarm.name && alarm.time) {
            
            alarms.push(alarm);
            session.userData.alarms = alarms;

            session.send('Alarme  <<' + alarm.name + '>> a bien été enregistré!');
            session.replaceDialog('myMenu');
        }else{
            session.replaceDialog('create');
        }
    }
])
.reloadAction(
    "restart", "",
    {
        matches: /^restart/i,
        confirmPrompt: "êtes vous sûr de vouloir quitter cette alarme??"
    }
)
.cancelAction(
    "cancel", "Ops vous avez abondonner la création de l'alarme",
    {
        matches: /^cancel/i,
        confirmPrompt: "êtes vous sur de vouloir annuler?"
    }
);

//les alarmes active
bot.dialog('showAlarmActive', [
    function(session) {
        var message = "Vos alarmes actives : <br/>"
        if(session.userData.alarms) {
            for(var alarm of session.userData.alarms) {
                if(alarm.active) {
                    message += "-  " + alarm.name + "      -  à: " + alarm.time + "    - status : active<br/>";
                }
            }
            session.send(message);
            session.replaceDialog('myMenu');
        }else{
            session.send(':( rien pour le moment');
            session.replaceDialog('myMenu');
        }
    }
]);
//tout les alarmes
bot.dialog('showAlarmAll', [
    function(session) {
        var message = "Tous les alarmes : <br/>"
        if(session.userData.alarms) {
            for(var alarm of session.userData.alarms) {
                var isActivated = (alarm.active) ? "Active" : "Inactive";
                message += "- Nom: " + alarm.name + "   -   à : " + alarm.time + "  -       Statut: " + isActivated + " <br/>";
            }
            session.send(message);
            session.replaceDialog('myMenu');
        }else{
            session.send('Aucune alarme');
            session.replaceDialog('myMenu');
        }    
    }
]);

