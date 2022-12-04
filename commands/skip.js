const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder().setName("gec").setDescription("Mevcut şarkıyı geç"),
	async execute(client,interaction) {
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue) return await interaction.reply("Zaten bot çalmıyor")

        var currentSong = queue.current

		queue.skip()

        await interaction.reply({
            embeds: [
                new EmbedBuilder().setDescription(`${currentSong.title} Başarılı şekilde geçildi`).setThumbnail(currentSong.thumbnail).setColor("#36eaf1")
            ]
        })
        /*
        setTimeout(()=>{
            currentSong = queue.current
            interaction.followUp({
                embeds: [
                    new EmbedBuilder().setDescription(`${currentSong.title} Şu anda çalan`).setThumbnail(currentSong.thumbnail).setColor("#36eaf1")
                ]
            })
        },3000)
        */

	},
}