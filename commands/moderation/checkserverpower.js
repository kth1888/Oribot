const { SlashCommandBuilder } = require('discord.js');
const { getPowerStatus } = require('../../services/getserverstatus.js');

const data = new SlashCommandBuilder()
            .setName('서버상태확인')
            .setDescription('서버 전원 상태 확인');

module.exports = {
    data: data,

    async execute(interaction) {
        const status = getPowerStatus();
        let powerStatusKR;
         if (status.powerStatus == 'charging') {
            powerStatusKR = '충전중';
        } else if (status.powerStatus == 'charged') {
                 powerStatusKR = '충전 완료';
        } else { powerStatusKR = '충전 중이 아님'; };

        await interaction.reply(`현재 서버 전원: ${status.batteryLevel}% (${powerStatusKR})`);
    },
};