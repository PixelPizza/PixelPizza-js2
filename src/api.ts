import { Snowflake } from "discord.js";

type PixelID = string;
type Status = "all" | "not claimed" | "claimed" | "cooked" | "delivered" | "deleted";

interface BotConfig {
    token: string;
    pullurl: string;
}

interface BotSettings {
    mainguild: Snowflake;
    order: {
        chars: string;
        length: number;
    };
}

interface Rule {
    rule: string;
    anarchy: boolean;
}

interface Order {
    id: PixelID;
    userId: Snowflake;
    guildId: Snowflake;
    channelId: Snowflake;
    chefId?: Snowflake;
    delivererId?: Snowflake;
    imageUrl?: string;
    status: Status;
    order: string;
    orderedAt: Date;
    cookedAt?: Date;
    deliveredAt?: Date;
    deliveryMethod?: "dm" | "personal" | "bot";
}

interface Application {
    id: PixelID;
    userId: Snowflake;
    applicationType: "worker" | "staff" | "developer" | "teacher";
    status: "none" | "accepted" | "rejected";
    answers: ApplicationAnswer[];
    appliedAt: Date;
    staffId: Snowflake;
}

interface ApplicationAnswer {
    answer: string;
    question: string;
}

interface Blacklist {
    userId: Snowflake;
    reason: string;
}

interface Bug {
    id: PixelID;
    userId: Snowflake;
    bug: string;
    handled: boolean;
    staffId: Snowflake;
    notes: Note[];
}

interface Complaint {
    id: PixelID;
    userId: Snowflake;
    complaint: string;
    handled: boolean;
    staffId: Snowflake;
    notes: Note[];
}

interface Suggestion {
    id: PixelID;
    userId: Snowflake;
    suggestion: string;
    handled: boolean;
    staffId: Snowflake;
    notes: Note[];
}

interface Note {
    userId: Snowflake;
    note: string;
}

interface Config {
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

interface User {
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

interface Worker {
    id: Snowflake;
    cooks: number;
    deliveries: number;
    deliveryMessage: string;
    addedAt: Date;
}

export {
    BotConfig, 
    BotSettings, 
    Rule, 
};