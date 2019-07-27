import fetch from "node-fetch";
import { writeFile, stat, Stats, mkdir } from "fs";
import sharp = require("sharp");

const ameshPrefix = "https://tokyo-ame.jwa.or.jp/mesh/000/";
const mapUrl = "https://tokyo-ame.jwa.or.jp/map/map000.jpg";
const maskUrl = "https://tokyo-ame.jwa.or.jp/map/msk000.png";

const tmpDir = ".tmp";

(async () => {
  const now = new Date();
  // 時間が5分刻みの直後すぎると画像がサーバーで生成されてないっぽいので最大10分前の画像を取るようにする
  const nowStr = dateStr(new Date(now.getTime() - 5 * 60 * 1000));
  try {
    const dirExists = await fileExists(tmpDir);
    if (dirExists == null) {
      await createDirAsync(tmpDir);
    }

    const mapExists = await fileExists(`${tmpDir}/map.jpg`);
    if (mapExists == null) {
      const map = await fetch(mapUrl);
      await writeFileAsync(`${tmpDir}/map.jpg`, await map.buffer());
    }

    const maskExists = await fileExists(`${tmpDir}/mask.png`);
    if (maskExists == null) {
      const mask = await fetch(maskUrl);
      await writeFileAsync(`${tmpDir}/mask.png`, await mask.buffer());
    }

    const lain = await fetch(`${ameshPrefix}/${nowStr}.gif`);

    sharp(`${tmpDir}/map.jpg`)
      .composite([
        {
          input: await lain.buffer()
        },
        {
          input: `${tmpDir}/mask.png`
        }
      ])
      .toFile("output.png");
  } catch (e) {
    console.error(e);
  }
})();

function dateStr(date: Date): string {
  return (
    `${date.getFullYear()}` +
    `00${date.getMonth() + 1}`.slice(-2) +
    `00${date.getDate()}`.slice(-2) +
    `00${date.getHours()}`.slice(-2) +
    `00${Math.floor(date.getMinutes() / 5) * 5}`.slice(-2)
  );
}

async function fileExists(path: string) {
  return new Promise<Stats | null>(res => {
    stat(path, (err, stats) => {
      if (err) {
        res(null);
        return;
      }
      res(stats);
    });
  });
}

async function writeFileAsync(path: string, data: unknown) {
  return new Promise((res, rej) => {
    writeFile(path, data, err => {
      if (err) {
        rej(err);
        return;
      }
      res();
    });
  });
}

async function createDirAsync(path: string) {
  return new Promise((res, rej) => {
    mkdir(path, err => {
      if (err) {
        rej(err);
        return;
      }
      res();
    });
  });
}
