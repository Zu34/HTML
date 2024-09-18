const {SlashCommandBuilder} = require("@discordjs/builders")
const {ContextMenuCommandBuilder} = require("@discordjs/builders")



module.exports ={
    data: new SlashCommandBuilder()
    .setName("skipto")
    .setDescription("skips to a certain track #")
    .addNumberOption((option)=>
        option.setName("tracknumber").setDescription("skips to a certain track").setMinValue(1).setRequired(true)),

    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue)
            return await interaction.editReply("there are no songs in the queue")
            
        const trackNum = interaction.Options.getNumber("tracknumber")
            //wanna check to make sure the track num is valid 
            if (trackNum > queue.track.length)
            return await interaction.editReply("invalid track number")

            queue.skip(trackNum - 1)
            await interaction.editReply(`skipped to track nmber ${trackNum}`)
              
            

        
    },
}