// getter.js - CLORO

/* <Object>Channel <Object>Guild GetChannel (Client Client, number ChannelID)
 * 
 * Returns a Channel with provided ID
 */

module.exports = {
    GetChannel: async function (Client, ChannelID) {
        var channel = Client.channels.cache.get(ChannelID);

        return channel, channel.guild;
    },

    GetMember: async function (Client, MemberID) {
        var Member;

        for (let Guild of Client.guilds.cache) {
            if (Member) { break };

            Member = Guild.members.cache.get(MemberID);
        }

        return Member;
    }
}