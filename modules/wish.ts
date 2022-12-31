import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import CONFIG from "../config";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";

const ADD = STRINGS.add;

module.exports = {
    name: "wish",
    description: "Wishes a list of people",
    extendedDescription: "reply to the list of numbers with names, and tag with '.wish <Greeting>'",
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            if (!BotsApp.isTextReply) {
                client.sendMessage(
                    BotsApp.chatId,
                    "Create a message with the list of contacts (numbers and names) and tag it with this message",
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
            let names = {};
            
            const rows = BotsApp.replyMessage.split('\n');
            rows.forEach((r) => {
                const n = r.split(' ')[0];
                const name = r.replace(n, '');
                if (Number.isNaN(parseInt(n)) || n[0] === "+" || n.length < 10) {
                    client.sendMessage(
                        BotsApp.chatId,
                        ADD.NUMBER_SYNTAX_ERROR,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }
                let number;
                if (n.length === 10 && !(Number.isNaN(parseInt(n)))) {
                    number = CONFIG.COUNTRY_CODE + n;
                } else {
                    number = n;
                }
                number += "@s.whatsapp.net";
                    ok.push(number);
                names[number] = name;
            });
            for (let i = 0; i<ok.length; i++) {
                const msg = `${args.join(' ')}${names[ok[i]]}!`;
                await client.sendMessage(
                    ok[i],
                    msg,
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
