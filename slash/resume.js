const {SlashCommandBuilder} = require("@discordjs/builders")


module.exports ={
    data: new SlashCommandBuilder()
    
    .setName("resume")
    .setDescription("resumes the music"),

    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue)
            return await interaction.editReply("there are no songs in the queue")
             
            queue.setPaused(false)
            await interaction.editReply("Music has been paused!  Use `/pause` to pause the music")
            

        
    },
}