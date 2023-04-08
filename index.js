const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
  Partials,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Channel, Partials.Message],
});
const Loop = require("./commands/loop");
const Stop = require("./commands/stop");
const Skip = require("./commands/skip");
const Lists = require("./commands/lists");
const destekKapa = require("./commands/destekKapat");
module.exports = {
  Loop: Loop.execute,
  Stop: Stop.execute,
  Skip: Skip.execute,
  Lists: Lists.execute,
  destekKapa: destekKapa.execute,
};
const { REST, Routes } = require("discord.js");
const config = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");
client.commands = new Collection();
const commands = [];
const rest = new REST({ version: "10" }).setToken(config.token);

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
    setTimeout(() => {
      console.log(`Modül: ${file} başarılı şekilde yüklendi.`);
    }, 500);
  } else {
    console.log(
      `[UYARI] Bu komut dosyasında ${file} "data" veya "execute" eksik, olması zorunlu!`
    );
  }
}

(async () => {
  try {
    console.log("Application komutları yeniden yüklenmeye başliyor..");

    await rest.put(Routes.applicationCommands(config.clientid), {
      body: commands,
    });

    console.log("Application komutları başarılı şekilde yeniden yüklendi.");
  } catch (error) {
    console.error(error);
  }
})();

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const filter = (reaction) => {
  return reaction.emoji.name === "⏹️";
};
module.exports.filter = filter;

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(client, interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Bu komut yürütülürken bir hata oluştu!",
      ephemeral: true,
    });
  }
});

client.login(config.token);
