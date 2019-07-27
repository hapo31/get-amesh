import fetch from "node-fetch";
import sharp = require("sharp");

const ameshPrefix = "https://tokyo-ame.jwa.or.jp/mesh/000/";
const mapUrl = "https://tokyo-ame.jwa.or.jp/map/map000.jpg";
const maskUrl = "https://tokyo-ame.jwa.or.jp/map/msk000.png";

export default async function getAmesh() {
  const now = new Date();
  // 時間が5分刻みの直後すぎると画像がサーバーで生成されてないっぽいので最大10分前の画像を取るようにする
  const nowStr = dateStr(new Date(now.getTime() - 5 * 60 * 1000));
  try {
    const map = await fetch(mapUrl);
    const mask = await fetch(maskUrl);
    const lain = await fetch(`${ameshPrefix}/${nowStr}.gif`);

    return sharp(await map.buffer())
      .composite([
        {
          input: await lain.buffer()
        },
        {
          input: await mask.buffer()
        }
      ])
      .toBuffer();
  } catch (e) {
    console.error(e);
  }
}

function dateStr(date: Date): string {
  return (
    `${date.getFullYear()}` +
    `00${date.getMonth() + 1}`.slice(-2) +
    `00${date.getDate()}`.slice(-2) +
    `00${date.getHours()}`.slice(-2) +
    `00${Math.floor(date.getMinutes() / 5) * 5}`.slice(-2)
  );
}

// for AWS Lambda
exports.handler = async (event: any, context: any, callback: any) => {
  try {
    const buffer = await getAmesh();
    if (buffer) {
      callback(null, buffer.toString("base64"));
    }
  } catch (e) {
    callback(e, null);
  }
};
