const {SlashCommandBuilder} = require("@discordjs/builders");
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('öneri')
    .setDescription('Botun yapımcısına bir öneri sun')
    .addStringOption(option => option.setName('mesaj').setDescription('Önerini yaz').setRequired(true)),
    async execute(client,interaction) {
        const message = interaction.options.getString('mesaj');
        const guildID = "626059244197642240";
	    const channelID = "756657117280075887";

        var embed = new EmbedBuilder()
            .setColor("#36eaf1")
            .setTimestamp()
            .addFields({name:"Eylem",value:"Öneri"})
            .addFields({name:"Kullanıcı",value: `<@${interaction.user.id}>`})
            .addFields({name: "ID", value: interaction.user.id})
            .addFields({name: "Öneri", value: message})

        interaction.reply({content: "Öneriniz alınmıştır! Teşekkür ederiz.", ephemeral: true});
        client.guilds.cache.get(guildID).channels.cache.get(channelID).send({embeds: [embed]})
       // interaction.reply({ embeds: [embed] });
    }
}
