import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import CONFIG from "../config";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import format from "string-format";
import fs from 'fs';
const ADD = STRINGS.add;

module.exports = {
    name: "addmulti",
    description: "Adds multiple numbers to a group",
    extendedDescription: "Give a list of numbers to add",
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            await client.getGroupMetaData(BotsApp.chatId, BotsApp);
            let members = {};
            BotsApp.groupMembers.forEach(m => members[m.id] = true);
            
            if (!BotsApp.isBotGroupAdmin) {
                client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.general.BOT_NOT_ADMIN,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            if (args.length === 0) {
                client.sendMessage(
                    BotsApp.chatId,
                    ADD.NO_ARG_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            let ok : string[] = [];
            args.forEach(async n => {
                if (parseInt(n) === NaN || n[0] === "+" || n.length < 10) {
                    client.sendMessage(
                        BotsApp.chatId,
                        ADD.NUMBER_SYNTAX_ERROR,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }
                let number;
                if (n.length === 10 && !(parseInt(n) === NaN)) {
                    number = CONFIG.COUNTRY_CODE + n;
                } else {
                    number = n;
                }
                number += "@s.whatsapp.net";
                if (!members[number]) {
                    ok.push(number);
                    members[number] = false;
                }
            });

            const response: any = await client.sock.groupParticipantsUpdate(BotsApp.chatId, ok, 'add');

            await client.getGroupMetaData(BotsApp.chatId, BotsApp);
            BotsApp.groupMembers.forEach(m => members[m.id] = true);

            let done = ok.filter(m => members[m] === true);
            await client.sendMessage(
                BotsApp.chatId,
                "*Added* \n```" + done.map(m => '+'+m.split('@')[0]).join('\n') + "```",
                MessageType.text
            )

            let notok = ok.filter(m => members[m] === false);
            notok.forEach(async n => {
                const code = await client.sock.groupInviteCode(BotsApp.chatId);
                await client.sendMessage(
                    n,
                    "```Hi! You have been invited to join this WhatsApp group!``` https://chat.whatsapp.com/"+code,
                    MessageType.text
                );
            });
            if (notok.length !== 0) 
                await client.sendMessage(
                    BotsApp.chatId,
                    "*Invited* \n```" + notok.map(m => '+'+m.split('@')[0]).join('\n') + "```",
                    MessageType.text
                );
        } catch (err) {
            if (err.status == 400) {
                await inputSanitization.handleError(
                    err,
                    client,
                    BotsApp,
                    ADD.NOT_ON_WHATSAPP
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            }
            await inputSanitization.handleError(err, client, BotsApp);
        }
        return;
    },
};
