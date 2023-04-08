const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("destek-guncelle")
    .setDescription("destek sistemi için var olan destek ayarlarını güncelle.")
    .addStringOption((option) =>
      option
        .setName("yetkili-rol-id")
        .setDescription("Moderatör yetkisinin rol id'si")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("kategori-id")
        .setDescription("Destek kanalının açılacağı kategorinin id'si")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(client, interaction) {
    let yetkiliRolId = interaction.options.getString("yetkili-rol-id");
    let kategoriId = interaction.options.getString("kategori-id");

    const channelType = interaction.guild.channels.cache.get(kategoriId);
    const roleType = interaction.guild.roles.cache.get(yetkiliRolId);
    if (roleType === undefined) {
      return interaction.reply({
        content: "**yetkili-rol-id** kısmı bir Rol id'si olmak zorunda!",
        ephemeral: true,
      });
    }
    if (channelType === undefined || channelType.type !== 4)
      return interaction.reply({
        content: "**kategori-id** kısmı bir kategori id'si olmak zorunda!",
        ephemeral: true,
      });

    let json = undefined;
    fs.readFile("./serverler.json", "utf-8", (err, data) => {
      if (err) {
        throw err;
      } else {
        let serverLists = JSON.parse(data);
        let servers = serverLists.sunucular;

        servers.filter((x) => {
          if (x.sunucu === interaction.guildId) {
            x.yetkili = yetkiliRolId;
            x.kategori = kategoriId;
            json = JSON.stringify(serverLists);
          }
        });
        if (json === undefined) {
          return interaction.reply({
            content:
              "Ayar sunucuda bulunamadı önce **/destek-ayarla** kullanın",
            ephemeral: true,
          });
        }

        fs.writeFile("./serverler.json", json, "utf-8", (err) => {
          if (err) throw err;
          interaction.reply({
            content: "Ayar başarılı şekilde güncellendi!",
            ephemeral: true,
          });
        });
      }
    });
  },
};
