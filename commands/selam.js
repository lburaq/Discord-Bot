const {SlashCommandBuilder} = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('selam')
		.setDescription('Bir kullanıcıya merhaba de')
		.addUserOption((option) => option.setName('kullanıcı').setDescription('Merhaba diyeceğin kullanıcıyı seç').setRequired(true)),
	async execute(client,interaction) {
		let user = interaction.options.getUser("kullanıcı");
		await interaction.reply(`<@${interaction.user.id}> sizi selamlıyor <@${user.id}>`);
	},
};