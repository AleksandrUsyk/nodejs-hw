import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.username) {
    this.username = this.email;
  }
  next();
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = model('User', userSchema);
