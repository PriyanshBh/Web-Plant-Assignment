import mongoose, { Schema, Document, Model } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskResponse {
  id: string;
  project: string;
  owner: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const TaskSchema = new Schema<ITask>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["todo", "in-progress", "done"],
        message: "{VALUE} is not a valid task status",
      },
      default: "todo",
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : "";
        if (ret.project && typeof ret.project === "object" && ret.project.toString) {
          ret.project = ret.project.toString();
        }
        if (ret.owner && typeof ret.owner === "object" && ret.owner.toString) {
          ret.owner = ret.owner.toString();
        }
        if (ret.dueDate) {
          ret.dueDate = new Date(ret.dueDate).toISOString();
        } else {
          ret.dueDate = null;
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : "";
        if (ret.project && typeof ret.project === "object" && ret.project.toString) {
          ret.project = ret.project.toString();
        }
        if (ret.owner && typeof ret.owner === "object" && ret.owner.toString) {
          ret.owner = ret.owner.toString();
        }
        if (ret.dueDate) {
          ret.dueDate = new Date(ret.dueDate).toISOString();
        } else {
          ret.dueDate = null;
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index required by specification: { project: 1, status: 1, dueDate: 1 }
TaskSchema.index({ project: 1, status: 1, dueDate: 1 });
TaskSchema.index({ owner: 1, project: 1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
