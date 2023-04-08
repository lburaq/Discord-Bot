const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("destek-ayarla")
    .setDescription("destek sistemi için gerekli ayarlamaları yap")
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
    let serverId = interaction.guildId;
    /*
        fs.appendFile('./serverler.json',JSON.stringify(serverler),(err) => {
            if(err) throw err;
            interaction.reply("test")
        })
        */
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
    fs.readFile("./serverler.json", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
      } else {
        let serverLists = JSON.parse(data);
        let servers = serverLists.sunucular;
        //for(var i =0;i<obj.sunucular.length;i++){
        //    if(namef[i].sunucu === interaction.guild.name){
        //        return interaction.reply({content: "Zaten ayar var, değiştirmek istiyorsan **/destek-guncelle** kullan!", ephemeral: true})
        //    }
        //  }

        let isServersFound = servers.find((x) => {
          if (x.sunucu === interaction.guildId) {
            return interaction.reply({
              content:
                "Zaten ayar var, değiştirmek istiyorsan **/destek-guncelle** kullan!",
              ephemeral: true,
            });
          }
        });

        if (!isServersFound) {
          serverLists.sunucular.push({
            sunucu: serverId,
            yetkili: yetkiliRolId,
            kategori: kategoriId,
            ozelkanal: "",
          });
          let json = JSON.stringify(serverLists);
          fs.writeFile("./serverler.json", json, "utf-8", (err) => {
            if (err) throw err;
            interaction.reply({
              content: "Ayar başarılı şekilde yapıldı!",
              ephemeral: true,
            });
          });
        }
      }
    });
  },
};
