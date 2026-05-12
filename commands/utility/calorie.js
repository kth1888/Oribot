const { SlashCommandBuilder } = require('discord.js');


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

            const response = await interaction.editReply({
                content: `${foodFullName} (${foodBrand}): ${foodCalorie} (${foodAmount})`,
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