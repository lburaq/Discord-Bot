const {SlashCommandBuilder} = require("@discordjs/builders");
const { ChannelType, PermissionsBitField, EmbedBuilder} = require("discord.js");
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('destek')
		.setDescription('Yardım için destek oluştur')
		.addStringOption((option) => option.setName('mesaj').setDescription('Lütfen sorununu belirt').setRequired(true))
        .setDMPermission(false),
	async execute(client,interaction) {
		var mesaj = interaction.options.getString("mesaj");
        var obj = {
            sunucular: [{
                "sunucu":"",
                "yetkili":"",
                "kategori":"",
            }]
        };
        fs.readFile('./serverler.json', 'utf-8', (err, data) => {
            if (err)
                throw err;
            var yetkili = undefined;
            obj = JSON.parse(data);
            liste = obj.sunucular;
             liste.filter(async (x) => {
                if (x.sunucu === interaction.guildId) {
                    yetkili = x.yetkili;
                    var kanalname = "destek" + interaction.user.id;
                    var kanalid = client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.name === kanalname);
                    if (kanalid) {
                        return interaction.reply({ content: `Zaten destek kanalı oluşturdunuz kanal: ${kanalid}`, ephemeral: true });
                    }
                    await interaction.guild.channels.create({
                        name: "destek" + interaction.user.id,
                        type: ChannelType.GuildText,
                        parent: x.kategori,
                        permissionOverwrites: [
                            {
                                id: client.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                            },
                            {
                                id: yetkili,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages]
                            },
                            {
                                id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel]
                            },
                        ],
                    }).then(c => {

                        var embed = new EmbedBuilder()
                            .setThumbnail(interaction.user.displayAvatarURL())
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                            .setFooter({ text: `${interaction.guild.name} Yönetim`, iconURL: interaction.guild.iconURL()})
                            .addFields({ name: "Kullanıcı", value: `<@${interaction.user.id}>`, inline: true })
                            .addFields({ name: "ID", value: interaction.user.id, inline: true })
                            .addFields({ name: "🔹 SORUN: " + mesaj, value: "Açtığı yardım talebi boşunaysa gerekeni yapınız.", inline: false })
                            .setDescription(`**Destek Oluşturuldu, <@&${yetkili}> en kısa sürede sizinle ilgilenecektir.**`)
                            .setColor("#36eaf1")
                            .setTimestamp();


                        c.send({ embeds: [embed] });
                         interaction.reply({ content: `Destek kanalı oluşturuldu kanal: <#${c.id}>`, ephemeral: true });

                    });
                }
            });
            if(yetkili === undefined){
                return interaction.reply({content: "Sunucunun gerekli ayarları yapılmamış lütfen önce ayarları yapın **/destek-ayarla**", ephemeral: true})
            }
        })
	},

};