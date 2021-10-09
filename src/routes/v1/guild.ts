import express from "express";
import { Member } from "../../models/Member";
import { v4 as uuidv4 } from "uuid";
import { Channel } from "../../models/Channel";
import { Attachment, Message } from "../../models/Message";
import { upload } from "../../middleware/upload";
import { server } from "../../server";

const router = express.Router();

router.put("/member/:uuid", async (req, res) => {
  const member = new Member({_id: uuidv4(), member_id: req.params.uuid});
  await member.save();
  return res.status(201).json(member);
});

router.put("/channel", async (req, res) => {
  const {type, name} = req.body;
  const channel = new Channel({
    _id: uuidv4(), 
    name: name.trim(),
    type: type.trim(),
  });
  await channel.save();
  return res.status(201).json(channel);
});

router.post(
  "/message/:guild_id/:channel_id",
  express.urlencoded(),
  upload.any(),
  async (req, res) => {
    const { channel_id } = req.params;
    const data = JSON.parse(req.body.data);
    const files = req.files as Express.Multer.File[];
    if (!data) return;

    const message = await new Message({
      _id: uuidv4(),
      created_at: Date.now(),
      content: data.content,
      replying_to: data.replying_to,
      channel_id,
      author_id: data.author_id,
      attachments: files?.map((file) => new Attachment(file)),
    }).save();
    server.io.emit("message", message);
    res.status(201).json({ code: "message.sent" });
  }
);

router.get("/members", async (req, res) => {
  return res.status(200).json((await Member.find()).map(member => member.member_id));
});

router.get("/channels", async (req, res) => {
  return res.status(200).json((await Channel.find()));
});

router.get("/message/:channel_id/:offset/:count?", async (req, res) => {
  let { channel_id } = req.params;

  // Limit to max 50 messages per request
  let count = req.params.count ? parseInt(req.params.count) > 50 ? 50 : parseInt(req.params.count) : 0;

  // Check if negative numbers
  count = count < 0 ? 1 : count;

  let offset = req.params.offset ? parseInt(req.params.offset) < 0 ? 0 : parseInt(req.params.offset) : 0;

  try {
    const messages = await Message.find({ channel_id }).sort({ created_at: -1 }).skip(offset).limit(count);
    return res.status(200).json(messages);
  } catch (err: any) {
    return res.status(403).json({ err });
  }
});

export default router;
