import { CUSTOM_VALIDATION } from "@src/models/user";
import { Response } from "express";
import mongoose, { Error } from "mongoose";


export abstract class BaseController {

    protected sendCreateUpdateErrorResponse(res: Response, error: mongoose.Error.ValidationError | Error): void {
        if (error instanceof mongoose.Error.ValidationError) {
            const clientErrors = this.handleClientErrors(error)
            res.status(clientErrors.code).send(clientErrors)
        } else {
            res.status(500).send({ code: 500, error: 'Internal Server Error' });
        }
    }

    private handleClientErrors(error: mongoose.Error.ValidationError): { code: number, error: string } {
        const duplicatedKindErrors = Object.values(error.errors)
            .filter((err) => err.kind === CUSTOM_VALIDATION.DUPLICATED);
        if (duplicatedKindErrors.length) {
            return { code: 409, error: error.message }
        }
        return { code: 422, error: error.message }

    }
}