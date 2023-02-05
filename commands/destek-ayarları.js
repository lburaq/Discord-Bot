const {SlashCommandBuilder } = require("@discordjs/builders");
const {PermissionFlagsBits, EmbedBuilder} = require('discord.js');
const fs = require('fs');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('destek-ayarları')
		.setDescription('Sunucuda var olan destek ayarlarını gör')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
	async execute(client,interaction) {
        var embed = new EmbedBuilder();
        fs.readFile('./serverler.json', 'utf-8', (err, data)=> {
            if(err) return interaction.reply({content: "Üzgünüm sunucu dosyalarını okuyamadım, botun yapımcısıyla iletişime geçin.", ephemeral: true})
            var obj = JSON.parse(data);
            var liste = obj.sunucular;
            var list = liste.find((x)=>{
                if(x.sunucu === interaction.guildId){
                    const kategori = interaction.guild.channels.cache.get(x.kategori);
                    const yetkili = interaction.guild.roles.cache.get(x.yetkili);
                    if(!kategori || !yetkili){
                    return interaction.reply({content: "Kategori veya Rol bulunamadı, ayarları güncelleyiniz **/destek-guncelle**", ephemeral: true})
                    }
                    embed
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setFooter({ text: `${interaction.guild.name} Yönetim`, iconURL: interaction.guild.iconURL()})
                    .addFields({ name: "Yetkili", value: `<@&${x.yetkili}>`, inline: true })
                    .addFields({ name: "Yetkili ID", value: x.yetkili, inline: true })
                    .addFields({ name: `\n`, value: `\n` })
                    .addFields({ name: "Kategori", value: kategori.name, inline: true })
                    .addFields({ name: "Kategori ID", value: x.kategori, inline: true })
                    .addFields({ name: `\n`, value: `\n` })
                    .addFields({ name: "Yazı Kanalı", value: x.ozelkanal == "" ? "Bulunamadı":`<#${x.ozelkanal}>`, inline: true})
                    .addFields({ name: "Yazı Kanalı ID", value: x.ozelkanal == "" ? "Bulunamadı":x.ozelkanal, inline:true})
                    .addFields({ name: `\n`, value: `\n` })
                    .setDescription(`**Sunucuda kayıtlı olan destek ayarları getirildi**`)
                    .setColor("#36eaf1")
                    .setTimestamp();
                    return interaction.reply({embeds: [embed], ephemeral: true})
                }
            })
            if(!list){
                return interaction.reply({content: "Sunucunun gerekli ayarları yapılmamış lütfen önce ayarları yapın **/destek-ayarla**", ephemeral: true});
        }
        })
    }
}
