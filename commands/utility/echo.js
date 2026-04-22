const { SlashCommandBuilder, ChannelType } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with your input!')
    .addStringOption((option) =>
        option
            .setName('input')
            .setDescription('The input to echo back')
            .setRequired(true)
            .setMaxLength(5))
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('The channel to echo into')
            .addChannelTypes(ChannelType.GuildText))
    .addBooleanOption((option) => option.setName('ephemeral').setDescription('Whether or not the echo should be ephemeral'));

module.exports = {
    data: data,
    async execute(interaction) {
        await interaction.reply('echo test');
    },
};
