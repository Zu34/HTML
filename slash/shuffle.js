const {SlashCommandBuilder} = require("@discordjs/builders")


module.exports ={
    data: new SlashCommandBuilder()
    
    .setName("shuffle")
    .setDescription("shuffled the queue"),

    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue)
            return await interaction.editReply("there are no songs in the queue")
             
            queue.shuffle()
            await interaction.editReply(`the queue of ${queue.tracks.lenght} songs has been shuffled!`)

        
    },
}