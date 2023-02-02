const {SlashCommandBuilder} = require("@discordjs/builders")
const {PermissionFlagsBits} = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('destek-guncelle')
		.setDescription('destek komutu için var olan ayarı güncelle.')
		.addStringOption((option) => option.setName('yetkili-rol-id').setDescription("Moderatör rol id").setRequired(true))
        .addStringOption((option) => option.setName('kategori-id').setDescription("Kategori id").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
	async execute(client,interaction) {
		var server = interaction.options.getString("yetkili-rol-id");
        var kategori = interaction.options.getString("kategori-id");

        const kanaltype = interaction.guild.channels.cache.get(kategori)
        const kategoritype = interaction.guild.roles.cache.get(server);
       if(kategoritype === undefined){
        return interaction.reply({content: "**yetkili-rol-id** kısmı bir Rol id'si olmak zorunda!", ephemeral: true})
       }
       if(kanaltype.type !== 4)
            return interaction.reply({content: "**kategori-id** kısmı bir kategori id'si olmak zorunda!", ephemeral: true})
        
       var json = undefined;
        fs.readFile('./serverler.json', 'utf-8', (err, data)=> {
            if (err){
                throw err
            } else {
                var obj = JSON.parse(data)
                var liste = obj.sunucular;

                 liste.filter((x)=> {
                    if(x.sunucu === interaction.guildId){
                        x.yetkili = server;
                        x.kategori = kategori;
                        json = JSON.stringify(obj);
                    }
                 })
                 if(json === undefined){
                    return interaction.reply({content:"Ayar sunucuda bulunamadı önce **/destek-ayarla** kullanın", ephemeral: true});
                 }
                
                fs.writeFile('./serverler.json',json,'utf-8', (err)=> {
                    if(err) throw err;
                    interaction.reply({content: "Ayar başarılı şekilde güncellendi!", ephemeral: true})
                });
                
            }
        })     
	},
};
