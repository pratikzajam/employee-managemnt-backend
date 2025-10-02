import mongoose from 'mongoose';


const { Schema } = mongoose;

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    position: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    }

},
    { timestamps: true });



const employee = mongoose.model("Employee", employeeSchema);
export default employee;