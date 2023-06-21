import { Markup, Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { getAdvert } from "./components/api.js";
dotenv.config();

const USERNAME_WHITELIST = process.env.USERNAME_WHITELIST.split(",");
const ADMIN_CHAT_ID_PLEKTAN = process.env.ADMIN_CHAT_ID_PLEKTAN;
const SPECIAL_CHARS = [
  "\\",
  "*",
  "[",
  "]",
  "(",
  ")",
  "~",
  "`",
  ">",
  "<",
  "&",
  "#",
  "+",
  "-",
  "=",
  "|",
  "{",
  "}",
  ".",
  "!",
  "_",
];
const contactUserName = "artem_postolovskyi";
const escapeMarkdown = text => {
  SPECIAL_CHARS.forEach(char => (text = text.replaceAll(char, `\\${char}`)));
  return text;
};
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(ctx => {
  console.log(ctx.message);
  ctx.reply(
    `Hello ${
      ctx.message.from.first_name
        ? ctx.message.from.first_name
        : "Have a nice day! "
    }`
  );
});
bot.command("sticker", ctx => ctx.reply("Send me a sticker"));
bot.command("course", async ctx => {
  const text = "Натисніть кнопку щоб отримати квартири";
  await ctx.reply(
    text,
    Markup.inlineKeyboard([[Markup.button.callback("Get posts", "btn_1")]])
  );
});
bot.hears("hi", ctx => ctx.reply("Hey there"));
bot.on("my_chat_member", ctx => {
  if (ctx.update.my_chat_member) {
    if (
      ["creator", "administrator", "member"].includes(
        ctx.update.my_chat_member.new_chat_member.status
      )
    ) {
      ctx.sendMessage(
        `Hello! Added to chat ID - ${ctx.update.my_chat_member.chat.id}, Title - ${ctx.update.my_chat_member.chat.title}`,
        {
          chat_id: ADMIN_CHAT_ID_PLEKTAN,
        }
      );
    }
  }
});
bot.on("message", async ctx => {
  if (!USERNAME_WHITELIST.includes(ctx.update.message.chat.username)) {
    await ctx.reply("На жаль у вас немає доступу :(");
    return;
  }
  const advert = await getAdvert(ctx.message.text);
  JSON.stringify(advert);
  if (advert == null) {
    await ctx.reply("Обʼява не знайдена");
    return;
  }
  let {
    propertyComplex,
    housestr,
    advertInfo,
    streetId,
    roomCount,
    storey,
    price,
    storeys,
    media,
    ownerShip,
    guestsRequirements,
    legalInformation,
    areaTotal,
  } = advert;
  propertyComplex = propertyComplex || "";
  const propertyComplexWords = [];
  for (const word of propertyComplex.split(" ")) {
    propertyComplexWords.push(word[0].toUpperCase() + word.substring(1));
  }
  propertyComplex = propertyComplexWords.join(" ").replace(/«|»/g, "");
  let complexTag = propertyComplex.replace(/\s|ЖК|\-/g, "");
  if (propertyComplex.includes("ЖК Вул. Майорова, 6")) {
    if (housestr) {
      if (housestr.includes("7")) {
        propertyComplex = "Будинок 2010 року";
      } else if (housestr.includes("14")) {
        propertyComplex = "ЖК на Калнишевського,14";
      }
    }
  }
  let currPrice = `${price}`;
  if (currPrice.includes("$")) {
    currPrice = currPrice + "доларів";
  } else {
    currPrice = currPrice + "грн";
  }
  currPrice = currPrice.replace(/\$|₴|\s|/g, "");

  const residentialComplexEmojis = {
    "ЖК Яскравий": ["🌇", "🔸", process.env.CHAT_MINSKY],
    "ЖК Міністерський": ["🏙", "🔹", process.env.CHAT_MINSKY],
    "ЖК Бережанський": ["🌆", "🟠", process.env.CHAT_MINSKY],
    "ЖК Navigator": ["⛩", "🔺", process.env.CHAT_MINSKY],
    "ЖК Богатирський": ["🌆", "🟠", process.env.CHAT_MINSKY],
    "ЖК на Калнишевського,14": ["🔰", "♻️", process.env.CHAT_MINSKY],
    "Будинок 2010 року": ["🔴", "▫️", process.env.CHAT_MINSKY],
    "ЖК Вишиванка": ["⛩", "🟧", process.env.CHAT_MINSKY],
    "ЖК Варшавський Мікрорайон": ["🏙", "🔹", process.env.CHAT_NYVKY],
    "ЖК Варшавський Плюс": ["🌃", "➕", process.env.CHAT_NYVKY],
    "ЖК Крістер Град": ["🏬", "🔸", process.env.CHAT_NYVKY],
    "ЖК Ліпінка": ["🏘", "🟢", process.env.CHAT_NYVKY],
    "ЖК Новомостицько-Замковецький": ["🌁", "▫️", process.env.CHAT_NYVKY],
    "ЖК Новомостицький": ["🏛", "⚫️", process.env.CHAT_NYVKY],
    "ЖК Паркове Місто": ["🍀", "🔸", process.env.CHAT_NYVKY],
    "ЖК Паркова Вежа": ["🎍", "🔸", process.env.CHAT_NYVKY],
    "ЖК Сирецькі Сади": ["🏠", "▫️", process.env.CHAT_NYVKY],
    "ЖК Місто Квітів": ["🏞", "🌹", process.env.CHAT_NYVKY],
    "ЖК Файна Таун": ["🌌", "▪️", process.env.CHAT_NYVKY],
    "ЖК Gloria Park": ["🌇", "🔸", process.env.CHAT_NYVKY],
    "ЖК Наш Будинок": ["🏠", "▫️", process.env.CHAT_NYVKY],
    "ЖК San Francisco Creative House": ["🌉", "🔲", process.env.CHAT_NYVKY],
    "ЖК Нивки Парк": ["🌇", "🔸", process.env.CHAT_NYVKY],
    "ЖК Берестейський": ["🌉", "🔺", process.env.CHAT_NYVKY],
  };

  const complexEmoji = `${
    (residentialComplexEmojis[propertyComplex] || [null, null, null])[0] || ""
  } *${escapeMarkdown(propertyComplex)}* `;
  const draftEmojis =
    (residentialComplexEmojis[propertyComplex] || [null, null, null])[1] || "";

  complexTag = complexTag.replace("CreativeHouse", "");
  complexTag = complexTag.replace("Мікрорайон", "");

  if (complexTag.includes("Майорова")) {
    complexTag = "Калнишевського";
  }

  const draft = `
  ${complexEmoji}
${ownerShip === "кооперативна" ? "📍📍" : "📍"} __${
    streetId ? escapeMarkdown(streetId) : ""
  }${housestr ? escapeMarkdown(", " + housestr) : ""}__
  
${draftEmojis}${roomCount}\\-кімнатна квартира
${draftEmojis}Поверх: ${storey}/${storeys}
${draftEmojis}Площа: ${areaTotal}м2
${guestsRequirements === "без тварин" ? "🐾" + "Без тварин" + "\n" : ""}\
${
  guestsRequirements === "можна іноземцям"
    ? "🐸" + "Можна з тваринками\\!" + "\n"
    : ""
}\
${advertInfo ? "💬" + escapeMarkdown(advertInfo) + "\n" : ""}\
  
${currPrice.includes("доларів") ? "💵" : "💰"}Ціна: \\#${escapeMarkdown(
    currPrice
  )}\\.${
    legalInformation && legalInformation.includes("прописаний неповнолітній")
      ? "\\(ТОРГ\\)"
      : ""
  }
  
📱@${escapeMarkdown(contactUserName)}
📞\\+380663275181
\\#${roomCount}кімнатна \\#${escapeMarkdown(complexTag) || "НеЖк"}
  `;
  const mediaGroup = [];

  for (let i = 0; i < media.length; i += 1) {
    if (
      media[i] ===
        "https://re-media.plektan.com/img/prop/5b/47/5b4757fd31b8a8762e31c5205aa758f1.jpg" ||
      media[i] ===
        "https://re-media.plektan.com/img/prop/ec/e9/ece9bf60b023230a895831dd8bc5066e.jpg" ||
      media[i] ===
        "https://re-media.plektan.com/img/prop/dd/7c/dd7c1d944f6a0e2f46e370953f2f93c6.jpg" ||
      media[i] ===
        "https://re-media.plektan.com/img/prop/33/2b/332b8034d25ca8c3239c419c87389496.jpg"
    ) {
      console.warn("Problematic picture, ignoring");
      continue;
    }
    if (i === 0) {
      mediaGroup.push({
        type: "photo",
        media: media[i],
        caption: draft,
        parse_mode: "MarkdownV2",
      });
    } else {
      mediaGroup.push({
        type: "photo",
        media: media[i],
      });
    }
  }
  let chatId = (residentialComplexEmojis[propertyComplex] || [
    null,
    null,
    null,
  ])[2];
  await ctx.replyWithMediaGroup(mediaGroup);
  if (chatId) {
    await ctx.sendMediaGroup(mediaGroup, {
      chat_id: chatId,
    });
  }
});
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
export const telegraf = bot;
export const handler = async event => {
  if (event.requestContext && event.requestContext.http) {
    if (event.requestContext.http.path === "/set-webhook") {
      const url = `https://${event.requestContext.domainName}/webhook`;
      await bot.telegram.setWebhook(url);
      return {
        statusCode: 200,
        body: JSON.stringify({ url }),
      };
    } else if (
      event.requestContext.http.path === "/webhook" &&
      event.requestContext.http.method === "POST"
    ) {
      if (event.body) {
        let body = event.body;
        if (event.isBase64Encoded) {
          body = Buffer.from(event.body, "base64");
        }
        try {
          await bot.handleUpdate(JSON.parse(body));
        } catch (e) {
          console.error(e);
        }
        return {
          statusCode: 200,
          body: JSON.stringify(true),
        };
      }
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify("invalid request"),
  };
};
