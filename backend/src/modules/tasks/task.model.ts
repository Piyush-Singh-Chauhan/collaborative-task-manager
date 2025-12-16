import mongoose, {Schema, Document, mongo} from "mongoose";

export interface ITask extends Document {
    title : string;
    description : string;
    dueDate : Date;
    priority : "Low" | "Medium" | "High" | "Urgent";
    status : "To Do" | "In Progress" | "Review" | "Complete";
    creatorId : mongoose.Types.ObjectId;
    assignedToId : mongoose.Types.ObjectId;
}

const TaskSchema = new Schema<ITask> ({
    title : {
        type : String,
        required : true,
        maxlength : 100,
    },
    description : {
        type : String,
    },
    dueDate : {
        type : Date,
        required : true,
    },
    priority : {
        type : String,
        enum : ["Low", "Medium", "High", "Urgent"],
        default : "Medium",
    },
    status : {
        type : String,
        enum : ["To Do", "In Progress", "Review", "Complete"],
        default : "To Do",
    },
    creatorId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    assignedToId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    }
},
    { timestamps : true}
);

export default mongoose.model<ITask>("Task", TaskSchema)