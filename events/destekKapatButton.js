const { destekKapa } = require("../index");
module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;
    const { customId } = interaction;
    if (customId === "destek") {
      destekKapa(null, interaction);
    }
  },
};
