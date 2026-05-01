const { REST, Routes } = require('discord.js');
// Test deployment
// const { clientId, guildId, token } = require('./config.json');
// Global deployment
const { clientId, token } = require('./config.json');
// Test deployment (Test server)
// const { clientId, token } = require('./testcfg.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all command files from commands
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with current set

        // use await rest.put(Routes.applicationCommands(clientId), { body: commands }); for global deployment
        // const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
    } catch (error) {
        // catch and log errors
        console.error(error);
    }
})();
