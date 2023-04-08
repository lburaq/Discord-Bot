const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("destek")
    .setDescription("Yardım için destek oluştur")
    .addStringOption((option) =>
      option
        .setName("mesaj")
        .setDescription("Lütfen sorununu belirt")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(client, interaction) {
    let message = interaction.options.getString("mesaj");
    fs.readFile("./serverler.json", "utf-8", (err, data) => {
      if (err) throw err;
      let server = undefined;
      let serverLists = JSON.parse(data);
      let servers = serverLists.sunucular;
      servers.filter((x) => {
        if (x.sunucu === interaction.guildId) {
          server = x.sunucu;
          let channelName = "destek" + interaction.user.id;
          let channelId = client.guilds.cache
            .get(interaction.guildId)
            .channels.cache.find((c) => c.name === channelName);
          if (channelId) {
            return interaction.reply({
              content: `Zaten destek kanalı oluşturdunuz kanal: ${channelId}`,
              ephemeral: true,
            });
          }
          const isCategory = interaction.guild.channels.cache.get(x.kategori);
          const isModerator = interaction.guild.roles.cache.get(x.yetkili);
          if (isCategory && isModerator) {
            interaction.guild.channels
              .create({
                name: "destek" + interaction.user.id,
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
                    id: interaction.user.id,
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
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                  },
                ],
              })
              .then((c) => {
                let embed = new EmbedBuilder()
                  .setThumbnail(interaction.user.displayAvatarURL())
                  .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                  .setFooter({
                    text: `${interaction.guild.name} Yönetim`,
                    iconURL: interaction.guild.iconURL(),
                  })
                  .addFields({
                    name: "Kullanıcı",
                    value: `<@${interaction.user.id}>`,
                    inline: true,
                  })
                  .addFields({
                    name: "ID",
                    value: interaction.user.id,
                    inline: true,
                  })
                  .addFields({
                    name: "🔹 SORUN: " + message,
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
                interaction.reply({
                  content: `Destek kanalı oluşturuldu kanal: <#${c.id}>`,
                  ephemeral: true,
                });
              });
          } else {
            return interaction.reply({
              content:
                "Kategori veya Rol bulunamadı, ayarları güncelleyiniz **/destek-guncelle**",
              ephemeral: true,
            });
          }
        }
      });
      if (server === undefined) {
        return interaction.reply({
          content:
            "Sunucunun gerekli ayarları yapılmamış lütfen önce ayarları yapın **/destek-ayarla**",
          ephemeral: true,
        });
      }
    });
  },
};
