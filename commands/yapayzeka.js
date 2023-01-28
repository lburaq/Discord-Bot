const {SlashCommandBuilder} = require("@discordjs/builders");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('yapayzeka')
    .setDescription('Yapay zekaya soru sor')
    .addStringOption(option => option.setName('mesaj').setDescription('Sorunu yaz').setRequired(true)),
    async execute(client,interaction) {
        try{
        const { Configuration, OpenAIApi } = require("openai");
        const configuration = new Configuration({
            organization: config.OPENAI_ORG,
            apiKey: config.OPENAI_KEY,
        });
        const openai = new OpenAIApi(configuration);
        var mesaj = interaction.options.getString('mesaj');
        await interaction.reply(`**[Komut işleniyor]**`);
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `ChatGPT: Merhaba, nasılsın?\n\
            ${interaction.user.username}: ${mesaj}\n\
            ChatGPT:`,
            temperature: 1.0,
            max_tokens: 400,
            stop: ["ChatGPT:"],
        })
        return await interaction.editReply(`${response.data.choices[0].text}`);
    }
    catch(err){
        console.log(err);
        return await interaction.editReply("Çok fazla istek var, tekrar deneyin!");
    }
    },
}
