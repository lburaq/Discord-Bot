const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('destek-kapat')
		.setDescription('Yardım desteğini kapat')
        .setDMPermission(false),
	async execute(client,interaction) {
       const kanaladi = interaction.channel.name;
       if(kanaladi.substring(0,6) == "destek" && kanaladi.length > 10){
        const message = await interaction.reply({content: "**Kanal 5 saniye sonra silinecektir, engellemek için emojiye tıkla!**", fetchReply: true });
        message.react('⏹️');
        const {filter} = require('../index');
        message.awaitReactions({filter, time:5000}).then(collected =>{
        if(collected.size==0 || message.reactions.cache.get('⏹️').count<=1){
            interaction.channel.delete();
        }
        else{
            message.reactions.removeAll();
            interaction.editReply("**Kanalın silinmesi iptal edildi!**");
            setTimeout(()=>{
            interaction.deleteReply();
            },3000)
        }

        }).catch(error => {
            console.log(error);
            return interaction.reply('**Beklenmedik bir hata oluştu lütfen tekrar deneyin!**');
        });
       }
       else{
        return interaction.reply({content: "**Lütfen komutu var olan bir destek kanalında deneyin!**", ephemeral: true})
       }

    }

}
