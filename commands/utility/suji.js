const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('suji').setDescription('is...'),
    async execute(interaction) {
        await interaction.reply('circle');
    },
};
