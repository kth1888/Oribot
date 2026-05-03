const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { loadUsers, saveUsers } = require('../../db.js');

const data = new SlashCommandBuilder()
                .setName('잔디일퀘알림설정')
                .setDescription('오늘 커밋했는지 알림 받습니다.')
                .addStringOption(option =>
                    option
                    .setName('username')
                    .setDescription('GitHub 유저네임')
                    .setRequired(true))
                .addStringOption((option) =>
                    option
                    .setName('token')
                    .setDescription('깃헙 PAT')
                    .setRequired(true));

module.exports = {
    data: data,

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.options.getString('username');
        const githubToken = interaction.options.getString('token');
        const allUsers = loadUsers();

        const info = {
            targetChannelId: interaction.channelId,
            username: username,
            githubToken: githubToken,
        };

        if (!allUsers[userId]) {
            allUsers[userId] = {};
        }

        allUsers[userId].githubAlarm = info;

        saveUsers(allUsers);

        const response = await interaction.reply({
            content: '잔디심기 알림 설정 완료!',
            flags: MessageFlags.Ephemeral,
        });
    },
};