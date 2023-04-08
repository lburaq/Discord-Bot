const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("döngü")
    .setDescription("Çalan Müziği döngüye al")
    .setDMPermission(false),
  async execute(client, interaction) {
    const { queue } = require("./play");
    let embed = new EmbedBuilder();
    if (!queue || !queue.has(interaction.guild.id)) {
      return interaction.reply("Zaten bot çalmıyor");
    }
    const serverQueue = queue.get(interaction.guild.id);
    serverQueue.loop = serverQueue.loop === true ? false : true;
    embed
      .setColor("#36eaf1")
      .setDescription(
        "**Döngü şu anda" +
          (serverQueue.loop === true ? " Aktif " : " Kapalı ") +
          "**"
      );
    interaction.reply({ embeds: [embed] });
  },
};
