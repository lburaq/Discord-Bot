const {SlashCommandBuilder } = require("@discordjs/builders");
const {PermissionFlagsBits} = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('destek-ayarla')
		.setDescription('destek komutu için gerekli ayarlamaları yap')
		.addStringOption((option) => option.setName('yetkili-rol-id').setDescription("Moderatör rol id").setRequired(true))
        .addStringOption((option) => option.setName('kategori-id').setDescription("Kategori id").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
	async execute(client,interaction) {
		var server = interaction.options.getString("yetkili-rol-id");
        var kanal = interaction.options.getString("kategori-id");
        var sunucu = interaction.guildId;
        var obj = {
            sunucular: [{
                "sunucu":"",
                "yetkili":"",
                "kategori":"",
            }]
        };
        /*
        fs.appendFile('./serverler.json',JSON.stringify(serverler),(err) => {
            if(err) throw err;
            interaction.reply("test")
        })
        */
       const kanaltype = interaction.guild.channels.cache.get(kanal)
       const roltipi = interaction.guild.roles.cache.get(server);
       if(roltipi === undefined){
        return interaction.reply({content: "**yetkili-rol-id** kısmı bir Rol id'si olmak zorunda!", ephemeral: true})
       }
       if(kanaltype.type !== 4)
            return interaction.reply({content: "**kategori-id** kısmı bir kategori id'si olmak zorunda!", ephemeral: true})
       var mesaj = undefined;
        fs.readFile('./serverler.json', 'utf-8', (err, data) => {
            if (err){
                console.log(err);
            } else {
                obj = JSON.parse(data);
                var liste = obj.sunucular;
                //for(var i =0;i<obj.sunucular.length;i++){
                //    if(namef[i].sunucu === interaction.guild.name){
                //        return interaction.reply({content: "Zaten ayar var, değiştirmek istiyorsan **/destek-guncelle** kullan!", ephemeral: true})
                //    }
            //  }
             liste.filter((x)=> {
                if(x.sunucu === interaction.guildId){
                    return mesaj = interaction.reply({content: "Zaten ayar var, değiştirmek istiyorsan **/destek-guncelle** kullan!", ephemeral: true});
                }
             });
          
             if(!mesaj){
                obj.sunucular.push({sunucu:sunucu,yetkili:server,kategori:kanal});
                 var json = JSON.stringify(obj);
                fs.writeFile('./serverler.json',json,'utf-8', (err)=> {
                    if(err) throw err;
                    interaction.reply({content: "Ayar başarılı şekilde yapıldı!", ephemeral: true});
                });
            }
            }
        })
	},
};