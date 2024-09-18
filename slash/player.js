const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { Player, QueryType } = require('discord-player');

let player;

const initializePlayer = async (client) => {
    player = new Player(client);
    await player.extractors.loadDefault(ext => ext !== 'YouTubeExtractor');
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Loads songs from YouTube')
        .addSubcommand(subcommand =>
            subcommand
                .setName('song')
                .setDescription('Loads a song from a URL')
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('The song\'s URL')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('playlist')
                .setDescription('Loads songs from a playlist URL')
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('The playlist\'s URL')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Searches for a song based on provided keywords')
                .addStringOption(option =>
                    option.setName('searchterms')
                        .setDescription('The search keywords')
                        .setRequired(true))
        ),

    run: async ({ client, interaction }) => {
        try {
            if (!player) {
                await initializePlayer(client);
            }

            if (!interaction.member.voice.channel) {
                return interaction.reply({ content: 'You need to be in a voice channel to use this command', ephemeral: true });
            }

            const queue = player.createQueue(interaction.guild);
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);

            const embed = new EmbedBuilder();
            let response;

            if (interaction.options.getSubcommand() === 'song') {
                const url = interaction.options.getString('url');
                const result = await player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                });

                if (result.tracks.length === 0) {
                    response = 'No results found';
                } else {
                    const song = result.tracks[0];
                    await queue.addTrack(song);
                    embed
                        .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
                        .setThumbnail(song.thumbnail)
                        .setFooter({ text: `Duration: ${song.duration}` });
                    response = { embeds: [embed] };
                }

            } else if (interaction.options.getSubcommand() === 'playlist') {
                const url = interaction.options.getString('url');
                const result = await player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST
                });

                if (result.tracks.length === 0) {
                    response = 'No results found';
                } else {
                    const playlist = result.playlist;
                    await queue.addTracks(result.tracks);
                    embed
                        .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the queue`)
                        .setThumbnail(playlist.thumbnail);
                    response = { embeds: [embed] };
                }

            } else if (interaction.options.getSubcommand() === 'search') {
                const searchTerms = interaction.options.getString('searchterms');
                const result = await player.search(searchTerms, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO
                });

                if (result.tracks.length === 0) {
                    response = 'No results found';
                } else {
                    const song = result.tracks[0];
                    await queue.addTrack(song);
                    embed
                        .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
                        .setThumbnail(song.thumbnail)
                        .setFooter({ text: `Duration: ${song.duration}` });
                    response = { embeds: [embed] };
                }
            }

            if (!queue.playing) await queue.play();

            if (!interaction.replied) {
                await interaction.reply(response);
            } else {
                await interaction.editReply(response);
            }

        } catch (error) {
            console.error('An error occurred:', error);
            if (!interaction.replied) {
                return interaction.reply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
            }
        }
    }
};

