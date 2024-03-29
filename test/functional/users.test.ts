import { User } from '@src/models/user';
import AuthService from '@src/services/auth.service'

describe('Users Functional tests', () => {
    beforeAll(async () => await User.deleteMany({}));
    describe('When creating a new user', () => {

        it('should successfully create a new user with encrypted password', async () => {

            const newUser = {
                name: 'Matheus',
                email: 'test@test.com',
                password: '1010'
            }

            const response = await global.testRequest.post('/users').send(newUser);
            //console.log(response.body)
            expect(response.status).toBe(201);
            await expect(AuthService.comparePassword(newUser.password, response.body.password))
                .resolves.toBeTruthy()
            expect(response.body).toEqual(
                expect.objectContaining({
                    ...newUser, ...{ password: expect.any(String) }
                })
            );

        });

        it('should return 422 when there is a validation error', async () => {
            const newUser = {
                email: 'john@mail.com',
                password: '1234',
            };
            const response = await global.testRequest.post('/users').send(newUser);

            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: 'User validation failed: name: Path `name` is required.',
            });
        });

        it('should return 409 when the email already exists', async () => {
            const newUser = {
                name: 'mgp',
                email: 'test@test.com',
                password: '1010',
            };
            await global.testRequest.post('/users').send(newUser);
            const response = await global.testRequest.post('/users').send(newUser);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                code: 409,
                error: 'User validation failed: email: already exists in database',
            });
        });
    });
    describe('When authenticating a user', () => {
        it('should generate a token for a valid user', async () => {
            const newUser = {
                name: 'Mgp',
                email: 'mgp@mgp.com',
                password: '1010'
            };
            await new User(newUser).save();
            const response = await global.testRequest.post('/users/auth')
                .send({ email: newUser.email, password: newUser.password });

            expect(response.body).toEqual(
                expect.objectContaining({ token: expect.any(String) })
            );
        });
        it('should return UNAUTHORIZED if the user with the given email is not found', async () => {

            const response = await global.testRequest.post('/users/auth')
                .send({ email: 'not-exists-email@test.com', password: '1010' });

            expect(response.status).toBe(401);
        });
        it('should return UNAUTHORIZED if the user is found but the password does not match', async () => {

            const response = await global.testRequest.post('/users/auth')
                .send({ email: 'test@test.com', password: 'wrong-pass' });

            expect(response.status).toBe(401);
        });
    });
});