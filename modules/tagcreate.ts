import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client.js";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";
import CONFIG from "../config";

module.exports = {
    name: "tagcreate",
    description: "Creates a tagging message",
    extendedDescription: "Give tag message and list of numbers",
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            let members : string [] = [];
            for (let i = 1; i < args.length; i++) {
                let n = args[i];
                if (n.length === 10)
                    n = CONFIG.COUNTRY_CODE + n;
                n += '@s.whatsapp.net';
                members.push(n);
            }
            client.sendMessage(
                BotsApp.chatId,
                args[0],
                MessageType.text,
                {
                    contextInfo: {
                        mentionedJid: members,
                    },
                }
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
        return;
    },
};
