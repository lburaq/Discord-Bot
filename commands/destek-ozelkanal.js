const {SlashCommandBuilder } = require("@discordjs/builders");
const {PermissionFlagsBits} = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('destek-ozelkanal')
		.setDescription('/destek Komutunu kullanmadan belirlediğin özel kanalda yazı yoluyla destek açma sistemi')
        .addStringOption((option) => option.setName('kanal-id').setDescription("Hangi kanalda yazı yoluyla destek açılacak").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
	async execute(client,interaction) {
        var kontrol = false;
        var sunucu = undefined;
        var mesaj = interaction.options.getString('kanal-id');
        var kanal = interaction.guild.channels.cache.get(mesaj);
        fs.readFile('./serverler.json','utf-8', (err,data)=>{
            if(err) console.log(err);
            var obj = JSON.parse(data);
            var sunucular = obj.sunucular;
            sunucular.filter((x)=>{
                if(x.sunucu === interaction.guildId){
                    sunucu = x.sunucu;
                    if(kanal.type !=0){
                        return interaction.reply({content: "**kanal-id** kısmı bir yazı kanalı id'si olmak zorunda!", ephemeral: true});
                    }
                    if(x.ozelkanal === ""){
                        kontrol = true;
                        x.ozelkanal = mesaj;
                        var json = JSON.stringify(obj);
                        fs.writeFile('./serverler.json',json,'utf-8',(err)=>{
                            if(err) throw err;
                            return interaction.reply({content: "Ayar başarılı şekilde yapıldı!", ephemeral: true})
                        })
                    }
                    if(!kontrol){
                        x.ozelkanal = mesaj;
                        var json = JSON.stringify(obj);
                        fs.writeFile('./serverler.json',json,'utf-8',(err)=>{
                            if(err) throw err;
                            return interaction.reply({content: "Ayar başarılı şekilde değiştirildi!", ephemeral: true});
                        })
                    }
                }
            })
            if(sunucu === undefined){
                return interaction.reply({content:"Ayar sunucuda bulunamadı önce **/destek-ayarla** kullanın", ephemeral: true});
            }

        })
    }
}