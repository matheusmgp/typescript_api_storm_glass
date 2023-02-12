
import { Controller, Get, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth.service';
import { Request, Response } from 'express';
import { BaseController } from '.';

@Controller('users')
export class UsersController extends BaseController {
    @Post('')
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const user = new User(req.body);
            const result = await user.save();
            res.status(201).send(result);
        } catch (error: any) {
            this.sendCreateUpdateErrorResponse(res, error);
        }
    }
    @Get(':id')
    public async get(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const result = await User.find({ _id: id });
            res.status(200).send(result);
        } catch (error: any) {
            this.sendCreateUpdateErrorResponse(res, error);
        }
    }
    @Post('auth')
    public async auth(req: Request, res: Response): Promise<Response | undefined> {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({
                code: 401,
                error: 'User not found!',
            });
        }
        if (
            !(await AuthService.comparePassword(password, user.password))
        ) {
            return res
                .status(401)
                .send({ code: 401, error: 'Password does not match!' });
        }
        const token = AuthService.generateToken(user.toJSON());

        return res.send({ ...user.toJSON(), ...{ token } });
    }
}
