const {SlashCommandBuilder } = require("@discordjs/builders");
const {PermissionFlagsBits} = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sil-destekozel')
		.setDescription('Sunucuda var olan özel kanal destek ayarını sil')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
	async execute(client,interaction) {
        fs.readFile('./serverler.json','utf-8',(err,data)=>{
            if(err) throw err;
            var obj = JSON.parse(data);
            var sunucu = undefined;
            var list = obj.sunucular;
            list.filter((x)=>{
                if(interaction.guildId === x.sunucu && x.ozelkanal !== ""){
                    sunucu = x.sunucu;
                    x.ozelkanal = "";
                    var json = JSON.stringify(obj);
                    fs.writeFile('./serverler.json',json,'utf-8',(err)=>{
                        if(err) throw err;
                        return interaction.reply({content: "Ayar başarılı şekilde silindi!", ephemeral: true});
                    })
                }
            })
            if(sunucu === undefined){
                return interaction.reply({content:"Ayar sunucuda bulunamadı **/destek-ayarla** veya **/destek-ozelkanal** kullanın", ephemeral: true});
            }
        });
    }
}