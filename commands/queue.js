const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("durum")
    .setDescription("Mevcut kuyruktaki şarkıları gösterir")
    .addNumberOption((option) => option.setName("sayfa").setDescription("Geçmek istediğin sayfa numarası").setMinValue(1)),

    async execute(client,interaction) {
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue || !queue.playing){
            return interaction.reply("Zaten bot çalmıyor")
        }

        const totalPages = Math.ceil(queue.tracks.length / 10) || 1
        const page = (interaction.options.getNumber("sayfa") || 1) - 1

        if (page > totalPages) 
            return interaction.reply(`Geçersiz sayfa numarası, toplam sayfa numarası: ${totalPages}`)
        
        const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`
        }).join("\n")

        const currentSong = queue.current


        interaction.reply({
                embeds: [
                new EmbedBuilder()
                    .setDescription(`**Şu anda çalan**\n` + 
                    (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : "Bulunmadı!") +
                    `\n\n**Kuyruk**\n${queueString}`
                    )
                    .setFooter({
                        text: `Sayfa ${page + 1} Toplam ${totalPages}`
                    })
                    .setThumbnail(currentSong.thumbnail)
                    .setColor("#36eaf1")
                 ]
        })

    },
}
