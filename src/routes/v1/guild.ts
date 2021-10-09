import express from "express";
import { Member } from "../../models/Member";
import { v4 as uuidv4 } from "uuid";
import { Channel } from "../../models/Channel";

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

router.get("/members", async (req, res) => {
  return res.status(200).json((await Member.find()).map(member => member.member_id));
});

router.get("/channels", async (req, res) => {
  return res.status(200).json((await Channel.find()));
});

export default router;
