const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Displays info about the currently playing song'),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue || !queue.playing) {
            return await interaction.editReply('There are no songs currently playing.');
        }

        const currentSong = queue.current;

        let bar = queue.createProgressBar({
            queue: false,
            length: 19, // number of characters
        });

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setThumbnail(currentSong.thumbnail)
                    .setDescription(`**Currently Playing:**\n[${currentSong.title}](${currentSong.url})\n\n${bar}`)
            ],
        });
    },
};