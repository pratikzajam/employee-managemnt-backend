import express from 'express';
import { addEmployee, fetchAllEmployees, deleteEmployee, updateEmployee, getEmployeeById } from '../Controllers/employee.controller.js';
import fieldValidator from '../Middlewares/fieldValidator.js';

let Router = express.Router();


Router.post("/employees", fieldValidator, addEmployee)
Router.get("/employees", fetchAllEmployees)
Router.delete("/employees/:id", deleteEmployee)
Router.patch("/employees/:id", updateEmployee)
Router.get("/employees/:id", getEmployeeById)


export default Router