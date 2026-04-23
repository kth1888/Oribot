const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

const rest = new REST().setToken(token);

// remove
(async () => {
    try {
        await
            rest.put(Routes.applicationCommands(clientId), { body: [] });
            console.log('Successfully deleted all application commands.');
    } catch (error) {
        console.error(error);
    }
})();


// guild based commands
// const { clientId, guildId, token } = require('./config.json');
// rest
//     .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
//     .then(() => console.log('Successfully deleted all guild commands.'))
//     .catch(console.error);

// global commands
// const { clientId, token } = require('./config.json');
// rest
//     .put(Routes.applicationCommands(clientId), { body: [] })
//     .then(() => console.log('Successfully deleted all application commands.'))
//     .catch(console.error);

// 길드 명령어와 글로벌 명령어는 별개임