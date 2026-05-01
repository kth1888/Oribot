const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { loadUsers, saveUsers } = require('../../db.js');

const data = new SlashCommandBuilder()
                .setName('환기알림설정')
                .setDescription('해당 채널에 입력한 지점의 환기 가능 여부를 자동으로 알림 받습니다.')
                .addStringOption((option) =>
                    option
                    .setName('location')
                    .setDescription('위치'));

module.exports = {
    data: data,

    async execute(interaction) {
        const userId = interaction.user.id;
        const channelId = interaction.channelId;
        const alarmLocation = interaction.options.getString('location');

        const allUsers = loadUsers();

        const info = {
            userLocation: alarmLocation,
            targetChannelId: channelId,
            updatedAt: new Date().toISOString(),
            currentDustGrade: null,
        };

        if (!allUsers[userId]) {
            allUsers[userId] = {};
        }

        allUsers[userId].munjiAlarm = info;

        saveUsers(allUsers);

        const response = await interaction.reply({
            content: `${alarmLocation} 알림 설정이 완료되었습니다`,
            flags: MessageFlags.Ephemeral,
        });
    },
};