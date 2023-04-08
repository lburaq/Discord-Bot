const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Loop, Stop, Skip, Lists } = require("../index");
module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;
    const { customId } = interaction;
    const { queue } = require("../commands/play");
    if (customId === "loop") {
      Loop(null, interaction);
    } else if (customId === "stop") {
      Stop(null, interaction);
    } else if (customId === "skip") {
      Skip(null, interaction);
    } else if (customId === "liste") {
      Lists(null, interaction);
    }
    if (customId === "backward") {
      if (!queue || !queue.has(interaction.guild.id)) {
        return interaction.reply("Zaten bot çalmıyor");
      }
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("backward")
          .setEmoji("<:backward:1091405371362521119>")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("forward")
          .setEmoji("<:skip:1089998041043452075>")
          .setStyle(ButtonStyle.Secondary)
      );
      const serverQueue = queue.get(interaction.guild.id);
      const totalPages = Math.ceil(serverQueue.songs.length / 10) || 1;
      serverQueue.page -= 1;
      if (serverQueue.page < 0) {
        serverQueue.page += 1;
        return interaction.reply(
          `Geçersiz sayfa numarası, toplam sayfa numarası: ${totalPages}`
        );
      }
      const currentSong = serverQueue.songs[0];
      const queueString = serverQueue.songs
        .filter((i) => {
          if (i === currentSong) {
            return false;
          }
          return true;
        })
        .slice(serverQueue.page * 10, serverQueue.page * 10 + 10)
        .map((song, i) => {
          return `**${serverQueue.page * 10 + i + 1}.** \`[${
            song.duration ? song.duration : song.durationRaw
          }]\` ${song.title}`;
        })
        .join("\n");
      serverQueue.listMessage.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `**Şu anda çalan**\n` +
                (currentSong
                  ? `\`[${
                      currentSong.duration
                        ? currentSong.duration
                        : currentSong.durationRaw
                    }]\` ${currentSong.title}`
                  : "Bulunmadı!") +
                `\n\n**Kuyruk**\n${queueString}`
            )
            .setFooter({
              text: `Sayfa ${serverQueue.page + 1} Toplam ${totalPages}`,
            })
            .setThumbnail(
              currentSong.thumbnail
                ? currentSong.thumbnail
                : currentSong.thumbnails[0].url
            )
            .setColor("#36eaf1"),
        ],
        components: [row],
      });
      interaction.deferUpdate();
    } else if (customId === "forward") {
      if (!queue || !queue.has(interaction.guild.id)) {
        return interaction.reply("Zaten bot çalmıyor");
      }
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("backward")
          .setEmoji("<:backward:1091405371362521119>")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("forward")
          .setEmoji("<:skip:1089998041043452075>")
          .setStyle(ButtonStyle.Secondary)
      );
      const serverQueue = queue.get(interaction.guild.id);
      const totalPages = Math.ceil(serverQueue.songs.length / 10) || 1;
      serverQueue.page += 1;
      if (serverQueue.page >= totalPages) {
        serverQueue.page -= 1;
        return interaction.reply(
          `Geçersiz sayfa numarası, toplam sayfa numarası: ${totalPages}`
        );
      }
      const currentSong = serverQueue.songs[0];
      const queueString = serverQueue.songs
        .filter((i) => {
          if (i === currentSong) {
            return false;
          }
          return true;
        })
        .slice(serverQueue.page * 10, serverQueue.page * 10 + 10)
        .map((song, i) => {
          return `**${serverQueue.page * 10 + i + 1}.** \`[${
            song.duration ? song.duration : song.durationRaw
          }]\` ${song.title}`;
        })
        .join("\n");
      serverQueue.listMessage.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `**Şu anda çalan**\n` +
                (currentSong
                  ? `\`[${
                      currentSong.duration
                        ? currentSong.duration
                        : currentSong.durationRaw
                    }]\` ${currentSong.title}`
                  : "Bulunmadı!") +
                `\n\n**Kuyruk**\n${queueString}`
            )
            .setFooter({
              text: `Sayfa ${serverQueue.page + 1} Toplam ${totalPages}`,
            })
            .setThumbnail(
              currentSong.thumbnail
                ? currentSong.thumbnail
                : currentSong.thumbnails[0].url
            )
            .setColor("#36eaf1"),
        ],
        components: [row],
      });
      interaction.deferUpdate();
    }
  },
};
