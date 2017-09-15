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
//trouver une solution
bot.on('typing',function(response){
    session.send(response);
    session.send(`TEST TEST`);
});


bot.on('conversationUpdate', function(message){
    if(message.membersAdded && message.membersAdded.length > 0){
        var membersAdded = message.membersAdded
            .map(function(x){
            //Verifier si il s'agit pas d'un bot
            if (x.id != message.address.bot.id) {
                var membersAdded = x.name || ' ' + '(Id=' + x.id + ' )';
                bot.send(new botbuilder.Message()
                    .address(message.address)
                    .text('Bienvenue   ' + membersAdded + '! il fait beau aujourdhui!')
                 );      
            }
            }).join(', '); //sépare le tableau en string

       
    }
});
//Bienvenu aux utilisateurs ajouté ou lors de nouvelle conversation ou quitter conversation
bot.on('contactRelationUpdate', function(message){
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new botbuilder.Message()
                .address(message.address)
                .text("Bonjour %s... id : %s ", name , message.address.bot.id|| 'Comment ca va?');
        bot.send(reply);
    } else if(message.action === 'remove'){
        var Id_Bot = message.address.bot.id;
        var name = message.user ? message.user.name : null;
        var reply = new botbuilder.Message()
            .address(message.address)
            .text(`${name} ${Id_Bot} a quitté la discution`);
        bot.send(reply);
    }
});


});



