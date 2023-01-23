const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] });
const { REST, Routes } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
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
		setTimeout(()=> {
			console.log(`Modül: ${file} başarılı şekilde yüklendi.`);
		},500);
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

const filter = (reaction)=>{return reaction.emoji.name === '⏹️'};
module.exports.filter = filter;
/*
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});
*/
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(client,interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Bu komut yürütülürken bir hata oluştu!', ephemeral: true });
	}
});

player.on("trackStart", async(queue, track) => {
	const embed = new EmbedBuilder()
		.setDescription(`**[${track.title}](${track.url})** Şu anda çalan!`)
		.setThumbnail(track.thumbnail)
		.setFooter({ text: `Süre: ${track.duration}`})
		.setColor("#36eaf1")

		await queue.metadata.channel.send({embeds: [embed]})

})

player.on("trackEnd", (queue, track) => {
	if(queue.tracks.length === 0){
	const embed = new EmbedBuilder()
		.setDescription(`Son müzik: [${track.title}](${track.url})\n \nTüm müzikler bitti, yeni müzik ekle!\n`)
		.setFooter({ text:`Botun ayrılmasına kalan süre: ${queue.options.leaveOnEndCooldown / 1000} saniye`})
		.setThumbnail(track.thumbnail)
		.setColor("#36eaf1")

		queue.metadata.channel.send({embeds: [embed]})
	}
})

client.login(config.token);