const { Events, ActivityType } = require("discord.js");
module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`${client.user.tag} Başarılı şekilde aktif oldu!`);
    let botStatus = ["XXX", "YYY", "ZZZ"];
    let index = 0;
    setInterval(() => {
      if (index === botStatus.length) index = 0;
      let status = botStatus[index++];
      client.user.setPresence({
        activities: [{ name: status, type: ActivityType.Listening }],
        status: "idle",
      });
    }, 5000);
  },
};
