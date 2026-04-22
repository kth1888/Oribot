const { SlashCommandBuilder } = require('discord.js');

const whoLevels = {
    1: { label: '최고 좋음', emoji: '💙' },
    2: { label: '좋음', emoji: '🤍' },
    3: { label: '양호', emoji: '💚' },
    4: { label: '보통', emoji: '💛' },
    5: { label: '그저그럼', emoji: '🧡' },
    6: { label: '나쁨', emoji: '🔴' },
    7: { label: '매우 나쁨', emoji: '🚫' },
    8: { label: '최악', emoji: '💀' },
};


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
                { name: '뤼집', value: '길음1동' },
                { name: '쥐집', value: '도봉구' },
            ),
        ),

    async execute(interaction) {
        try {
            const response = await fetch('https://s3.ap-northeast-2.amazonaws.com/misemise-fine-dust-data/current-data/map-data/data.json', {
                'headers': {
                    'accept': 'application/json',
                    'Referer': 'https://www.misemise.co.kr/',
                },
                'method': 'GET',
                });
            const result = await response.json();

            const location = interaction.options.getString('location') ?? '성북구';
            const dustInfo = result.data[location];

            if (!dustInfo) {
                return await interaction.reply(`'${location}'에 대한 정보를 찾을 수 없습니다.`);
            }

            const dustgrade = dustInfo.pm10Grade_whoStandard_eightLevel;
            const status = whoLevels[dustgrade];

            const canVentilate = dustgrade < 5;
            const title = canVentilate ? `**환기 가능!!** **(${status.label} ${status.emoji})** \n` : `**환기 불가능!!** **(${status.label} ${status.emoji})** \n`;

            const updateDate = new Date(result.data_info.updateTime);

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