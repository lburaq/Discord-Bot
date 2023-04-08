const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const ytdl = require("play-dl");
const ytSearch = require("yt-search");

const queue = new Map();
let interactionMsg;
let guild;
ytdl.setToken({
  youtube: {
    cookie:
      "YOUR-COOKİE",
  },
});
const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("loop")
    .setEmoji("<:replay:1089848398733135925>")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("stop")
    .setEmoji("<:stop:1089994303805341776>")
    .setStyle(ButtonStyle.Danger),
  new ButtonBuilder()
    .setCustomId("skip")
    .setEmoji("<:skip:1089998041043452075>")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("liste")
    .setEmoji("<:list:1091401222231171103>")
    .setStyle(ButtonStyle.Secondary)
);
let embed = new EmbedBuilder();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("baslat")
    .setDescription("(Only Youtube) Müzik aç")
    .addStringOption((option) =>
      option
        .setName("mesaj")
        .setDescription("Şarkı adı veya Url")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(client, interaction) {
    const voiceChannel = interaction.guild.members.cache.get(
      interaction.member.user.id
    ).voice.channel;
    if (!voiceChannel)
      return interaction.reply(
        "Müzik açmak için bir sesli kanalda olmak zorundasın!"
      );
    let url = interaction.options.getString("mesaj");
    const serverQueue = queue.get(interaction.guild.id);
    let song = {};
    let songPlaylist = [];
    let searchType = await ytdl.validate(url);
    if (searchType == "yt_video") {
      const songInfo = await ytdl.video_info(url);
      song = {
        title: songInfo.video_details.title,
        url: songInfo.video_details.url,
        thumbnail: songInfo.video_details.thumbnails[0].url,
        duration: songInfo.video_details.durationRaw,
      };
    } else if (searchType == "yt_playlist") {
      const songPlaylistInfo = await ytdl.playlist_info(url, {
        incomplete: true,
      });
      let songPlaylists = await songPlaylistInfo.all_videos();
      for (let i = 0; i < songPlaylists.length; i++) {
        songPlaylist.push(songPlaylists[i]);
      }
      song = {
        title: songPlaylistInfo.title,
        url: songPlaylistInfo.url,
        thumbnails: songPlaylists[0].thumbnails[0].url,
        videoCount: songPlaylistInfo.total_videos,
      };
    } else {
      const VideoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
      };
      const video = await VideoFinder(url);
      if (video) {
        song = {
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail,
          duration: video.duration,
        };
      } else {
        return interaction.reply({
          content: "Video bulunamadı!",
          ephemeral: true,
        });
      }
    }
    await interaction.deferReply();
    if (!serverQueue) {
      const queueConstructor = {
        voiceChannel: voiceChannel,
        playMessageChannel: null,
        nextMessageChannel: null,
        listMessage: null,
        connection: null,
        songs: [],
        loop: false,
        page: 0,
      };
      queue.set(interaction.guild.id, queueConstructor);
      guild = interaction.guild;
      if (searchType == "yt_playlist") {
        for (let i = 0; i < songPlaylist.length; i++) {
          queueConstructor.songs.push(songPlaylist[i]);
        }
      } else {
        queueConstructor.songs.push(song);
      }
      module.exports.song = song;
      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        queueConstructor.connection = connection;
        await VideoPlayer(guild, queueConstructor.songs[0]);
          embed
            .setDescription(
              `**[${song.title}](${song.url})** Başarılı şekilde açıldı!`
            )
            .setThumbnail(
              song.thumbnail
                ? song.thumbnail
                : queueConstructor.songs[0].thumbnails[0].url
            )
            .setFooter({
              text: `${
                song.duration
                  ? "Video süresi: " + song.duration
                  : "Playlist sayısı: " + song.videoCount
              }`,
            })
            .setColor("#36eaf1");
          await interaction.editReply({ embeds: [embed] }).then((message) => {
            queueConstructor.nextMessageChannel = message;
          });
          embed
            .setDescription(
              `**[${queueConstructor.songs[0].title}](${queueConstructor.songs[0].url})** Şu anda çalan!`
            )
            .setThumbnail(
              song.thumbnail
                ? song.thumbnail
                : queueConstructor.songs[0].thumbnails[0].url
            )
            .setFooter({
              text: `Video süresi: ${
                song.duration
                  ? song.duration
                  : queueConstructor.songs[0].durationRaw
              }`,
            })
            .setColor("#36eaf1");
          interaction
            .followUp({ embeds: [embed], components: [row] })
            .then((msg) => {
              interactionMsg = msg;
              queueConstructor.playMessageChannel = msg;
            });
      } catch (err) {
        queue.delete(interaction.guild.id);
        interaction.editReply({
          content: "Bir sorun oluştu, tekrar deneyin",
          ephemeral: true,
        });
        throw err;
      }
    } else {
      if (searchType == "yt_playlist") {
        for (let i = 0; i < songPlaylist.length; i++) {
          serverQueue.songs.push(songPlaylist[i]);
        }
      } else {
        serverQueue.songs.push(song);
      }
      module.exports.song = song;
      embed
        .setDescription(`**[${song.title}](${song.url})** Sıraya eklendi!`)
        .setThumbnail(song.thumbnail ? song.thumbnail : song.thumbnails)
        .setFooter({
          text: `${
            song.duration
              ? "Video süresi: " + song.duration
              : "Playlist sayısı: " + song.videoCount
          }`,
        })
        .setColor("#36eaf1");
      interaction.editReply({ embeds: [embed] }).then(() => {
        setTimeout(() => {
          interaction.deleteReply();
          serverQueue.nextMessageChannel.edit({ embeds: [embed] });
        }, 2000);
      });
    }
  },
};
const VideoPlayer = async (guild, song) => {
  const songQueue = queue.get(guild.id);
  module.exports.queue = queue;
  let player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  });
  try {
    if (!song && songQueue) {
      queue.delete(guild.id);
      songQueue.connection.destroy();
      return;
    }
    if (songQueue) {
      let stream = await ytdl.stream(song.url, { quality: 0 });
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      player.play(resource);
      songQueue.connection.subscribe(player);
      player.on(AudioPlayerStatus.Idle, async () => {
        for (let i = 0; i < queue.size; i++) {
          let currentQueue = Array.from(queue.values())[i];
          if (currentQueue.loop) {
            VideoPlayer(currentQueue.voiceChannel.guild, currentQueue.songs[0]);
          } else {
            if (
              currentQueue.connection.state.subscription.player.state.status ===
              "idle"
            ) {
              currentQueue.songs.shift();
              await VideoPlayer(
                currentQueue.voiceChannel.guild,
                currentQueue.songs[0]
              );
              if (currentQueue.songs[0]) {
                embed
                  .setDescription(
                    `**[${currentQueue.songs[0].title}](${currentQueue.songs[0].url})** Şu anda çalan!`
                  )
                  .setThumbnail(
                    currentQueue.songs[0].thumbnail
                      ? currentQueue.songs[0].thumbnail
                      : currentQueue.songs[0].thumbnails[0].url
                  )
                  .setFooter({
                    text: `Video süresi: ${
                      song.duration
                        ? song.duration
                        : currentQueue.songs[0].durationRaw
                    }`,
                  })
                  .setColor("#36eaf1");
                if (interactionMsg) {
                  interactionMsg.edit({ embeds: [embed], components: [row] });
                }
              }
            }
          }
        }
      });
    }
  } catch (err) {
    throw err;
  }
};
