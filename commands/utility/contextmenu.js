const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');

const data = new ContextMenuCommandBuilder().setName('User Information').setType(ApplicationCommandType.User);


module.exports = {
    data: data,

    async execute(interaction) {
        // 우클릭 당한 유저의 정보를 가져옴 (포인터 개념)
        const targetUser = interaction.targetUser;
        await interaction.reply({
            content: `${targetUser.username}님의 ID는 ${targetUser.id}입니다.`,
            flags: MessageFlags.Ephemeral,
        });
    },
};