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
    name: "sendmulti",
    description: "Sends a message to a list of people",
    extendedDescription: "reply to the message text",
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            if (!BotsApp.isTextReply) {
                client.sendMessage(
                    BotsApp.chatId,
                    "Create a message with the text to be sent then reply to it with this command",
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            const message = BotsApp.replyMessage;
            console.log({ message });

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
                    ok.push(number);
            });
            for (let i = 0; i<ok.length; i++) {
                await client.sendMessage(
                    ok[i],
                    message,
                    MessageType.text
                );
            }
            await client.sendMessage(
                BotsApp.chatId,
                "Sent",
                MessageType.text
            )
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
