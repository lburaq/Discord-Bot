const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sil-destekayari")
    .setDescription("Sunucuda var olan destek ayarını sil")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(client, interaction) {
    fs.readFile("./serverler.json", "utf-8", (err, data) => {
      if (err) throw err;
      let serverLists = JSON.parse(data);
      let servers = serverLists.sunucular;
      let server = undefined;
      servers = servers.filter((x) => {
        if (interaction.guildId === x.sunucu) {
          server = x.sunucu;
          Object.keys(x).forEach((item) => delete x[item]);
          /*
                    var sil = ["sunucu","yetkili","kategori","ozelkanal"];
                    sil.forEach(item=> delete x[item]);
                    */
          /*
                    for(var i =0;i<sil.length;i++){
                        delete x[sil[i]];
                    }
                    */
        }
        if (Object.keys(x).length !== 0) {
          return x;
        }
      });
      if (server === undefined) {
        return interaction.reply({
          content: "Ayar sunucuda bulunamadı önce **/destek-ayarla** kullanın",
          ephemeral: true,
        });
      }
      serverLists.sunucular = servers;
      let json = JSON.stringify(serverLists);
      fs.writeFile("./serverler.json", json, "utf-8", (err) => {
        if (err) throw err;
        return interaction.reply({
          content: "Ayar başarılı şekilde silindi!",
          ephemeral: true,
        });
      });
    });
  },
};
