import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { randomUUID } from "crypto";

const auth = "";
const baseRDV = "";
const baseNFT = "";
const phone = "";
const event_id = "";
const ticket_id = "";
const service_id = "";
const baseGmail = "";

const getPass = async (email: string) => {
  const response = await fetch(
    `${baseRDV}/pass/tokenizeNFT?email=${email}&auth=${auth}`
  );
  const res = await response.json();
  return res.map((r: any) => ({
    link: r.media_link,
    event: r.event_name,
    mail: r.user_mail,
    user: r.user_name,
  }));
};

const genPass = async (
  email: string,
  name: string,
  client: Client,
  id: string,
  num: string | null
) => {
  console.log(email,name,id,num);
  const data = JSON.stringify({
    data: {
      user: {
        name: name,
        mail: email,
        mobile: phone,
        business: "Tryst IIT Delhi",
      },
      event: event_id,
      ticket: ticket_id,
    },
    user: service_id,
  });

  const r = await fetch(baseNFT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: service_id,
    },
    body: JSON.stringify(data),
  });
  const t = r.text();
  client.sendMessage(id, t, MessageType.text);
  setTimeout(
    () =>
      getPass(email).then((r) =>
        client.sendMessage(
          num ? `91{num}@s.whatsapp.net` : id,
          `Email: ${r.mail}\n\n
          Name: ${r.user}\n\n
          Event: ${r.event}\n\n
          Link: ${r.link}`,
          MessageType.text
        )
      ),
    30 * 1000
  );
};

module.exports = {
  name: "ghost",
  description: "Generate ghost passes",
  extendedDescription: ".ghost 10 for 10 passes",
  demo: { isEnabled: false },
  async handle(
    client: Client,
    chat: proto.IWebMessageInfo,
    BotsApp: BotsApp,
    args: string[]
  ): Promise<void> {
    try {
      if (!BotsApp.isGroup) {
        client
          .sendMessage(
            BotsApp.chatId,
            STRINGS.general.NOT_A_GROUP,
            MessageType.text
          )
          .catch((err) => inputSanitization.handleError(err, client, BotsApp));
        return;
      }
      await client.getGroupMetaData(BotsApp.chatId, BotsApp);
      if (!BotsApp.isSenderGroupAdmin) {
        client
          .sendMessage(
            BotsApp.chatId,
            "Only Admins can use this command",
            MessageType.text
          )
          .catch((err) => inputSanitization.handleError(err, client, BotsApp));
        return;
      }
      if (!BotsApp.isTextReply) {
        const num = parseInt(args[0]);
        if (Number.isNaN(parseInt(args[0]))) {
          client
            .sendMessage(
              BotsApp.chatId,
              "Format is '.ghost 10' for 10 passes",
              MessageType.text
            )
            .catch((err) =>
              inputSanitization.handleError(err, client, BotsApp)
            );
          return;
        }
        for (let i = 0; i < num; i++) {
          await genPass(
            `${baseGmail}+${randomUUID().split("-")[0]}@gmail.com`,
            "Invitee",
            client,
            BotsApp.chatId,
            args[1]
          );
        }
      } else {
        const msg = BotsApp.replyMessage;
        const users = msg.split("\n").map((r) => r.split(","));
        for (let i = 0; i < users.length; i++) {
          await genPass(users[i][0], users[i][2], client, BotsApp.chatId, users[i][1]);
        }
      }
    } catch (err) {
      await inputSanitization.handleError(err, client, BotsApp);
      return;
    }
  },
};
