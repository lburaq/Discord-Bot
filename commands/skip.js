const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { createAudioResource } = require("@discordjs/voice");
const ytdl = require("play-dl");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gec")
    .setDescription("Mevcut şarkıyı geç")
    .setDMPermission(false),
  async execute(client, interaction) {
    const { song, queue } = require("./play");
    let embed = new EmbedBuilder();
    if (!queue || !queue.has(interaction.guild.id)) {
      return interaction.reply("Zaten bot çalmıyor");
    }
    const serverQueue = queue.get(interaction.guild.id);
    serverQueue.songs.shift();
    if (serverQueue.songs.length !== 0) {
      let thumbnail = serverQueue.songs[0].thumbnail
        ? serverQueue.songs[0].thumbnail
        : serverQueue.songs[0].thumbnails[0].url;
      await interaction.deferReply();
      let stream = await ytdl.stream(serverQueue.songs[0].url, {
        quality: 0,
      });
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      serverQueue.connection.state.subscription.player.play(resource);
      embed
        .setDescription(
          `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})** Şu anda çalan!`
        )
        .setThumbnail(thumbnail ? thumbnail : song.thumbnail)
        .setFooter({
          text: `Video süresi: ${
            song.duration ? song.duration : serverQueue.songs[0].durationRaw
          }`,
        })
        .setColor("#36eaf1");
      interaction.editReply({
        content: "Başarılı şekilde geçildi!",
        ephemeral: true,
      });
      serverQueue.playMessageChannel.edit({ embeds: [embed] });
    } else {
      queue.delete(interaction.guild.id);
      serverQueue.connection.destroy();
      embed.setDescription(`**Tüm şarkılar bitti!**`).setColor("#36eaf1");
      interaction.reply({
        content: "Listede şarkı kalmadı!",
        ephemeral: true,
      });
    }
  },
};
