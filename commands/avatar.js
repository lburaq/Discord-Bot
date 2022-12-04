const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('İstediğin kişinin avatar resmini elde et veya kendi avatarını elde et.')
		.addUserOption(option => option.setName('kullanıcı').setDescription('Avatarını istediğin kişiyi etiketle')),
	async execute(client,interaction) {
		const user = interaction.options.getUser('kullanıcı');
		if (user) return interaction.reply(`${user.username} avatarı: ${user.displayAvatarURL()}`);
		return interaction.reply(`Kendi Avatarın: ${interaction.user.displayAvatarURL()}`);
	},
};