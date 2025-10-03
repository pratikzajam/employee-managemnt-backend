import validator from "validator"
import employees from '../Models/employee.model.js'
import mongoose from 'mongoose'


export let addEmployee = async (req, res) => {
    try {
        const { name, email, position, age, phone } = req.body || {};


        let isEmailValid = validator.isEmail(email);  //checking if email is valid or not

        if (!isEmailValid) {
            return res.status(409).json({
                status: false,
                message: "Entered Email Is Not Valid",
                data: null
            })
        }

        let isPhoneValid = validator.isMobilePhone(phone, "en-IN");


        if (!isPhoneValid) {
            return res.status(400).json({
                status: false,
                message: "Phone Number IS Not valid",
                data: null
            })
        }

        let isEmployeeExists = await employees.findOne({ email: email }); //checking if email is exists  or not in db

        if (isEmployeeExists) {
            return res.status(400).json({
                status: false,
                message: "Employee Allready Exists",
                data: null
            })
        }

        let newEmployee = new employees({
            name: name,
            email: email,
            position: position,
            age: age,
            phone: phone
        })


        let saveEmployee = await newEmployee.save();    //Saving the user in database


        if (saveEmployee._id) {
            return res.status(201).json({
                status: true,
                message: "Employee added sucessfully",
                data: null
            })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        })
    }
}




export let fetchAllEmployees = async (req, res) => {
    try {

        const getAllEmployees = await employees
            .find({}, { updatedAt: 0, __v: 0 }) //fetching employees from db and sorting according to date
            .sort({ createdAt: -1 });


        if (getAllEmployees.length < 1) {
            return res.status(400).json({
                status: false,
                message: "No Employees Found",
                data: []
            })
        }


        return res.status(201).json({
            status: true,
            message: "Employee Data Fetched Sucessfully",
            data: getAllEmployees
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: []
        })
    }
}



export let deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;


        if (!id) {
            return res.status(404).json({
                status: true,
                message: "Employee Id Not Found",
                data: null
            })
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Employee ID",
                data: null
            });
        }


        let isEmployeeExists = await employees.findById(id);  //checking if employee exists or not

        if (!isEmployeeExists) {
            return res.status(404).json({
                status: false,
                message: "Employee Not Found",
                data: null
            })
        }

        let deleteEmployee = await employees.deleteOne({ _id: id });

        if (deleteEmployee.deletedCount == 1) {
            return res.status(200).json({
                status: true,
                message: "Employee Deleted Sucessfully",
                data: null
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        })
    }
}




export let updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, position, phone } = req.body;


        if (!id) {
            return res.status(404).json({
                status: false,
                message: "Employee Id Not Found",
                data: null
            })
        }

        let isPhoneValid = validator.isMobilePhone(phone, "en-IN");

        if (!isPhoneValid) {
            return res.status(400).json({
                status: false,
                message: "Phone Number IS Not valid",
                data: null
            })
        }



        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Employee ID",
                data: null
            });
        }


        let employeeData = await employees.findById(id);

        console.log(employeeData)



        if (!employeeData) {
            return res.status(404).json({
                status: false,
                message: "Employee Not Found",
                data: null
            })
        }




        if (!name) {
            name = employeeData.name   // if data coming from frontend is null then assigning saved values

        }

        if (!phone) {
            phone = employeeData.phone
        }

        if (!position) {
            position = employeeData.position
        }



        let email = employeeData.email

        let updateEmployees = await employees.updateOne({ _id: id }, {
            name: name,
            email: email,
            position: position,
            phone: phone
        })



        if (updateEmployees.modifiedCount == 1) {
            return res.status(200).json({
                status: true,
                message: "Employee Data Updated Sucessfully",
                data: null
            });
        }


    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        })
    }
}


export let getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(404).json({
                status: true,
                message: "Employee Id Not Found",
                data: null
            })
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Employee ID",
                data: null
            });
        }


       const employeeData = await employees.findById(id, { createdAt: 0, updatedAt: 0, __v: 0 });



        if (!employeeData) {
            return res.status(404).json({
                status: false,
                message: "Employee Not Found",
                data: null
            })
        }

        return res.status(200).json({
            status: true,
            message: "Employee Data Fetched Sucessfully",
            data: employeeData
        });



    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        })
    }
}