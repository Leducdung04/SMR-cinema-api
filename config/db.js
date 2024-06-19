const mongoose = require('mongoose');

const local = "mongodb://localhost:27017/Database_SMR";

const connect = async () => {
    try {
        await mongoose.connect(local, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connection success');
    } catch (error) {
        console.error('Connection error:', error);
    }
};
module.exports = { connect };