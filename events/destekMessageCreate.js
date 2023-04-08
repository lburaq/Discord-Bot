const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("node:fs");
module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;
    const { client } = message;
    fs.readFile("./serverler.json", "utf-8", (err, data) => {
      if (err) throw err;
      let serverLists = JSON.parse(data);
      let servers = serverLists.sunucular;
      servers.filter(async (x) => {
        if (message.channel.id === x.ozelkanal) {
          let channelName = "destek" + message.author.id;
          let channelId = client.guilds.cache
            .get(message.guildId)
            .channels.cache.find((c) => c.name === channelName);
          if (channelId) {
            return message
              .reply({
                content: `Zaten destek kanalı oluşturdunuz kanal: ${channelId}`,
              })
              .then((msg) => {
                setTimeout(() => {
                  msg.delete();
                  message.delete();
                }, 3000);
              });
          }
          message.guild.channels
            .create({
              name: "destek" + message.author.id,
              type: ChannelType.GuildText,
              parent: x.kategori,
              permissionOverwrites: [
                {
                  id: client.user.id,
                  allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.ManageChannels,
                  ],
                },
                {
                  id: message.author.id,
                  allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                  ],
                },
                {
                  id: x.yetkili,
                  allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.ManageMessages,
                  ],
                },
                {
                  id: message.guild.id,
                  deny: [PermissionsBitField.Flags.ViewChannel],
                },
              ],
            })
            .then((c) => {
              let embed = new EmbedBuilder()
                .setThumbnail(message.author.displayAvatarURL())
                .setAuthor({
                  name: message.author.tag,
                  iconURL: message.author.displayAvatarURL(),
                })
                .setFooter({
                  text: `${message.guild.name} Yönetim`,
                  iconURL: message.guild.iconURL(),
                })
                .addFields({
                  name: "Kullanıcı",
                  value: `<@${message.author.id}>`,
                  inline: true,
                })
                .addFields({
                  name: "ID",
                  value: message.author.id,
                  inline: true,
                })
                .addFields({
                  name: "🔹 SORUN: " + message.content,
                  value: "Açtığı yardım talebi boşunaysa gerekeni yapınız.",
                  inline: false,
                })
                .setDescription(
                  `**Destek Oluşturuldu, <@&${x.yetkili}> en kısa sürede sizinle ilgilenecektir.**`
                )
                .setColor("#36eaf1")
                .setTimestamp();
              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("destek")
                  .setLabel("Destek Kapat")
                  .setStyle(ButtonStyle.Danger)
              );
              c.send({ embeds: [embed], components: [row] });
              message
                .reply({
                  content: `Destek kanalı oluşturuldu kanal: <#${c.id}>`,
                })
                .then((msg) => {
                  setTimeout(() => {
                    msg.delete();
                    message.delete();
                  }, 3000);
                });
            });
        }
      });
    });
  },
};
