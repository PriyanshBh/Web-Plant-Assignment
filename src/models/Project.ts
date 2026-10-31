import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectResponse {
  id: string;
  owner: string;
  title: string;
  description: string;
  taskCounts?: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project owner is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [80, "Title cannot exceed 80 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : "";
        if (ret.owner && typeof ret.owner === "object" && ret.owner.toString) {
          ret.owner = ret.owner.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : "";
        if (ret.owner && typeof ret.owner === "object" && ret.owner.toString) {
          ret.owner = ret.owner.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to quickly fetch projects for an owner sorted by newest
ProjectSchema.index({ owner: 1, createdAt: -1 });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
