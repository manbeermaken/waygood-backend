import mongoose, { Schema } from "mongoose";

const universitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
    },
    partnerType: {
      type: String,
      enum: ["direct", "recruitment-partner", "institution-partner"],
      default: "direct",
    },
    qsRanking: Number,
    scholarshipAvailable: {
      type: Boolean,
      default: false,
    },
    popularScore: {
      type: Number,
      default: 0,
      index: true,
    },
    tags: [String],
    websiteUrl: String,
  },
  {
    timestamps: true,
  }
);

universitySchema.index({ name: "text", country: "text", city: "text" });

const University = mongoose.model("University", universitySchema);

export default University
