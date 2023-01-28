const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("baslat")
		.setDescription("Müzik aç")
        .addSubcommand((subcommand) =>
        subcommand.setName("normal").setDescription("yazıyla veya link aracılığı ile aç").addStringOption((option) => option.setName("mesaj").setDescription("Şarkının adı").setRequired(true)))
        .addSubcommand((subcommand) => subcommand.setName("playlist").setDescription("Playlist için").addStringOption((option)=> option.setName("url").setDescription("Playlist link").setRequired(true)))
        .setDMPermission(false),
		async execute(client,interaction) {
        try{
		if (!interaction.member.voice.channel) return interaction.reply("Müzik açmak için bir sesli kanalda olmak zorundasın!")

		const queue = await client.player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            },
            leaveOnEndCooldown: 60000
        })

		var embed = new EmbedBuilder()

        if(interaction.options.getSubcommand() === "playlist"){
            let url = await interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            })
            if (!result || !result.tracks.length)
                return interaction.reply("Sonuç bulunamadı!")
            const playlist = await result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} adet şarkı [${playlist.title}](${playlist.url})** sıraya eklendi.`)
                .setThumbnail(playlist.thumbnail.url)
                .setColor("#36eaf1")
        }
        else if(interaction.options.getSubcommand() === "normal")
        {
            let url = await interaction.options.getString("mesaj")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })
            if (result.tracks.length === 0)
                return interaction.reply("Sonuç bulunamadı!")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            if(!queue.playing){
            embed
            .setDescription(`**[${song.title}](${song.url})** Başarılı şekilde açıldı!`)
            .setThumbnail(song.thumbnail)
            .setFooter({ text: `Süre: ${song.duration}`})
            .setColor("#36eaf1")
            }
            else
            {
                embed
                .setDescription(`**[${song.title}](${song.url})** Başarılı şekilde sıraya eklendi`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Süre: ${song.duration}`})
                .setColor("#36eaf1")
            }

        }
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        if (!queue.playing) await queue.play()
        
        await interaction.reply({
            embeds: [embed]
        })
    }
    catch(err){
        console.log(err);
        return interaction.reply({content:"Beklenmedik bir hata oluştu, tekrar deneyin!", ephemeral: true});
    }   
	},
}
