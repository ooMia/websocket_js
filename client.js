import { Client } from "@stomp/stompjs";

import { WebSocket } from "ws";
Object.assign(global, { WebSocket });

const serverHost = "13.125.66.243"; // Personal EC2
// const serverHost = "43.201.65.76"; // Sinor EC2
// const serverHost = "localhost";

// 투표 기록에 대한 생성 및 삭제 요청 시
// 메시지 Body(Payload)로 사용되는 DTO
class voteLogDto {
  id;
  voteItemId;
  memberId;
  constructor(
    voteLogId = getRandomInteger(),
    voteItemId = getRandomInteger(),
    memberId = getRandomInteger()
  ) {
    this.id = voteLogId;
    this.voteItemId = voteItemId;
    this.memberId = memberId;
  }
}

const connectionHeaders = {
  login: "server",
  passcode: "verysecret",
};

let status = 0;
const client = new Client({
  brokerURL: `ws://${serverHost}:15674/ws`,
  connectHeaders: connectionHeaders,
  onConnect: () => {
    client.subscribe(`/exchange/vote.client/1.#`, (message) => {
      console.log(
        `[${new Date().toLocaleString("en-GB", { timeZone: "UTC" })}] ${
          message.headers["method"]
        } ${message.headers["Number-Data-Remains"]}`
      );
      console.log(`${message.body}`);
      if (message.headers["Number-Data-Remains"] == 0) {
        client.deactivate({ force: true });
      }
    });

    console.log(`onConnect: ` + client.connected);

    client.publish({
      headers: { method: "delete", "Number-Data-Remains": 1 },
      destination: `/exchange/vote.server/1}`,
      body: JSON.stringify(new voteLogDto(1, 2, 1)),
    });

    client.publish({
      headers: { method: "post", "Number-Data-Remains": 0 },
      destination: `/exchange/vote.server/1`,
      body: JSON.stringify(new voteLogDto(1, 1, 1)),
    });
  },
});
client.activate();

// /exchange, /topic, /queue, /amq/queue, /reply-queue/, /temp-queue
