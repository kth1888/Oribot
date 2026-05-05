const { SlashCommandBuilder } = require('discord.js');
const { getDustData } = require('../../services/getdustdata.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('먼지')
        .setDescription('뤼봇아 환기해도 될까??')
        .addStringOption((option) =>
            option
            .setName('location')
            .setDescription('위치')
            .addChoices(
                { name: '뤼집', value: '성북구' },
                { name: '쥐집', value: '도봉구' },
            ),
        ),

    async execute(interaction) {
        try {
            const dustData = await getDustData();

            // default location = 성북구
            const location = interaction.options.getString('location') ?? '성북구';
            const dustInfo = dustData.info.data[location];

            const status = dustData.whoLevels[dustData.grade];
            const title = dustData.canVentilate ? `**환기 가능!!** **(${status.label} ${status.emoji})** \n` : `**환기 불가능!!** **(${status.label} ${status.emoji})** \n`;
            const updateDate = new Date(dustData.info.data_info.updateTime);
            const unixTime = Math.floor(updateDate.getTime() / 1000);
            const timeStampF = `<t:${unixTime}:F>`;
            const timeStampR = `<t:${unixTime}:R>`;

            await interaction.reply({
                content: title +
                                `📍 **${dustInfo.stationName}** 미세먼지 현황\n` +
                                `😷 미세먼지: ${dustInfo.pm10Value}㎍/㎥ (${dustInfo.pm10Grade_whoStandard_eightLevel}단계)\n` +
                                `💨 초미세먼지: ${dustInfo.pm25Value}㎍/㎥\n` +
                                `⏰ 마지막 업데이트: ${timeStampF} (${timeStampR})`,
            });

        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await intreaction.followUp({ content: '오류가 발생했어요!', ephemeral: true });
            } else {
                await interaction.reply({ content: '오류가 발생했어요!', ephemeral: true });
            }
        }
    },

};


// 1. 초미세먼지까지 종합적으로 판단하는 기능 2. 4단계 이하(좋음)일때 자동으로 알림을 주는 기능