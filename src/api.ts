import { Snowflake } from "discord.js";

type PixelID = string;

export interface BotConfig {
    token: string;
}

export interface Rule {
    rule: string;
    anarchy: boolean;
}

export interface Order {
    id: PixelID;
    userId: Snowflake;
    guildId: Snowflake;
    channelId: Snowflake;
    cookId: Snowflake;
    delivererId: Snowflake;
    imageUrl: string;
    status: "not claimed" | "claimed" | "cooked" | "delivered" | "deleted";
    order: string;
    orderedAt: Date;
    cookedAt: Date;
    deliveredAt: Date;
    deliveryMethod: "dm" | "personal" | "bot" | "none";
}

export interface Application {
    id: PixelID;
    userId: Snowflake;
    applicationType: "worker" | "staff" | "developer" | "teacher";
    status: "none" | "accepted" | "rejected";
    answers: ApplicationAnswer[];
    appliedAt: Date;
    staffId: Snowflake;
}

export interface ApplicationAnswer {
    answer: string;
    question: string;
}

export interface Blacklist {
    userId: Snowflake;
    reason: string;
}

export interface Bug {
    id: PixelID;
    userId: Snowflake;
    bug: string;
    handled: boolean;
    staffId: Snowflake;
    notes: Note[];
}

export interface Complaint {
    id: PixelID;
    userId: Snowflake;
    complaint: string;
    handled: boolean;
    staffId: Snowflake;
    notes: Note[];
}

export interface Suggestion {
    id: PixelID;
    userId: Snowflake;
    suggestion: string;
    handled: boolean;
    staffId: Snowflake;
    notes: Note[];
}

export interface Note {
    userId: Snowflake;
    note: string;
}

export interface Config {
    anarchyDay: Date;
    addExp: boolean;
    cookOwnOrder: boolean;
    cooldowns: boolean;
    deliverOwnOrder: boolean;
    developerApplications: boolean;
    staffApplications: boolean;
    teacherApplications: boolean;
    workerApplications: boolean;
}

export interface User {
    id: Snowflake;
    exp: number;
    level: number;
    balance: number;
    dailyStreak: number;
    lastDates: {
        vote: Date;
        daily: Date;
        weekly: Date;
        monthly: Date;
        yearly: Date;
    };
    style: {
        back: string;
        front: string;
        exp: {
            back: string;
            front: string;
        };
    };
}

export interface Worker {
    id: Snowflake;
    cooks: number;
    deliveries: number;
    deliveryMessage: string;
    addedAt: Date;
}