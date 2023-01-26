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
            if(err) console.log(err);
            var sunucu = undefined;
            var obj = JSON.parse(data);
            var list = obj.sunucular;
            list.filter((x)=>{
                if(x.sunucu === interaction.guildId){
                    sunucu = x.sunucu;
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
                    .setDescription(`**Sunucuda kayıtlı olan destek ayarları getirildi**`)
                    .setColor("#36eaf1")
                    .setTimestamp();
                    return interaction.reply({embeds: [embed], ephemeral: true})
                }
            })
            if(sunucu === undefined){
                return interaction.reply({content: "Sunucunun gerekli ayarları yapılmamış lütfen önce ayarları yapın **/destek-ayarla**", ephemeral: true});
        }
        })
    }
}