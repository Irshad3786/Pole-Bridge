import mongoose, { Schema, models, Document } from "mongoose"

interface Vote {
  optionIndex: number
  voterName: string
  voterEmail: string
  voterId: mongoose.Types.ObjectId
  votedAt: Date
}

interface Question {
  question: string
  options: string[]
  votes: Vote[]
}

interface PollI extends Document {
  title: string
  description: string
  questions: Question[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const voteSchema = new Schema<Vote>({
  optionIndex: { type: Number, required: true },
  voterName: { type: String, required: true },
  voterEmail: { type: String, required: true },
  voterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  votedAt: { type: Date, default: Date.now }
}, { _id: false })

const questionSchema = new Schema<Question>({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  votes: { type: [voteSchema], default: [] }
}, { _id: false })

const pollSchema = new Schema<PollI>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true
  }
)

export const Poll = models.Poll || mongoose.model<PollI>("Poll", pollSchema)
