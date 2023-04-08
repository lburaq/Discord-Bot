const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;
    if (message.channel.type === 1) {
      const { client } = message;
      try {
        let embed = new EmbedBuilder()
          .setThumbnail(message.author.displayAvatarURL())
          .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
          })
          .setFooter({
            text: `DM message`,
          })
          .addFields({
            name: "Kullanıcı",
            value: `<@${message.author.id}>`,
            inline: true,
          })
          .addFields({ name: "ID", value: message.author.id, inline: true })
          .addFields({
            name: "Mesajı: " + message.content,
            value: " ",
            inline: false,
          })
          .setDescription(`**Bota özelden yazılan mesaj**`)
          .setColor("#36eaf1")
          .setTimestamp();
        client.channels.cache
          .get("756657117280075887")
          .send({ embeds: [embed] });
      } catch (error) {
        client.channels.cache
          .get("756657117280075887")
          .send(
            `**Bot DM'e mesaj gönderilirken hata** \n Hata: ${error.message} \n Mesaj gönderen kişi: <@${message.author.id}>`
          );
      }
    }
  },
};
