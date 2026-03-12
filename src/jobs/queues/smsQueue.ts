import Bull from "bull";

export const smsQueue = new Bull("sms", {
  redis: process.env.REDIS_URL,
});
