const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current song queue')
        .addNumberOption(option => 
            option.setName('page')
                .setDescription('Page number of the queue')
                .setMinValue(1)
        ),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guild.id);
        if (!queue || !queue.playing) {
            return await interaction.editReply('There are no songs in the queue.');
        }

        const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
        const page = (interaction.options.getNumber('page') || 1) - 1;

        if (page > totalPages) {
            return await interaction.editReply(`Invalid page. There are only ${totalPages} pages.`);
        }

        // Handling the display
        const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`;
        }).join('\n');

        // Grab the current song
        const currentSong = queue.current;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `**Currently Playing**\n` +
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : 'None') +
                        `\n\n**Queue**\n${queueString}`
                    )
                    .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
                    .setThumbnail(currentSong.thumbnail)
            ]
        });
    }
};