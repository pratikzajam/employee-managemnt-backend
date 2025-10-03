import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Router from '../Routes/employee.routes.js';
import employees from '../Models/employee.model.js';

const app = express();
app.use(express.json());
app.use("/api/employee/v1", Router);

// MongoDB Memory Server setup
beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/employee-test';
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await employees.deleteMany({});
});

describe('Employee API Tests', () => {


    describe('POST /api/employee/v1/employees', () => {

        it('should create a new employee with valid data', async () => {
            const newEmployee = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                position: 'Software Engineer',
                phone: '1234567890'
            };

            const response = await request(app)
                .post('/api/employee/v1/employees')
                .send(newEmployee)
                .expect(201);

            expect(response.body.status).toBe(true);
            expect(response.body.message).toBe('Employee added sucessfully');
        });

        it('should return 409 for invalid email format', async () => {
            const invalidEmployee = {
                name: 'Jane Doe',
                email: 'invalid-email',
                position: 'Designer'
            };

            const response = await request(app)
                .post('/api/employee/v1/employees')
                .send(invalidEmployee)
                .expect(409);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Entered Email Is Not Valid');
        });

        it('should return 400 when employee already exists', async () => {
            const employee = {
                name: 'John Doe',
                email: 'john@example.com',
                position: 'Developer'
            };


            await request(app)
                .post('/api/employee/v1/employees')
                .send(employee)
                .expect(201);


            const response = await request(app)
                .post('/api/employee/v1/employees')
                .send(employee)
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Employee Allready Exists');
        });

        it('should return 200 for missing required fields', async () => {
            const incompleteEmployee = {
                name: 'John Doe'
            };

            const response = await request(app)
                .post('/api/employee/v1/employees')
                .send(incompleteEmployee)
                .expect(200);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('name,email,position fields are  required');
        });

        it('should create employee without phone number', async () => {
            const employee = {
                name: 'Alice Smith',
                email: 'alice@example.com',
                position: 'Manager'
            };

            const response = await request(app)
                .post('/api/employee/v1/employees')
                .send(employee)
                .expect(201);

            expect(response.body.status).toBe(true);
        });
    });

    // ==================== GET /employees ====================
    describe('GET /api/employee/v1/employees', () => {

        it('should fetch all employees successfully', async () => {
            // Create test employees
            await employees.create([
                { name: 'John', email: 'john@test.com', position: 'Dev' },
                { name: 'Jane', email: 'jane@test.com', position: 'Designer' }
            ]);

            const response = await request(app)
                .get('/api/employee/v1/employees')
                .expect(201);

            expect(response.body.status).toBe(true);
            expect(response.body.message).toBe('Employee Data Fetched Sucessfully');
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).not.toHaveProperty('__v');
            expect(response.body.data[0]).not.toHaveProperty('updatedAt');
        });

        it('should return 400 when no employees exist', async () => {
            const response = await request(app)
                .get('/api/employee/v1/employees')
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('No Employees Found');
            expect(response.body.data).toEqual([]);
        });

        it('should return employees sorted by creation date (newest first)', async () => {
            await employees.create({ name: 'First', email: 'first@test.com', position: 'Dev' });
            await new Promise(resolve => setTimeout(resolve, 10));
            await employees.create({ name: 'Second', email: 'second@test.com', position: 'Dev' });

            const response = await request(app)
                .get('/api/employee/v1/employees')
                .expect(201);

            expect(response.body.data[0].name).toBe('Second');
            expect(response.body.data[1].name).toBe('First');
        });
    });

    // ==================== DELETE /employees/:id ====================
    describe('DELETE /api/employee/v1/employees/:id', () => {

        it('should delete employee successfully', async () => {
            const employee = await employees.create({
                name: 'Delete Me',
                email: 'delete@test.com',
                position: 'Tester'
            });

            const response = await request(app)
                .delete(`/api/employee/v1/employees/${employee._id}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(response.body.message).toBe('Employee Deleted Sucessfully');

            const deletedEmployee = await employees.findById(employee._id);
            expect(deletedEmployee).toBeNull();
        });

        it('should return 400 for invalid employee ID format', async () => {
            const response = await request(app)
                .delete('/api/employee/v1/employees/invalid-id')
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Invalid Employee ID');
        });

        it('should return 404 when employee does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/employee/v1/employees/${fakeId}`)
                .expect(404);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Employee Not Found');
        });
    });

    // ==================== PATCH /employees/:id ====================
    describe('PATCH /api/employee/v1/employees/:id', () => {

        it('should update employee successfully with all fields', async () => {
            const employee = await employees.create({
                name: 'Old Name',
                email: 'old@test.com',
                position: 'Old Position',
                phone: '1111111111'
            });

            const updates = {
                name: 'New Name',
                position: 'New Position',
                phone: '2222222222'
            };

            const response = await request(app)
                .patch(`/api/employee/v1/employees/${employee._id}`)
                .send(updates)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(response.body.message).toBe('Employee Data Updated Sucessfully');

            const updatedEmployee = await employees.findById(employee._id);
            expect(updatedEmployee.name).toBe('New Name');
            expect(updatedEmployee.position).toBe('New Position');
            expect(updatedEmployee.phone).toBe('2222222222');
        });

        it('should update employee with partial data (name only)', async () => {
            const employee = await employees.create({
                name: 'Original',
                email: 'original@test.com',
                position: 'Developer',
                phone: '3333333333'
            });

            const response = await request(app)
                .patch(`/api/employee/v1/employees/${employee._id}`)
                .send({ name: 'Updated Name' })
                .expect(200);

            expect(response.body.status).toBe(true);

            const updated = await employees.findById(employee._id);
            expect(updated.name).toBe('Updated Name');
            expect(updated.position).toBe('Developer');
            expect(updated.phone).toBe('3333333333');
        });

        it('should return 400 for invalid employee ID', async () => {
            const response = await request(app)
                .patch('/api/employee/v1/employees/invalid-id')
                .send({ name: 'Test' })
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Invalid Employee ID');
        });

        it('should return 404 when employee does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .patch(`/api/employee/v1/employees/${fakeId}`)
                .send({ name: 'Test' })
                .expect(404);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Employee Not Found');
        });

        it('should not change email field', async () => {
            const employee = await employees.create({
                name: 'Test',
                email: 'test@example.com',
                position: 'Dev'
            });

            await request(app)
                .patch(`/api/employee/v1/employees/${employee._id}`)
                .send({ name: 'Updated' })
                .expect(200);

            const updated = await employees.findById(employee._id);
            expect(updated.email).toBe('test@example.com');
        });
    });

    // ==================== GET /employees/:id ====================
    describe('GET /api/employee/v1/employees/:id', () => {

        it('should fetch employee by ID successfully', async () => {
            const employee = await employees.create({
                name: 'Fetch Me',
                email: 'fetch@test.com',
                position: 'Developer'
            });

            const response = await request(app)
                .get(`/api/employee/v1/employees/${employee._id}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(response.body.message).toBe('Employee Data Fetched Sucessfully');
            expect(response.body.data).toBeDefined();
            expect(response.body.data).not.toHaveProperty('__v');
            expect(response.body.data).not.toHaveProperty('createdAt');
            expect(response.body.data).not.toHaveProperty('updatedAt');
        });

        it('should return 400 for invalid employee ID', async () => {
            const response = await request(app)
                .get('/api/employee/v1/employees/invalid-id')
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Invalid Employee ID');
        });

        it('should return 404 when employee does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/employee/v1/employees/${fakeId}`)
                .expect(404);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe('Employee Not Found');
        });
    });

    // ==================== Error Handling Tests ====================
    describe('Error Handling', () => {

        it('should handle database errors gracefully', async () => {
            // Close database connection to simulate error
            await mongoose.connection.close();

            const response = await request(app)
                .get('/api/employee/v1/employees')
                .expect(500);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toBeDefined();

            // Reconnect for other tests
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/employee-test');
        });
    });
});