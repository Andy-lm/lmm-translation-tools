import https from "https";
import querystring from "querystring";
import md5 from "md5";
import { appId, appSecret } from "./private";
import { IncomingMessage, ServerResponse } from "http";

type ErrorMap = {
  [key: string]: string;
};

const errorMap:ErrorMap = {
  "52001": "请求超时",
  "52002": "系统错误",
  "52003": "身份认证失败",
};

export const translate = (word: string) => {
  const salt = Math.random();
  const sign = md5(appId + word + salt + appSecret);
  let from, to;

  // 这里暂时只支持中英翻译，后续可通过map优化为多语种翻译
  if (/[a-zA-Z]/.test(word)) {
    from = "en";
    to = "zh";
  } else {
    from = "zh";
    to = "en";
  }

  const query: string = querystring.stringify({
    q: word,
    appid: appId,
    from,
    to,
    salt,
    sign,
  });

  const options = {
    hostname: "api.fanyi.baidu.com",
    port: 443,
    path: "/api/trans/vip/translate?" + query,
    method: "GET",
  };

  // 通过node发送https请求
  const request = https.request(options, (response: IncomingMessage) => {
    const chunks: Buffer[] = [];
    // 拿到GET请求的数据
    response.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    response.on("end", () => {
      const string = Buffer.concat(chunks).toString();
      type BaiduResult = {
        error_code?: string;
        error_msg?: string;
        from: string;
        to: string;
        trans_result: {
          src: string;
          dst: string;
        }[];
      };
      const object: BaiduResult = JSON.parse(string);
      if (object.error_code) {
        console.log(errorMap[object.error_code] || object.error_msg);
        process.exit(2);
      } else {
        object.trans_result.forEach((result, index) => {
          console.log(`${index + 1}.${result.dst}`);
        });
        process.exit(0);
      }
    });
  });

  request.on("error", (e) => {
    console.error(e);
  });
  request.end();
};
