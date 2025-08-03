import mongoose from "mongoose";

const builderQueueSchema = new mongoose.Schema({
    id: { type: String, required: true },
    status: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const BuilderQueue = mongoose.model("BuilderQueue", builderQueueSchema);

export default BuilderQueue;
