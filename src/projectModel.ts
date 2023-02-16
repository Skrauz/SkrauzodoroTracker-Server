import * as mongodb from 'mongodb';

export interface Project {
    _id?: mongodb.ObjectId;
    name?: string;
}