const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: [true, "Please enter a first name"]},
    lastName: {type: String, required: [true, "Please enter a last name"]},
    email: {type: String, unique: [true, "This email is already taken"], required: [true, "Please enter a email"]},
    password: {type: String, required: [true, "Please enter a fpassweord"]},
});

userSchema.pre('save', function(next) {
let user = this;
if (!user.isModified('password')) {
    return next();
}
bcrypt.hash(user.password, 10)
.then(hash => {
    user.password = hash;
    next();
})
.catch(err => next(err));
});

userSchema.methods.comparePassword = function(rawPassword) {
    let user = this;
    return bcrypt.compare(rawPassword, user.password);
}

module.exports = mongoose.model('User', userSchema)