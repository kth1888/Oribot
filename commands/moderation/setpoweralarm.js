const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const { loadConfigs, saveConfigs } = require('../../configmanager.js');

const data = new SlashCommandBuilder()
                .setName('서버배터리알림등록')
                .setDescription('서버 배터리 부족한 경우 알림 받습니다.')
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);


module.exports = {
    data: data,

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({
                content: '이 명령어를 사용할 권한이 없습니다!',
                ephemeral: true,
            });
        }
        const managerId = interaction.user.id;
        const channelId = interaction.channelId;

        const configs = loadConfigs();

        const info = {
            targetChannel: channelId,
            isAlertSent: false,
        };

        if (!configs[managerId]) {
            configs[managerId] = {};
        }
        configs[managerId].powerAlarm = info;

        saveConfigs(configs);


        const response = await interaction.reply({
            content: '현재 채널에 서버 배터리 알림 설정이 완료되었습니다.',
            flags: MessageFlags.Ephemeral,
        });
    },
};