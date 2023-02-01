const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] });
const { REST, Routes } = require('discord.js');
const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const config = require("./config.json");
const fs = require('node:fs');
const path = require('node:path');
const { Player } = require("discord-player");
client.player = new Player(client, {
	ytdlOptions: {
		quality: "highestaudio",
		highWaterMark: 1 << 25
	}
});
const player = client.player;
client.commands = new Collection();
const commands = [];


const rest = new REST({ version: '10' }).setToken(config.token);


const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
		client.commands.set(command.data.name, command);
		setTimeout(() => {
			console.log(`Modül: ${file} başarılı şekilde yüklendi.`);
		}, 500);
	} else {
		console.log(`[UYARI] Bu komut dosyasında ${file} "data" veya "execute" eksik, olması zorunlu!`);
	}
}

(async () => {
	try {
		console.log('Application komutları yeniden yüklenmeye başliyor..');

		await rest.put(Routes.applicationCommands(config.clientid), { body: commands });

		console.log('Application komutları başarılı şekilde yeniden yüklendi.');
	} catch (error) {
		console.error(error);
	}
})();


client.on('ready', () => {
	console.log(`${client.user.tag} Başarılı şekilde aktif oldu!`);
});

const filter = (reaction) => { return reaction.emoji.name === '⏹️' };
module.exports.filter = filter;
/*
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
	await interaction.reply('Pong!');
  }
});
*/

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	fs.readFile('./serverler.json', 'utf-8', (err, data) => {
		if (err) throw err;
		var obj = JSON.parse(data);
		var sunucular = obj.sunucular;
		sunucular.filter(async (x) => {
			if (message.channel.id === x.ozelkanal) {
				var kanalname = "destek" + message.author.id;
				var kanalid = client.guilds.cache.get(message.guildId).channels.cache.find(c => c.name === kanalname);
				if (kanalid) {
					return message.reply({ content: `Zaten destek kanalı oluşturdunuz kanal: ${kanalid}` }).then(msg => {
						setTimeout(() => {
							msg.delete();
							message.delete();
						}, 3000)
					})
				}
				message.guild.channels.create({
					name: "destek" + message.author.id,
					type: ChannelType.GuildText,
					parent: x.kategori,
					permissionOverwrites: [
						{
							id: client.user.id,
							allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels]
						},
						{
							id: message.author.id,
							allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
						},
						{
							id: x.yetkili,
							allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages]
						},
						{
							id: message.guild.id,
							deny: [PermissionsBitField.Flags.ViewChannel]
						},
					],
				}).then(c => {
					var embed = new EmbedBuilder()
						.setThumbnail(message.author.displayAvatarURL())
						.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
						.setFooter({ text: `${message.guild.name} Yönetim`, iconURL: message.guild.iconURL() })
						.addFields({ name: "Kullanıcı", value: `<@${message.author.id}>`, inline: true })
						.addFields({ name: "ID", value: message.author.id, inline: true })
						.addFields({ name: "🔹 SORUN: " + message.content, value: "Açtığı yardım talebi boşunaysa gerekeni yapınız.", inline: false })
						.setDescription(`**Destek Oluşturuldu, <@&${x.yetkili}> en kısa sürede sizinle ilgilenecektir.**`)
						.setColor("#36eaf1")
						.setTimestamp();
					 c.send({ embeds: [embed] });
					 message.reply({ content: `Destek kanalı oluşturuldu kanal: <#${c.id}>` }).then(msg => {
						setTimeout(() => {
							msg.delete();
							message.delete();
						}, 3000)
					})

				});
			}
		})

	})
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Bu komut yürütülürken bir hata oluştu!', ephemeral: true });
	}
});

player.on("trackStart", async (queue, track) => {
	const embed = new EmbedBuilder()
		.setDescription(`**[${track.title}](${track.url})** Şu anda çalan!`)
		.setThumbnail(track.thumbnail)
		.setFooter({ text: `Süre: ${track.duration}` })
		.setColor("#36eaf1")

	queue.metadata.channel.send({ embeds: [embed] })

})

client.login(config.token);
