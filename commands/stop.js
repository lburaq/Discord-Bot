const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kapat")
    .setDescription("Müziği tamamen kapat")
    .setDMPermission(false),
  async execute(client, interaction) {
    const { queue } = require("./play");
    if (!queue || !queue.has(interaction.guild.id)) {
      return interaction.reply("Zaten bot çalmıyor");
    }
    const serverQueue = queue.get(interaction.guild.id);
    queue.delete(interaction.guild.id);
    serverQueue.connection.destroy();
    interaction.reply({
      content: "Bot Başarılı şekilde kapatıldı",
      ephemeral: true,
    });
  },
};
