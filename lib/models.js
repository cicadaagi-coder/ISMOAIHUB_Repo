import mongoose from 'mongoose'

// ── User ──────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },   // stored as bcrypt hash
  createdAt: { type: Date, default: Date.now },
})

// ── Pipeline ──────────────────────────────────────────
// Stores the full node graph so it can be restored on login
const NodeSchema = new mongoose.Schema({
  id: String,
  type: String,       // prompt-to-image | angle-generator | prompt-modifier | storyboard | image-to-video
  x: Number,
  y: Number,
  data: mongoose.Schema.Types.Mixed,  // all field values keyed by field name
})

const ConnectionSchema = new mongoose.Schema({
  from: String,   // source node id
  to: String,     // target node id
})

const PipelineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Untitled Pipeline' },
  nodes: [NodeSchema],
  connections: [ConnectionSchema],
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

// ── Generated Asset ───────────────────────────────────
// Keeps a record of every image / video produced
const AssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline' },
  nodeId: String,
  type: { type: String, enum: ['image', 'video'] },
  url: String,          // URL returned by Atlas Cloud
  prompt: String,
  model: String,        // seedance-2.0 | kling-3.0
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
})

export const User     = mongoose.models.User     || mongoose.model('User',     UserSchema)
export const Pipeline = mongoose.models.Pipeline || mongoose.model('Pipeline', PipelineSchema)
export const Asset    = mongoose.models.Asset    || mongoose.model('Asset',    AssetSchema)
