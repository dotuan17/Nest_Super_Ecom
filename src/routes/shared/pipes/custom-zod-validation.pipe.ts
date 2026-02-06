import { UnprocessableEntityException } from "@nestjs/common";
import { createZodValidationPipe } from "nestjs-zod";
import { ZodError } from "zod";


const CustomZodValidationPipe = createZodValidationPipe({
    createValidationException: (error: ZodError) => {
        console.log(error.issues);
        return new UnprocessableEntityException(error.issues.map(err => {
            return {
                ...err,
                path: err.path.join('.'),
            }
        }))
    }
});

export default CustomZodValidationPipe;