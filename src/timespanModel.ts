import * as mongodb from "mongodb";

export interface Timespan {
  _id?: mongodb.ObjectId;
  name?: string;
  project?: string;
  mode: "tracker" | "pomodoro";
  startTime: Date;
  endTime: Date;
}
