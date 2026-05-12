const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
                .setName('칼로리')
                .setDescription('정말 먹을꺼야??')
                .addStringOption((option) =>
                    option
                    .setName('foodname')
                    .setDescription('음식이름')
                    .setRequired(true)
                .setAutocomplete(true));

module.exports = {
    data: data,

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        if (focusedValue.length < 1) return await interaction.respond([]);

        try {
            const result = await getFoodData(focusedValue);

            await interaction.respond(
                result.map(choice => ({ name: `${choice.name} - ${choice.brand}`, value: choice.name })),
            );
        } catch (error) {
            console.error(error);
        }
    },

    async execute(interaction) {
        const foodName = interaction.options.getString('foodname');

        try {
            await interaction.deferReply();
            const searchResult = await getFoodData(foodName);

            if (!searchResult || searchResult.length === 0) {
                return await interaction.editReply({
                    content: `❌ **${foodName}**에 대한 검색 결과가 없습니다.`,
                });
            }
            const foodFullName = searchResult[0].name;
            const foodCalorie = searchResult[0].calories;
            const foodBrand = searchResult[0].brand;
            const foodAmount = searchResult[0].amount;

            const imageUrl = await getFoodImage(foodFullName);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(foodFullName)
                // .setURL('')
                // .setAuthor({ name: 'Oribot', })
                // .setDescription('설명')

                .addFields(
                    // { name: '제품명', value: foodFullName, inline:true },
                    { name: '칼로리', value: `${Math.floor(foodCalorie)} kcal`, inline: true },
                    { name: '양', value: `${Math.floor(parseFloat(foodAmount))} g`, inline: true },
                    { name: '제조사', value: foodBrand, inline: false },
                );
                // .setImage('imglink')
                // .setTimestamp()
                // .setFooter({ text: '제공: 공공데이터포털 / 네이버' });

                if (imageUrl) {
                    embed.setThumbnail(imageUrl);
                }

            const response = await interaction.editReply({
                // content: `${foodFullName} (${foodBrand}): ${foodCalorie} (${foodAmount})`,
                embeds: [embed],
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '데이터 처리 중 오류가 발생했습니다.' });
        }


    },

};

const fs = require('fs');

async function getFoodData(foodName) {
    const serviceKey = '2339430ce3992f9546550accae184549f73e51786eafac2dbf8a8203e691c919';

    const url = 'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02'
        + `?serviceKey=${serviceKey}`
        + '&type=json'
        + '&numOfRows=10'
        + `&FOOD_NM_KR=${encodeURIComponent(foodName)}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (!result || !result.body || !result.body.items) {
            console.log('API 응답에 데이터 없음');
            return [];
        }

        const rawItems = result.body.items;

        const slimData = rawItems.map(item => ({
            name: item.FOOD_NM_KR,
            calories: item.AMT_NUM1,
            brand: item.MAKER_NM,
            amount: item.Z10500,
        }));

        fs.writeFileSync('result.json', JSON.stringify(slimData, null, 2), 'utf-8');

        console.log(slimData);
        return slimData;

    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
}

async function getFoodImage(query) {
    const clientId = 'ktxKEnq5zX5DhE7VJhRM'; // 발급받은 ID
    const clientSecret = 'MgO4WXA8x6'; // 발급받은 Secret

    // 제품명 뒤에 '음식'이나 '패키지'를 붙이면 더 정확한 사진이 나옵니다.
    const url = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(query)}&display=1&sort=sim`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret
            }
        });
        const data = await response.json();

        // 검색 결과가 있으면 첫 번째 이미지 주소 반환, 없으면 null
        return data.items && data.items.length > 0 ? data.items[0].link : null;
    } catch (error) {
        console.error('이미지 검색 에러:', error);
        return null;
    }
}