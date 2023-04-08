const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("destek-ozelkanal")
    .setDescription(
      "/destek Komutunu kullanmadan belirlediğin özel kanalda yazı yoluyla destek açma sistemi"
    )
    .addStringOption((option) =>
      option
        .setName("kanal-id")
        .setDescription("Hangi kanalda yazı yoluyla destek açılacak")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(client, interaction) {
    let control = false;
    let server = undefined;
    let channelId = interaction.options.getString("kanal-id");
    let channel = interaction.guild.channels.cache.get(channelId);
    fs.readFile("./serverler.json", "utf-8", (err, data) => {
      if (err) console.log(err);
      let serverLists = JSON.parse(data);
      let servers = serverLists.sunucular;
      servers.filter((x) => {
        if (x.sunucu === interaction.guildId) {
          server = x.sunucu;
          if (channel === undefined || channel.type != 0) {
            return interaction.reply({
              content:
                "**kanal-id** kısmı bir yazı kanalı id'si olmak zorunda!",
              ephemeral: true,
            });
          }
          if (x.ozelkanal === "") {
            control = true;
            x.ozelkanal = channelId;
            let json = JSON.stringify(serverLists);
            fs.writeFile("./serverler.json", json, "utf-8", (err) => {
              if (err) throw err;
              return interaction.reply({
                content: "Ayar başarılı şekilde yapıldı!",
                ephemeral: true,
              });
            });
          }
          if (!control) {
            x.ozelkanal = channelId;
            let json = JSON.stringify(serverLists);
            fs.writeFile("./serverler.json", json, "utf-8", (err) => {
              if (err) throw err;
              return interaction.reply({
                content: "Ayar başarılı şekilde değiştirildi!",
                ephemeral: true,
              });
            });
          }
        }
      });
      if (server === undefined) {
        return interaction.reply({
          content: "Ayar sunucuda bulunamadı önce **/destek-ayarla** kullanın",
          ephemeral: true,
        });
      }
    });
  },
};
