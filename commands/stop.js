const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder().setName("kapat").setDescription("Müziği tamamen kapat"),
	async execute(client,interaction) {
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue) return await interaction.reply("Zaten bot çalmıyor")

		queue.destroy()
        await interaction.reply({content: "Görüşürüz", ephemeral: true})
	},
}