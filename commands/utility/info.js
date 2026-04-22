const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
	.setName('info')
	.setDescription('Get info about a user or a server!')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('user')
			.setDescription('Info about a user')
			.addUserOption((option) => option.setName('target').setDescription('The user')),
	)
	.addSubcommand((subcommand) => subcommand.setName('server').setDescription('Info about the server'));

module.exports = {
  data: data,
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'server') {
        console.log('server');
        await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
    } else {
        console.log('user');
        const target = interaction.options.getUser('target') ?? interaction.user;
        const member = interaction.options.getMember('target') ?? interaction.member;
        const joinTime = Math.floor(member.joinedAt.getTime() / 1000);

        await interaction.reply({
            content: `👤 **유저 정보**\n**이름:** ${target.username}\n**가입일:** <t:${joinTime}:F> (<t:${joinTime}:R>)`,
    });
    }
  },
};