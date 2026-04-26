const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction) {
        // await interaction.reply('Pong!');
        const response = await interaction.reply({
            content: 'Pong!',
            withResponse: true,
        });
        // emoji response
        await response.resource.message.react('🏓');
        // 15m duration
        // await interaction.deferReply({ flags: MessageFlags.Ephemeral });
       // await interaction.reply({ content: 'Secret Pong!', flags: MessageFlags.Ephemeral });
       await interaction.followUp({ content: 'Pong again!', flags: MessageFlags.Ephemeral });
    },
};

// use deferReply() in longer tasks 생각 중... 을 띄우는 메시지 -> 이후 editReply()로 생각중... 을 완성된 답변으로 수정
// reply는 딱 한번만, 이후 추가 메시지는 followUp()으로
// 메시지 삭제는 deleteReply()