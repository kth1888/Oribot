const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { loadUsers, saveUsers } = require('../../db.js');

const data = new SlashCommandBuilder()
                .setName('잔디일퀘알림설정')
                .setDescription('오늘 커밋했는지 알림 받습니다.')
                .addStringOption((option) =>
                    option
                    .setName('link')
                .setDescription('깃헙 프로필 링크'));

module.exports = {
    data: data,

    async execute(interaction) {
        const userId = interaction.user.id;
        const githubLink = interaction.options.getString('link');
        const allUsers = loadUsers();

        allUsers[userId].githubLink = githubLink;

        saveUsers(allUsers);

        const response = await interaction.reply({
            content: '잔디심기 알림 설정 완료!',
            flags: MessageFlags.Ephemeral,
        });
    },
};