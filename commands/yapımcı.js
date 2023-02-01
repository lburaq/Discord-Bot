const {SlashCommandBuilder} = require("@discordjs/builders");
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('yapımcı')
		.setDescription('Botun yapımcısı hakkında bilgiye ulaş'),
	async execute (client,interaction) {
        var embed = new EmbedBuilder()
        .setColor("#36eaf1")
        .setTimestamp()
        .setTitle('Yapımcıma ulaşmanın yolları')
        .addFields(
            {name: "**Discord**", value: `<@${"235139194853392384"}>`, inline: false},
            {name: "**Steam**",value: "[Tıkla](https://steamcommunity.com/id/lburaq/)", inline: true},
            {name: "**GitHub**", value: "[Tıkla](https://github.com/lburaq)", inline: true},
        )
		interaction.reply({embeds: [embed]});
	},
};
