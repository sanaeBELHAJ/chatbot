var restify = require('restify');
var botbuilder = require('botbuilder');

//setuper restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
	console.log('%s bot started at %s', server.name, server.url);
});
//create chat connector
var connector = new botbuilder.ChatConnector({
	appId: process.env.APP_ID,
	appPassword: process.env.APP_SECRET
});
//Listning for user inputs
server.post('/api/messages', connector.listen());

//Reply by echoing 
var bot =  new botbuilder.UniversalBot(connector, function(session){
//session.send('you have tapped : %s | [Length : %s]', session.message.text, session.message.text.lengh);
//session.send(`you have tapped: ${session.message.text}`);
//session.send(`type: ${session.message.type}`);
//trouver une solution
bot.on('typing',function(){
    session.send(`TEST TEST`);
});

/*bot.on('contactRelationUpdate',function(){
    session.send(`Bonjour je suis lààààà!`);
});*/

bot.on('conversationUpdate', function(message){
    if(message.membersAdded && message.membersAdded.length > 0){
        var membersAdded = message.membersAdded
            .map(function(x){
                var isSelf = x.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : x.name) || ' ' + '(Id = ' + x.id + ')'
            }).join(', '); //sépare le tableau en string

        bot.send(new botbuilder.Message()
            .address(message.address)
            .text('Bienvenue ' + membersAdded)
        );
    }
});
bot.on('contactRelationUpdate', function(message){
    if (message.action === 'add') {
        console.log('yes');
        var name = message.user ? message.user.name : null;
        console.log(name);
        var reply = new botbuilder.Message()
                .address(message.address)
                .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        console.log('no');
        
        // delete their data
    }
});

bot.on('deleteUserData', function (message) {
      // User asked to delete their data
});
/*session.send(JSON.stringify(session.dialogData));
session.send(JSON.stringify(session.sessionState));
session.send(JSON.stringify(session.conversationData));
session.send(JSON.stringify(session.userData));*/
});
//repo git envoyer au prof et amelioration de TP 
//quand je remove un user il doit l'afficher
//quand user s'ajoute 
//message wellcome quand j'arrive au conversation 
// ajouter un bot 