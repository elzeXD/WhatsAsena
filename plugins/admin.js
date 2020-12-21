/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

const { MessageType, GroupSettingChange } = require('@adiwajshing/baileys');
const { LANG } = require('../config');
const Asena = require('../events');

const Language = require('../language');
const Lang = Language.getString('admin');

async function checkImAdmin(message, user = message.client.user.jid) {
    var grup = await message.client.groupMetadata(message.jid);
    var sonuc = grup['participants'].map((member) => {
        if (member.id.split('@')[0] === user.split('@')[0] && member.isAdmin) return true;
        else;
        return false;
    });
    return sonuc.includes(true);
}

Asena.addCommand({ pattern: 'help_admin', fromMe: true, dontAddCommandList: true }, (async(message, match) => {
    await message.sendMessage(
        '```.help admin```\n\n*.promote* (tag/reply)\n' + Lang.PROMOTE_DESC +
        '\n*.demote* (tag/reply)\n' + Lang.DEMOTE_DESC +
        '\n*.ban* (tag/reply)\n' + Lang.BAN_DESC +
        '\n*.invite* (number)\n' + Lang.ADD_DESC +
        '\n*.lock*\n' + Lang.MUTE_DESC +
        '\n*.unlock*\n' + Lang.UNMUTE_DESC +
        '\n*.invitelink*\n' + Lang.INVITE_DESC + ' ', MessageType.text
    );
}));

Asena.addCommand({ pattern: 'ban ?(.*)', fromMe: true, onlyGroup: true, desc: Lang.BAN_DESC }, (async(message, match) => {
    var im = await checkImAdmin(message);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);

    if (message.reply_message !== false) {
        await message.sendMessage('@' + message.reply_message.data.participant.split('@')[0] + '```, ' + Lang.BANNED + '```', MessageType.text, { contextInfo: { mentionedJid: [message.reply_message.data.participant] } });
        await message.client.groupRemove(message.jid, [message.reply_message.data.participant]);
    } else if (message.reply_message === false && message.mention !== false) {
        var etiketler = '';
        message.mention.map(async(user) => {
            etiketler += '@' + user.split('@')[0] + ',';
        });

        await message.sendMessage(etiketler + '```, ' + Lang.BANNED + '```', MessageType.text, { contextInfo: { mentionedJid: message.mention } });
        await message.client.groupRemove(message.jid, message.mention);
    } else {
        return await message.sendMessage(Lang.GIVE_ME_USER);
    }
}));

Asena.addCommand({ pattern: 'invite(?: |$)(.*)', fromMe: true, onlyGroup: true, desc: Lang.ADD_DESC, usage: '.invite 628xxxxxxxxx' }, (async(message, match) => {
    var im = await checkImAdmin(message);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);

    if (match[1] !== '') {
        match[1].split(' ').map(async(user) => {
            await message.client.groupAdd(message.jid, [user + "@s.whatsapp.net"]);
            await message.sendMessage('```' + user + ' ' + Lang.ADDED + '```');
        });
    } else {
        return await message.sendMessage(Lang.GIVE_ME_USER);
    }
}));

Asena.addCommand({ pattern: 'promote ?(.*)', fromMe: true, onlyGroup: true, desc: Lang.PROMOTE_DESC }, (async(message, match) => {
    var im = await checkImAdmin(message);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);

    if (message.reply_message !== false) {
        var checkAlready = await checkImAdmin(message, message.reply_message.data.participant);
        if (checkAlready) {
            return await message.sendMessage(Lang.ALREADY_PROMOTED, MessageType.text);
        }

        await message.sendMessage('@' + message.reply_message.data.participant.split('@')[0] + Lang.PROMOTED, MessageType.text, { contextInfo: { mentionedJid: [message.reply_message.data.participant] } });
        await message.client.groupMakeAdmin(message.jid, [message.reply_message.data.participant]);
    } else if (message.reply_message === false && message.mention !== false) {
        var etiketler = '';
        message.mention.map(async(user) => {
            var checkAlready = await checkImAdmin(message, user);
            if (checkAlready) {
                return await message.sendMessage(Lang.ALREADY_PROMOTED, MessageType.text);
            }

            etiketler += '@' + user.split('@')[0] + ',';
        });

        await message.sendMessage(etiketler + Lang.PROMOTED, MessageType.text, { contextInfo: { mentionedJid: message.mention } });
        await message.client.groupMakeAdmin(message.jid, message.mention);
    } else {
        return await message.sendMessage(Lang.GIVE_ME_USER);
    }
}));

Asena.addCommand({ pattern: 'demote ?(.*)', fromMe: true, onlyGroup: true, desc: Lang.DEMOTE_DESC }, (async(message, match) => {
    var im = await checkImAdmin(message);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);

    if (message.reply_message !== false) {
        var checkAlready = await checkImAdmin(message, message.reply_message.data.participant.split('@')[0]);
        if (!checkAlready) {
            return await message.sendMessage(Lang.ALREADY_NOT_ADMIN, MessageType.text);
        }

        await message.sendMessage('@' + message.reply_message.data.participant.split('@')[0] + Lang.DEMOTED, MessageType.text, { contextInfo: { mentionedJid: [message.reply_message.data.participant] } });
        await message.client.groupDemoteAdmin(message.jid, [message.reply_message.data.participant]);
    } else if (message.reply_message === false && message.mention !== false) {
        var etiketler = '';
        message.mention.map(async(user) => {
            var checkAlready = await checkImAdmin(message, user);
            if (!checkAlready) {
                return await message.sendMessage(Lang.ALREADY_NOT_ADMIN, MessageType.text);
            }

            etiketler += '@' + user.split('@')[0] + ',';
        });

        await message.sendMessage(etiketler + Lang.DEMOTED, MessageType.text, { contextInfo: { mentionedJid: message.mention } });
        await message.client.groupDemoteAdmin(message.jid, message.mention);
    } else {
        return await message.sendMessage(Lang.GIVE_ME_USER);
    }
}));

Asena.addCommand({ pattern: 'lock ?(.*)', fromMe: true, onlyGroup: true, desc: Lang.MUTE_DESC }, (async(message, match) => {
    var im = await checkImAdmin(message);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    await message.client.groupSettingChange(message.jid, GroupSettingChange.messageSend, true);
    await message.sendMessage(Lang.MUTED);
}));

Asena.addCommand({ pattern: 'unlock ?(.*)', fromMe: true, onlyGroup: true, desc: Lang.UNMUTE_DESC }, (async(message, match) => {
    var im = await checkImAdmin(message);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    await message.client.groupSettingChange(message.jid, GroupSettingChange.messageSend, false);
    await message.sendMessage(Lang.UNMUTED);
}));

Asena.addCommand({ pattern: 'invitelink ?(.*)', fromMe: true, onlyGroup: true, desc: Lang.INVITE_DESC }, (async(message, match) => {
    var im = await checkImAdmin(message);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    var invite = await message.client.groupInviteCode(message.jid);
    await message.sendMessage(Lang.INVITE + ' https://chat.whatsapp.com/' + invite);
}));

module.exports = {
    checkImAdmin: checkImAdmin
};